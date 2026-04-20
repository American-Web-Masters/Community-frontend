import React, { useEffect, useMemo, useState } from "react";
import { FaRegCommentDots, FaSyncAlt } from "react-icons/fa";
import { HiOutlineChatBubbleLeft } from "react-icons/hi2";
import toast from "react-hot-toast";

import { addForumReply, getForums } from "../../../api/forums";

const getInitials = (name = "User") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const toDisplayName = (user) => {
  if (!user || typeof user === "string") return "Community member";
  return user.fullname || user.username || user.name || "Community member";
};

const toAvatar = (user) => {
  if (!user || typeof user === "string") return "";
  return user.profileImage || user.avatar || user.image || "";
};

const normalizeReply = (reply) => {
  if (!reply) return null;

  return {
    id: reply._id || reply.id,
    text: reply.replyText || reply.text || "",
    user: reply.user || null,
    createdAt: reply.createdAt || null,
  };
};

const normalizeForum = (forum) => {
  if (!forum) return null;

  const replies = Array.isArray(forum.replies)
    ? forum.replies.map(normalizeReply).filter(Boolean)
    : [];

  return {
    id: forum._id || forum.id,
    title: forum.title || forum.questionTitle || forum.subject || "Untitled question",
    preview:
      forum.questionDescription ||
      forum.questionText ||
      forum.description ||
      forum.content ||
      "",
    questionDescription: forum.questionDescription || forum.questionText || forum.description || "",
    user: forum.user || forum.createdBy || null,
    createdAt: forum.createdAt || null,
    replies,
  };
};

const formatTime = (iso) => {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString();
};

