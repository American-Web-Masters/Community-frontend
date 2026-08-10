import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createJournal, updateJournal } from '../../../api';
import LinkedPrayerPicker from './LinkedPrayerPicker';
import useBiblePassageLookup from '../../../hooks/useBiblePassageLookup';

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

const splitBibleReference = (reference) => {
  const raw = String(reference || '').trim().replace(/\s+/g, ' ');
  if (!raw) return { book: '', number: '' };

  const parts = raw.split(' ');
  const last = parts[parts.length - 1];
  if (/\d+\s*:\s*\d+/.test(last)) {
    return {
      book: parts.slice(0, -1).join(' '),
      number: last,
    };
  }
  return { book: raw, number: '' };
};

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
    verseBook: '',
    verseNumber: '',
    tags: [],
    mood: 'Joyful',
    privacyLevel: 'private',
    prayer: null,
  linkedPrayerPreview: null,
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
      const ref = splitBibleReference(initialData?.verse?.reference || '');
      const initialPrayerId =
        (typeof initialData?.prayer === 'string' && initialData.prayer) ||
        (typeof initialData?.prayer === 'object' && (initialData?.prayer?._id || initialData?.prayer?.id)) ||
        (typeof initialData?.linkedPrayer === 'string' && initialData.linkedPrayer) ||
        (typeof initialData?.linkedPrayer === 'object' && (initialData?.linkedPrayer?._id || initialData?.linkedPrayer?.id)) ||
        null;

      const linkedPrayerObj =
        (typeof initialData?.prayer === 'object' && initialData?.prayer) ||
        (typeof initialData?.linkedPrayer === 'object' && initialData?.linkedPrayer) ||
        null;

      setForm({
        description: initialData.description || '',
        verseQuote: initialData?.verse?.quote || '',
        verseReference: initialData?.verse?.reference || '',
        verseBook: ref.book || '',
        verseNumber: ref.number || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        mood: initialData.mood || 'Joyful',
        privacyLevel: initialData.privacyLevel || 'private',
        prayer: initialPrayerId ? String(initialPrayerId) : null,
        linkedPrayerPreview: linkedPrayerObj
          ? String(linkedPrayerObj?.content || linkedPrayerObj?.description || '').trim() || null
          : null,
      });
      setNewTag('');
      return;
    }

    setForm({
      description: '',
      verseQuote: '',
      verseReference: '',
      verseBook: '',
      verseNumber: '',
      tags: [],
      mood: 'Joyful',
      privacyLevel: 'private',
      prayer: null,
  linkedPrayerPreview: null,
    });
    setNewTag('');
  }, [isOpen, initialData]);

  const verseQuery = useMemo(() => {
    const book = String(form.verseBook || '').trim();
    const num = String(form.verseNumber || '').trim();
    return book && num ? `${book} ${num}` : '';
  }, [form.verseBook, form.verseNumber]);

  const verseLookup = useBiblePassageLookup(verseQuery, {
    enabled: Boolean(isOpen && verseQuery),
    debounceMs: 450,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!verseLookup.data) return;

    setForm((p) => ({
      ...p,
      verseQuote: verseLookup.data.text,
      verseReference: verseLookup.data.reference,
    }));
  }, [isOpen, verseLookup.data]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setError('');
  };

  const setVerseField = (key, value) => {
    setForm((p) => ({
      ...p,
      [key]: value,
      verseQuote: key === 'verseBook' || key === 'verseNumber' ? '' : p.verseQuote,
      verseReference: key === 'verseBook' || key === 'verseNumber' ? '' : p.verseReference,
    }));
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

  const clearLinkedPrayer = () => {
    setField('prayer', null);
    setField('linkedPrayerPreview', null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }

    const hasVerseInput = Boolean(String(form.verseBook || '').trim() || String(form.verseNumber || '').trim());
    if (hasVerseInput) {
      if (verseLookup.loading) {
        setError('Please wait for the verse to finish loading.');
        return;
      }

      if (verseLookup.error) {
        setError(verseLookup.error || 'Please enter a valid verse reference.');
        return;
      }

      if (!String(form.verseQuote || '').trim() || !String(form.verseReference || '').trim()) {
        setError('Verse could not be loaded. Please check the reference.');
        return;
      }
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
        privacyLevel: form.privacyLevel,
      };

      const res = initialData?.id
        ? await updateJournal(initialData.id, payload)
        : await createJournal(payload);
      onSuccess?.(res);
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        (initialData ? 'Failed to update journal entry.' : 'Failed to create journal entry.')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out p-2 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-[11px] sm:text-sm font-semibold text-[color:var(--color-primary-700)]">
              Reflect • Record • Grow
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 hover:rotate-90 hover:shadow-sm active:scale-90 transition-all duration-300"
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
                  className="min-h-[160px] sm:min-h-[210px] w-full resize-none rounded-2xl sm:rounded-3xl border border-gray-200 px-5 py-4 text-gray-800 placeholder-gray-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 bg-white/70 backdrop-blur-sm shadow-inner transition-all duration-300"
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

              <div className="rounded-3xl border border-gray-200 p-4 bg-white">
                <p className="text-sm font-semibold text-gray-800 mb-3">Privacy</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setField('privacyLevel', 'public')}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                      form.privacyLevel === 'public'
                        ? 'bg-blue-100 text-blue-700 shadow-md ring-2 ring-blue-400 ring-offset-1'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setField('privacyLevel', 'private')}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                      form.privacyLevel === 'private'
                        ? 'bg-blue-100 text-blue-700 shadow-md ring-2 ring-blue-400 ring-offset-1'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Private
                  </button>
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
                    className="rounded-2xl bg-[color:var(--color-primary-600)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-700)] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                    disabled={loading}
                  >
                    {form.prayer ? 'Change' : 'Link'}
                  </button>
                </div>

                {form.prayer ? (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3">
                    <div className="text-sm text-gray-700">
                      <div className="font-semibold text-gray-800">Prayer Description</div>
                      {form.linkedPrayerPreview ? (
                        <p className="mt-0.5 text-sm text-gray-700 break-words whitespace-normal">{form.linkedPrayerPreview}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-gray-500">A prayer is linked.</p>
                      )}
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={form.verseBook}
                      onChange={(e) => setVerseField('verseBook', e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-5 py-3.5 text-gray-800 placeholder-gray-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 bg-white/70 backdrop-blur-sm shadow-inner transition-all duration-300"
                      placeholder="Book (e.g., Psalms)"
                      disabled={loading}
                      autoComplete="off"
                    />
                    <input
                      value={form.verseNumber}
                      onChange={(e) => setVerseField('verseNumber', e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-5 py-3.5 text-gray-800 placeholder-gray-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 bg-white/70 backdrop-blur-sm shadow-inner transition-all duration-300"
                      placeholder="Chapter:Verse (e.g., 23:1)"
                      disabled={loading}
                      autoComplete="off"
                    />
                  </div>

                  {verseLookup.loading ? (
                    <p className="text-xs text-gray-500">Fetching verse…</p>
                  ) : null}

                  {verseLookup.error ? (
                    <p className="text-xs text-red-600">{verseLookup.error}</p>
                  ) : null}

                  <textarea
                    value={form.verseQuote}
                    readOnly
                    className="min-h-[80px] sm:min-h-[92px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-800 placeholder-gray-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 bg-white/70 backdrop-blur-sm shadow-inner transition-all duration-300"
                    placeholder="Verse text will appear here…"
                    disabled={loading}
                  />
                  <input
                    value={form.verseReference}
                    readOnly
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-800 placeholder-gray-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 bg-white/70 backdrop-blur-sm shadow-inner transition-all duration-300"
                    placeholder="Reference"
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
                    className="flex-1 rounded-2xl border border-gray-200 px-5 py-3.5 text-gray-800 placeholder-gray-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 bg-white/70 backdrop-blur-sm shadow-inner transition-all duration-300"
                    placeholder="e.g., faith"
                    disabled={loading || (form.tags || []).length >= MAX_TAGS}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-2xl bg-[color:var(--color-primary-600)] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-700)] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
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
              className="rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-300 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-blue-gradient rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
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
          if (id) {
            setField('prayer', String(id));
            const preview = String(prayer?.content || prayer?.description || '').trim();
            setField('linkedPrayerPreview', preview || null);
          }
          setIsPrayerPickerOpen(false);
        }}
      />
    </div>
  );
};

export default CreateJournalModal;
