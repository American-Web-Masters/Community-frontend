import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createJournal } from '../../../api';
import LinkedPrayerPicker from './LinkedPrayerPicker';

const MAX_TAGS = 8;

const MOODS = [
  'Joyful',
  'Peaceful',
  'Sad',
  'Grateful',
  'Inspired',
];

const normalizeTags = (tags) =>
  Array.from(
    new Set(
      tags
        .map((t) => String(t || '').trim())
        .filter(Boolean)
        .map((t) => t.replace(/^#/, ''))
    )
  ).slice(0, MAX_TAGS);

/**
 * Contract:
 * - Inputs: { isOpen, onClose, onSuccess, initialData? }
 * - Output: calls createJournal(payload) where payload shape matches backend:
 *   { prayer?: string, description: string, verse?: {quote, reference}, tags?: string[], mood: string }
 */
const CreateJournalModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    description: '',
    verseQuote: '',
    verseReference: '',
    tags: [],
    mood: 'Joyful',
    prayer: null,
  });

  const [newTag, setNewTag] = useState('');
  const [isPrayerPickerOpen, setIsPrayerPickerOpen] = useState(false);

  const title = useMemo(() => (initialData ? 'Edit Journal Entry' : 'Create Journal Entry'), [initialData]);
  const submitLabel = useMemo(() => (initialData ? 'Save Changes' : 'Create Entry'), [initialData]);
  const loadingLabel = useMemo(() => (initialData ? 'Saving…' : 'Creating…'), [initialData]);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setLoading(false);

    if (initialData) {
      // Not requested yet, but keep it forward-compatible.
      setForm({
        description: initialData.description || '',
        verseQuote: initialData?.verse?.quote || '',
        verseReference: initialData?.verse?.reference || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        mood: initialData.mood || 'Joyful',
        prayer: initialData.prayer || null,
      });
      setNewTag('');
      return;
    }

    setForm({
      description: '',
      verseQuote: '',
      verseReference: '',
      tags: [],
      mood: 'Joyful',
      prayer: null,
    });
    setNewTag('');
  }, [isOpen, initialData]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setError('');
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag) return;

    const next = normalizeTags([...(form.tags || []), tag]);
    setForm((p) => ({ ...p, tags: next }));
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setForm((p) => ({ ...p, tags: (p.tags || []).filter((t) => t !== tagToRemove) }));
  };

  const onTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const clearLinkedPrayer = () => setField('prayer', null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payloadVerse =
        form.verseQuote.trim() || form.verseReference.trim()
          ? {
              quote: form.verseQuote.trim(),
              reference: form.verseReference.trim(),
            }
          : undefined;

      const payload = {
        prayer: form.prayer || undefined,
        description: form.description.trim(),
        verse: payloadVerse,
        tags: normalizeTags(form.tags || []),
        mood: form.mood,
      };

      const res = await createJournal(payload);
      onSuccess?.(res);
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create journal entry.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-[11px] sm:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.22em] text-[color:var(--color-primary-700)]">
              REFLECT • RECORD • GROW
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Left */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className="min-h-[160px] sm:min-h-[210px] w-full resize-none rounded-2xl sm:rounded-3xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[color:var(--color-primary-300)]"
                  placeholder="Write your reflection…"
                  disabled={loading}
                  required
                />
              </div>

              <div className="rounded-3xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">Mood</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MOODS.map((m) => {
                    const active = form.mood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setField('mood', m)}
                        className={
                          'px-4 py-2 rounded-full text-sm font-semibold ring-1 ring-black/5 transition cursor-pointer ' +
                          (active ? 'btn-blue-gradient text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                        }
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Linked Prayer (optional)</p>
                    <p className="mt-1 text-xs text-gray-500">Attach one of your prayers to this journal entry.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrayerPickerOpen(true)}
                    className="rounded-2xl bg-[color:var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-700)] transition-colors cursor-pointer disabled:opacity-50"
                    disabled={loading}
                  >
                    {form.prayer ? 'Change' : 'Link'}
                  </button>
                </div>

                {form.prayer ? (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Prayer ID:</span> {form.prayer}
                    </div>
                    <button
                      type="button"
                      onClick={clearLinkedPrayer}
                      className="text-sm font-semibold text-red-600 hover:underline cursor-pointer"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">Verse</p>
                <div className="mt-3 space-y-3">
                  <textarea
                    value={form.verseQuote}
                    onChange={(e) => setField('verseQuote', e.target.value)}
                    className="min-h-[80px] sm:min-h-[92px] w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[color:var(--color-primary-300)]"
                    placeholder="Verse quote…"
                    disabled={loading}
                  />
                  <input
                    value={form.verseReference}
                    onChange={(e) => setField('verseReference', e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[color:var(--color-primary-300)]"
                    placeholder="Reference (e.g., Psalm 23:1)"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">Tags</p>
                <p className="mt-1 text-xs text-gray-500">Add up to {MAX_TAGS} tags (press Enter to add).</p>

                <div className="mt-3 flex gap-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={onTagKeyDown}
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[color:var(--color-primary-300)]"
                    placeholder="e.g., faith"
                    disabled={loading || (form.tags || []).length >= MAX_TAGS}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-2xl bg-[color:var(--color-primary-600)] px-4 py-3 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-700)] transition-colors disabled:opacity-50 cursor-pointer"
                    disabled={loading || !newTag.trim() || (form.tags || []).length >= MAX_TAGS}
                  >
                    Add
                  </button>
                </div>

                {(form.tags || []).length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(form.tags || []).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => removeTag(t)}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary-100)] bg-gray-100 px-3 py-1 text-[12px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                        title="Remove"
                      >
                        #{t}
                        <span className="text-gray-500 text-[16px]">×</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl bg-[color:var(--color-primary-50)] px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-primary-700)]">Tip</p>
                <p className="mt-2 text-sm text-gray-700">
                  Linking a prayer helps you track how God answers over time.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-blue-gradient rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60 cursor-pointer"
              disabled={loading}
            >
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>

      <LinkedPrayerPicker
        isOpen={isPrayerPickerOpen}
        onClose={() => setIsPrayerPickerOpen(false)}
        onSelectPrayer={(prayer) => {
          const id = prayer?._id || prayer?.id;
          if (id) setField('prayer', String(id));
          setIsPrayerPickerOpen(false);
        }}
      />
    </div>
  );
};

export default CreateJournalModal;
