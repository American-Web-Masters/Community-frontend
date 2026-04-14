import React, { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

import {
  createFaq,
  deleteFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
} from "../../../api/faqs";

const CATEGORIES = [
  { value: "notification", label: "Notification" },
  { value: "communities", label: "Communities" },
  { value: "profile", label: "Profile" },
];

const normalizeFaq = (faq) => {
  if (!faq) return null;
  return {
    id: faq._id || faq.id,
    category: (faq.category || "").toLowerCase(),
    question: faq.question || "",
    answeres: faq.answeres || faq.answer || "",
    createdAt: faq.createdAt || null,
    updatedAt: faq.updatedAt || null,
  };
};

const emptyForm = {
  category: "notification",
  question: "",
  answeres: "",
};

const DashboardFaqs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [mode, setMode] = useState("create"); // create | edit
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllFaqs();
      const faqs = Array.isArray(data?.data?.faqs) ? data.data.faqs : [];
      setItems(faqs.map(normalizeFaq).filter(Boolean));
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((faq) => {
      if (categoryFilter !== "all" && faq.category !== categoryFilter) {
        return false;
      }

      if (!q) return true;

      const haystack = `${faq.question} ${faq.answeres} ${faq.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search, categoryFilter]);

  const startCreate = () => {
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm);
  };

  const startEdit = async (faqId) => {
    try {
      setSaving(true);
      setMode("edit");
      setSelectedId(faqId);

      // Fetch by id so edit uses the freshest server state
      const data = await getFaqById(faqId);
      const faq = normalizeFaq(data?.data?.faq);
      if (!faq) throw new Error("FAQ not found");

      setForm({
        category: faq.category || "notification",
        question: faq.question || "",
        answeres: faq.answeres || "",
      });
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || e.message || "Failed to load FAQ");
      startCreate();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (faqId) => {
    const target = items.find((f) => f.id === faqId);
    const ok = window.confirm(
      `Delete this FAQ?\n\n${target?.question || ""}`.trim(),
    );
    if (!ok) return;

    const previous = items;
    setItems((cur) => cur.filter((x) => x.id !== faqId));

    try {
      await deleteFaq(faqId);
      toast.success("FAQ deleted");

      if (selectedId === faqId) {
        startCreate();
      }
    } catch (e) {
      console.error(e);
      setItems(previous);
      toast.error(e?.response?.data?.message || "Failed to delete FAQ");
    }
  };

  const validate = () => {
    const categoryOk = CATEGORIES.some((c) => c.value === String(form.category).toLowerCase());
    if (!categoryOk) return "Please select a valid category";
    if (!form.question.trim()) return "Question is required";
    if (!form.answeres.trim()) return "Answer is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const message = validate();
    if (message) {
      toast.error(message);
      return;
    }

    try {
      setSaving(true);

      if (mode === "create") {
        const data = await createFaq({
          category: form.category,
          question: form.question,
          answeres: form.answeres,
        });
        const created = normalizeFaq(data?.data?.faq);

        if (created) {
          setItems((cur) => [created, ...cur]);
        } else {
          await load();
        }

        toast.success("FAQ created");
        startCreate();
      } else {
        const faqId = selectedId;
        if (!faqId) throw new Error("No FAQ selected");

        const data = await updateFaq(faqId, {
          category: form.category,
          question: form.question,
          answeres: form.answeres,
        });

        const updated = normalizeFaq(data?.data?.faq);

        if (updated) {
          setItems((cur) => cur.map((x) => (x.id === faqId ? updated : x)));
        } else {
          await load();
        }

        toast.success("FAQ updated");
        startCreate();
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white shadow-sm border border-black/5 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">Admin</div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">FAQs</h1>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and remove FAQs shown in the Help Center.</p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl btn-blue-gradient text-white text-sm font-semibold"
          >
            <FaPlus className="h-4 w-4" />
            New FAQ
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by question, answer, or category..."
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-black/10 bg-white outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-black/10 bg-white outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 rounded-2xl bg-white shadow-sm border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">All FAQs</div>
            <button
              type="button"
              onClick={load}
              className="text-sm px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10"
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-5 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">No FAQs found.</div>
          ) : (
            <ul className="divide-y divide-black/5">
              {filtered.map((faq) => {
                const isSelected = selectedId === faq.id && mode === "edit";

                return (
                  <li key={faq.id} className={isSelected ? "bg-primary-50/40" : "bg-white"}>
                    <div className="p-5 flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-black/5 text-gray-700">
                            {(faq.category || "").toUpperCase()}
                          </span>
                          {faq.createdAt ? (
                            <span className="text-[11px] text-gray-400">
                              {new Date(faq.createdAt).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 font-semibold text-gray-900 truncate">{faq.question || "(No question)"}</div>
                        <div className="mt-1 text-sm text-gray-600 line-clamp-2">{faq.answeres || "(No answer)"}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(faq.id)}
                          className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center"
                          title="Edit"
                          disabled={saving && selectedId === faq.id}
                        >
                          <FaEdit className="h-4 w-4 text-gray-800" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(faq.id)}
                          className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center"
                          title="Delete"
                          disabled={saving && selectedId === faq.id}
                        >
                          <FaTrash className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="rounded-2xl bg-white shadow-sm border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5">
            <div className="text-sm font-semibold text-gray-900">
              {mode === "create" ? "Create FAQ" : "Edit FAQ"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {mode === "create"
                ? "Add a new FAQ entry."
                : "Update the selected FAQ and save."}
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="mt-2 w-full h-11 px-3 rounded-xl border border-black/10 bg-white outline-none focus:ring-2 focus:ring-primary-200"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Question</label>
              <input
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                className="mt-2 w-full h-11 px-3 rounded-xl border border-black/10 bg-white outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Type the question..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Answer</label>
              <textarea
                value={form.answeres}
                onChange={(e) => setForm((p) => ({ ...p, answeres: e.target.value }))}
                className="mt-2 w-full min-h-[140px] px-3 py-3 rounded-xl border border-black/10 bg-white outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                placeholder="Type the answer..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-11 rounded-xl btn-blue-gradient text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : mode === "create" ? "Create" : "Update"}
              </button>

              {mode === "edit" ? (
                <button
                  type="button"
                  onClick={startCreate}
                  className="h-11 px-4 rounded-xl bg-black/5 hover:bg-black/10 text-sm font-semibold text-gray-800"
                  disabled={saving}
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <div className="text-[11px] text-gray-400 leading-relaxed">
              Note: These endpoints are admin-protected on the backend.
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default DashboardFaqs;
