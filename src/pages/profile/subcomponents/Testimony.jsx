import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clampText, formatRelativeTime, formatTimelineDate, getInitials} from '../../../utils/profileUtils';



const Testimony = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const TagPill = ({ label }) => (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-primary-100)] bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-[color:var(--color-primary-600)]">
      {String(label).toUpperCase()}
    </span>
  );
  
  const QuoteBlock = ({ quote, reference }) => (
    <div className="rounded-2xl bg-[#FBF8E8] px-6 py-7 text-center">
      <p className="mx-auto max-w-lg font-serif text-lg italic text-gray-800">
        “{quote}”
      </p>
      {reference ? (
        <p className="mt-3 text-xs font-semibold tracking-[0.25em] text-gray-500">
          — {reference.toUpperCase()}
        </p>
      ) : null}
    </div>
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);



  // Mock data (random-ish) - replace with API later
  const testimonies = useMemo(
    () => [
      {
        id: 't1',
        authorName: 'Sarah Jenkins',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        excerpt:
          "After years of struggling with anxiety and feeling distant from God, a single moment of surrender changed everything for me…",
        description:
          "After years of struggling with anxiety and feeling distant from God, a single moment of surrender changed everything for me.\n\nI was sitting in my car in a parking lot, overwhelmed by life, when I simply said, ‘God, I can't do this alone anymore.’ What followed was a peace I had never experienced. It wasn't that my circumstances changed overnight, but my perspective shifted entirely.\n\nI started seeing His hand in the small things—a friend's call at just the right time, a verse that spoke directly to my situation. Over the past year, I've learned that faith isn't about having all the answers; it's about trusting the One who does.",
        verse: {
          quote: 'He leads me beside quiet waters, he refreshes my soul.',
          reference: 'Psalm 23:2–3',
        },
        tags: ['Restoration', 'Peace', 'Surrender'],
      },
      {
        id: 't2',
        authorName: 'Marcus Rivera',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        excerpt:
          'My marriage was falling apart. We were two strangers living under the same roof, until we decided to let God into our brokenness…',
        description:
          "My marriage was falling apart. We were two strangers living under the same roof, carrying years of disappointment and unspoken resentment.\n\nOne night, instead of arguing, we prayed—awkwardly at first—asking God to soften our hearts. It didn't fix everything instantly, but it gave us a starting point.\n\nWe began choosing humility over pride, listening instead of defending, and seeking counsel. The biggest miracle wasn't a dramatic moment—it was the daily grace to try again, and the steady rebuilding of trust.",
        verse: {
          quote: 'Love is patient, love is kind.',
          reference: '1 Corinthians 13:4',
        },
        tags: ['Marriage', 'Healing', 'Grace'],
      },
    ],
    []
  );

  const selected = useMemo(
    () => testimonies.find((t) => t.id === selectedId) || null,
    [selectedId, testimonies]
  );

  return (
    <div className="">
      {testimonies.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Testimonies Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't shared any testimonies yet. Share your faith journey and inspire others with your experiences.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-blue-gradient px-8 py-4 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Share Your Testimony
          </button>
        </div>
      ) : (
        <div className="space-y-7">
          {testimonies.map((testimony, idx) => {
            const isExpanded = selectedId === testimony.id;

            return (
              <div key={testimony.id} className="relative">
                {/* Timeline spine + dot */}
                <div className="absolute left-0 top-0 bottom-0 flex w-12 flex-col items-center">
                  {/* Top spacer */}
                  <div className="h-6" />
                  {/* Dot */}
                  <div className="relative">
                    <span className="block h-3.5 w-3.5 rounded-full bg-[color:var(--color-primary-800)] ring-4 ring-white shadow-sm" />
                  </div>
                  {/* Line */}
                  {idx !== testimonies.length - 1 ? (
                    <div className="mt-2 w-[2px] flex-1 rounded-full bg-[color:var(--color-primary-100)]" />
                  ) : (
                    <div className="mt-2 w-[2px] flex-1" />
                  )}
                </div>

                <div className="pl-12">
                  <div className="mb-2 pl-1">
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-[color:var(--color-primary-700)]">
                      {formatTimelineDate(testimony.createdAt)}
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-400 tracking-wide">{formatRelativeTime(testimony.createdAt)}</span>
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white shadow-sm border border-gray-200 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {testimony.avatarUrl ? (
                          <img
                            src={testimony.avatarUrl}
                            alt=""
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-800)] flex items-center justify-center font-bold">
                            {getInitials(testimony.authorName)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {testimony.authorName}
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <button
                          onClick={() => setSelectedId(null)}
                          className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Close
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <p className="text-[15px] leading-7 text-gray-600">
                        {isExpanded
                          ? testimony.description
                          : clampText(testimony.excerpt || testimony.description, 140)}
                      </p>
                    </div>

                    {/* Expand section (inline, smooth) */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                      aria-hidden={!isExpanded}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-6 space-y-4">
                          {testimony.verse?.quote ? (
                            <QuoteBlock
                              quote={testimony.verse.quote}
                              reference={testimony.verse.reference}
                            />
                          ) : null}

                          {Array.isArray(testimony.tags) && testimony.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {testimony.tags.map((t) => (
                                <TagPill key={t} label={t} />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedId((curr) => (curr === testimony.id ? null : testimony.id))}
                      className="mt-5 text-sm font-semibold text-gray-900 hover:text-[color:var(--color-primary-700)] transition-colors inline-flex items-center gap-2"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Show less' : 'Read Full Story'}{' '}
                      <span aria-hidden className="text-[color:var(--color-primary-700)]">
                        {isExpanded ? '↑' : '→'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Testimony;