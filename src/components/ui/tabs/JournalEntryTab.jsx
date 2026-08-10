import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { createJournal } from '../../../api';
import LinkedPrayerPicker from '../../../pages/profile/subcomponents/LinkedPrayerPicker';
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

const JournalEntryTab = ({ onClose, onSuccess, initialData }) => {
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
    prayer: initialData?.prayer || null,
    linkedPrayerPreview: initialData?.linkedPrayerPreview || null,
  });

  const [newTag, setNewTag] = useState('');
  const [isPrayerPickerOpen, setIsPrayerPickerOpen] = useState(false);

  const verseQuery = useMemo(() => {
    const book = String(form.verseBook || '').trim();
    const num = String(form.verseNumber || '').trim();
    return book && num ? `${book} ${num}` : '';
  }, [form.verseBook, form.verseNumber]);

  const verseLookup = useBiblePassageLookup(verseQuery, {
    enabled: Boolean(verseQuery),
    debounceMs: 450,
  });

  useEffect(() => {
    if (!verseLookup.data) return;

    setForm((p) => ({
      ...p,
      verseQuote: verseLookup.data.text,
      verseReference: verseLookup.data.reference,
    }));
  }, [verseLookup.data]);

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
    const toastId = toast.loading('Creating journal entry...');

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

      const res = await createJournal(payload);
      toast.success('Journal entry created successfully!', { id: toastId });
      onSuccess?.(res);
      onClose?.();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create journal entry.';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                className="min-h-[160px] sm:min-h-[210px] w-full resize-none rounded-2xl sm:rounded-3xl border border-gray-200/60 bg-white/70 backdrop-blur-sm px-5 py-4 text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 shadow-inner focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                placeholder="Write your reflection…"
                disabled={loading}
                required
              />
            </div>

            <div className="rounded-3xl border border-gray-200 p-4 bg-white">
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
                        'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ' +
                        (active ? 'btn-blue-gradient text-white shadow-md ring-2 ring-blue-400 ring-offset-1' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm')
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

            <div className="rounded-3xl border border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Linked Prayer (optional)</p>
                  <p className="mt-1 text-xs text-gray-500">Attach one of your prayers to this journal entry.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrayerPickerOpen(true)}
                  className="rounded-2xl btn-blue-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0"
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
            <div className="rounded-3xl border border-gray-200 p-4 bg-white">
              <p className="text-sm font-semibold text-gray-800">Verse</p>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    value={form.verseBook}
                    onChange={(e) => setVerseField('verseBook', e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[color:var(--color-primary-300)]"
                    placeholder="Book (e.g., Psalms)"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <input
                    value={form.verseNumber}
                    onChange={(e) => setVerseField('verseNumber', e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[color:var(--color-primary-300)]"
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
                  className="min-h-[80px] sm:min-h-[92px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none"
                  placeholder="Verse text will appear here…"
                  disabled={loading}
                />
                <input
                  value={form.verseReference}
                  readOnly
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none"
                  placeholder="Reference"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 p-4 bg-white">
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
            className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-blue-gradient rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Entry'}
          </button>
        </div>
      </form>

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
    </>
  );
};

export default JournalEntryTab;