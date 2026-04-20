const BIBLE_API_BASE_URL = 'https://bible-api.com';

const cache = new Map();

const normalizeQueryKey = (query) => String(query || '').trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Fetch a Bible verse/passage from bible-api.com.
 *
 * @param {string} query Example: "Psalm 118:24" or "1 John 2:3-5"
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<{ reference: string, text: string, translation_id?: string, translation_name?: string }>} 
 */
export const fetchBiblePassage = async (query, options = {}) => {
  const cleaned = String(query || '').trim();
  if (!cleaned) {
    throw new Error('Verse query is required.');
  }

  const key = normalizeQueryKey(cleaned);
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `${BIBLE_API_BASE_URL}/${encodeURIComponent(cleaned)}`;

  const promise = (async () => {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message = data?.error || data?.message || `Bible API request failed (${res.status}).`;
      throw new Error(message);
    }

    const reference = String(data?.reference || '').trim();
    const text = String(data?.text || '').trim();

    if (!reference || !text) {
      throw new Error('Bible API returned an unexpected response.');
    }

    return {
      reference,
      text,
      translation_id: data?.translation_id,
      translation_name: data?.translation_name,
    };
  })();

  cache.set(key, promise);

  try {
    return await promise;
  } catch (e) {
    // Don’t poison the cache with failures.
    cache.delete(key);
    throw e;
  }
};