const DashboardForumCard = ({
  forum,
  isReplyOpen,
  draftReply,
  isSubmitting,
  onToggleReply,
  onDraftChange,
  onSubmitReply,
}) => {
  const displayName = toDisplayName(forum.user);
  const avatarUrl = toAvatar(forum.user);

  return (
    <article className="w-full rounded-[10px] border border-[#d4e6fa] bg-white/95 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4 border-l-[5px] border-l-[#0b2f90] rounded-[10px]">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full flex-shrink-0 bg-primary-100 text-primary-700 flex items-center justify-center text-[12px] font-semibold">
            {getInitials(displayName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-semibold leading-tight text-[#0f2f6a]">
            {forum.title}
          </h3>

          {forum.preview ? (
            <p className="mt-1 text-[15px] text-[#6f7f99] leading-snug">{forum.preview}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-10 gap-y-2 text-[12px] text-[#7b8492]">
            <span>{displayName}</span>
            {forum.createdAt ? <span>{formatTime(forum.createdAt)}</span> : null}
            <span className="inline-flex items-center gap-1">
              <HiOutlineChatBubbleLeft className="w-3.5 h-3.5" />
              {forum.replies.length} replies
            </span>

            <button
              type="button"
              onClick={onToggleReply}
              aria-expanded={isReplyOpen}
              className="inline-flex items-center gap-2 font-semibold text-[#0b2f90] hover:underline cursor-pointer"
            >
              Reply
            </button>
          </div>

          {forum.replies.length > 0 ? (
            <div className="mt-4 space-y-2">
              {forum.replies.map((reply) => (
                <div key={reply.id || `${forum.id}-${reply.text}`} className="rounded-[8px] border border-primary-100 bg-primary-50/40 px-3 py-2">
                  <div className="text-[13px] text-[#0b2f90] font-semibold">
                    {toDisplayName(reply.user)}
                  </div>
                  <div className="text-[13px] text-[#51627d] mt-0.5">{reply.text}</div>
                </div>
              ))}
            </div>
          ) : null}

          {isReplyOpen ? (
            <form onSubmit={onSubmitReply} className="mt-4">
              <textarea
                value={draftReply}
                onChange={(e) => onDraftChange(e.target.value)}
                placeholder="Write your reply..."
                className="w-full min-h-[96px] px-3 py-2 rounded-[10px] border border-primary-100 bg-white text-[14px] text-primary-800 placeholder:text-primary-300 outline-none resize-none"
                disabled={isSubmitting}
              />

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={
                    "px-5 py-2 rounded-full btn-blue-gradient text-white text-[12px] font-semibold " +
                    (isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-95")
                  }
                >
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const DashboardForum = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [replyOpenById, setReplyOpenById] = useState({});
  const [replyDraftById, setReplyDraftById] = useState({});
  const [replySubmittingById, setReplySubmittingById] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getForums();
      const forums = Array.isArray(data?.data?.forums) ? data.data.forums : [];
      setItems(forums.map(normalizeForum).filter(Boolean));
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load forums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    if (loading || refreshing) return;
    try {
      setRefreshing(true);
      await load();
      toast.success("Refreshed");
    } catch {
      // load handles errors
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((forum) => {
      const haystack = `${forum.title} ${forum.preview} ${forum.questionDescription || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const onToggleReply = (forumId) => {
    setReplyOpenById((cur) => ({ ...cur, [forumId]: !cur[forumId] }));
  };

  const onDraftChange = (forumId, value) => {
    setReplyDraftById((cur) => ({ ...cur, [forumId]: value }));
  };

  const onSubmitReply = async (e, forumId) => {
    e.preventDefault();

    const draft = String(replyDraftById[forumId] || "").trim();
    if (!draft) {
      toast.error("Reply text is required");
      return;
    }

    try {
      setReplySubmittingById((cur) => ({ ...cur, [forumId]: true }));

      const data = await addForumReply(forumId, draft);
      const createdReply = normalizeReply(data?.data?.reply);

      if (createdReply) {
        setItems((cur) =>
          cur.map((forum) =>
            forum.id === forumId
              ? { ...forum, replies: [...forum.replies, createdReply] }
              : forum,
          ),
        );
      } else {
        await load();
      }

      setReplyDraftById((cur) => ({ ...cur, [forumId]: "" }));
      toast.success("Reply added successfully");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to add reply");
    } finally {
      setReplySubmittingById((cur) => ({ ...cur, [forumId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white shadow-sm border border-black/5 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Forum</h1>
            <p className="text-sm text-gray-500 mt-1">View all forum questions and reply from admin dashboard.</p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className={
              "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-black/5 hover:bg-black/10 text-sm font-semibold transition-colors " +
              ((loading || refreshing) ? "opacity-60 cursor-not-allowed" : "")
            }
            disabled={loading || refreshing}
          >
            <FaSyncAlt className={(refreshing || loading) ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            {refreshing || loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5">
          <div className="relative">
            <FaRegCommentDots className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search forum by title or question..."
              className="w-full h-11 pl-6 pr-3 rounded-2xl border border-black/10 bg-white/80 backdrop-blur outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>
      </div>

      <section className="space-y-3">
        {loading ? (
          <article className="rounded-md border border-[#d6e8fa] bg-white/95 px-4 py-5 text-[#12356c]">
            Loading forums...
          </article>
        ) : error ? (
          <article className="rounded-md border border-[#f6caca] bg-white/95 px-4 py-5 text-red-600">
            {error}
          </article>
        ) : filtered.length === 0 ? (
          <article className="rounded-md border border-[#d6e8fa] bg-white/95 px-4 py-5 text-[#12356c]">
            No forums found.
          </article>
        ) : (
          filtered.map((forum) => (
            <DashboardForumCard
              key={forum.id}
              forum={forum}
              isReplyOpen={Boolean(replyOpenById[forum.id])}
              draftReply={replyDraftById[forum.id] || ""}
              isSubmitting={Boolean(replySubmittingById[forum.id])}
              onToggleReply={() => onToggleReply(forum.id)}
              onDraftChange={(value) => onDraftChange(forum.id, value)}
              onSubmitReply={(e) => onSubmitReply(e, forum.id)}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default DashboardForum;
