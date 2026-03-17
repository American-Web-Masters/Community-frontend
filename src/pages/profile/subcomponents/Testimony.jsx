import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { clampText, formatRelativeTime, formatTimelineDate, getInitials} from '../../../utils/profileUtils';
import { getTestimonyByUser } from '../../../api';
import CreateTestimonyModal from '../../../components/ui/CreateTestimonyModal';



const Testimony = forwardRef(({ userProfile }, ref) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const itemRefs = useRef({});
  const listRef = useRef(null);
  const spineRef = useRef(null);
  const [spineFill, setSpineFill] = useState(0);
  const expandRefs = useRef({});
  const [expandHeights, setExpandHeights] = useState({});
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Expose modal open to parent (Profile tab button)
  useImperativeHandle(ref, () => ({
    openCreateModal: () => setIsCreateOpen(true),
  }));

  const TagPill = ({ label }) => (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-primary-100)] bg-gray-200 px-3 py-1 text-[11px] font-semibold tracking-wide text-gray-600">
      {String(label).toUpperCase()}
    </span>
  );
  
  const QuoteBlock = ({ quote, reference }) => (
    <div className="rounded-2xl bg-primary-100 px-6 py-7 text-center">
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

  const userId = userProfile?.user?._id

  useEffect(() => {
    let mounted = true;

    const fetchTestimonies = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await getTestimonyByUser(userId);
        console.log(res)
        const items = res?.data?.testimonies || [];

        const mapped = items.map((t) => {
          const first = t?.author?.firstname || '';
          const last = t?.author?.lastname || '';
          const full = `${first} ${last}`.trim() || t?.author?.username || 'User';
          const username = t?.author?.username ? `@${t.author.username}` : null;
          const description = t?.description || '';
          return {
            id: t?._id,
            authorName: full,
            authorUsername: username,
            createdAt: t?.createdAt,
            description,
            verse: t?.verse,
            tags: Array.isArray(t?.tags) ? t.tags : [],
          };
        });

        if (mounted) setTestimonies(mapped);
      } catch (e) {
        if (mounted) {
          setError('Failed to load testimonies.');
          setTestimonies([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTestimonies();
    return () => {
      mounted = false;
    };
  }, [userId, refreshKey]);

  // Scroll interaction: highlight the timeline dot/line for the testimony currently in view.
  useEffect(() => {
    const nodes = Object.entries(itemRefs.current)
      .map(([id, el]) => ({ id, el }))
      .filter((x) => x.el);

    if (nodes.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // pick the most visible intersecting item
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

        if (visible.length > 0) {
          const id = visible[0].target?.dataset?.testimonyId;
          if (id) setActiveId(id);
        }
      },
      {
        root: null,
        // Favor the item near the center of the viewport
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0.05, 0.15, 0.35, 0.55, 0.75],
      }
    );

    nodes.forEach(({ el }) => obs.observe(el));
    return () => obs.disconnect();
  }, [testimonies]);

  // Animate the shared spine fill as the user scrolls down the list.
  useEffect(() => {
    const listEl = listRef.current;
    const spineEl = spineRef.current;
    if (!listEl || !spineEl) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = listEl.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;

      // Map scroll progress through the list to [0..1]
      // Start filling when the list hits ~70% of the viewport; finish when it passes ~30%.
      const start = viewportH * 0.7;
      const end = viewportH * 0.3;
      const raw = (start - rect.top) / Math.max(1, rect.height - (start - end));
      const p = Math.max(0, Math.min(1, raw));
      setSpineFill(p);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [testimonies]);

  const selected = useMemo(
    () => testimonies.find((t) => t.id === selectedId) || null,
    [selectedId, testimonies]
  );

  // Measure expanded content height for smooth open/close without max-height guessing.
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const next = {};
      for (const t of testimonies) {
        const el = expandRefs.current[t.id];
        if (el) next[t.id] = el.scrollHeight;
      }
      setExpandHeights(next);
    });

    for (const t of testimonies) {
      const el = expandRefs.current[t.id];
      if (el) ro.observe(el);
    }

    // initial measure
    const initial = {};
    for (const t of testimonies) {
      const el = expandRefs.current[t.id];
      if (el) initial[t.id] = el.scrollHeight;
    }
    setExpandHeights(initial);

    return () => ro.disconnect();
  }, [testimonies]);

  return (
    <div className="pr-2 md:p-0">
      <CreateTestimonyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[color:var(--color-primary-600)]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Couldn't load testmonies</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
        </div>
      ) : testimonies.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Testimonies Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't shared any testimonies yet. Share your faith journey and inspire others with your experiences.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-blue-gradient px-8 py-4 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Share Your Testimony
          </button>
        </div>
      ) : (
        <div className="relative" ref={listRef}>
          {/* One continuous spine for the whole timeline */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 flex w-12 justify-center">
            <div className="relative w-[2px] rounded-full bg-[color:var(--color-primary-100)] overflow-hidden">
              <div
                ref={spineRef}
                className="absolute inset-0 origin-top bg-[color:var(--color-primary-700)] transition-transform duration-300 ease-out"
                style={{ transform: `scaleY(${spineFill})` }}
              />
            </div>
          </div>

          <div className="space-y-7">
          {testimonies.map((testimony, idx) => {
            const isExpanded = selectedId === testimony.id;
            const isActive = (activeId || testimonies[0]?.id) === testimony.id;
            const activeIndex = Math.max(
              0,
              testimonies.findIndex((t) => t.id === (activeId || testimonies[0]?.id))
            );
            const isCompleted = idx < activeIndex;
            const isCurrentOrCompleted = isActive || isCompleted;

            return (
              <div
                key={testimony.id}
                className="relative"
                ref={(el) => {
                  if (el) itemRefs.current[testimony.id] = el;
                }}
                data-testimony-id={testimony.id}
              >
                {/* Dot (on top of the shared spine) */}
                <div className="absolute left-0 top-11 flex w-12 justify-center">
                  <div className="relative">
                    <span
                      className={
                        "block h-4 w-4 rounded-full bg-[color:var(--color-primary-800)] ring-4 ring-white shadow-sm transition-all duration-500 " +
                        (isCurrentOrCompleted
                          ? "scale-110 shadow-md ring-[color:var(--color-primary-100)]"
                          : "scale-100 opacity-80")
                      }
                    />
                    <span
                      className={
                        "pointer-events-none absolute inset-0 rounded-full bg-[color:var(--color-primary-300)]/30 blur-[1px] transition-all duration-500 " +
                        (isActive ? "scale-[2.2] opacity-100" : "scale-[1.2] opacity-0")
                      }
                    />
                  </div>
                </div>

                <div className="pl-12">
                  <div className="mb-2 pl-1">
                    <p className="text-[12px] font-semibold tracking-[0.22em] text-[color:var(--color-primary-700)]">
                      {formatTimelineDate(testimony.createdAt)}
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-700 tracking-wide">{formatRelativeTime(testimony.createdAt)}</span>
                    </p>
                  </div>

                  <div
                    className={
                      "rounded-2xl bg-[#fffffff6] shadow-sm border px-6 py-5 transition-[border-color,box-shadow,transform] duration-500 " +
                      (isActive
                        ? "border-[color:var(--color-primary-200)] shadow-md"
                        : "border-gray-200")
                    }
                  >
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
                          {testimony.authorUsername ? (
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">
                              {testimony.authorUsername}
                            </p>
                          ) : null}
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
                      <p className="text-[15px] leading-7 text-gray-600 whitespace-pre-line">
                        {isExpanded
                          ? testimony.description
                          : clampText(testimony.description, 140)}
                      </p>
                    </div>

                    {/* Expand section (inline, smooth) */}
                    <div
                      className="overflow-hidden transition-[height,opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-[height,opacity,transform]"
                      style={{
                        height: isExpanded ? `${expandHeights[testimony.id] || 0}px` : '0px',
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? 'translateY(0px)' : 'translateY(-6px)',
                      }}
                      aria-hidden={!isExpanded}
                    >
                      <div
                        ref={(el) => {
                          if (el) expandRefs.current[testimony.id] = el;
                        }}
                        className="pt-6 space-y-4"
                      >
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

                    <button
                      onClick={() => setSelectedId((curr) => (curr === testimony.id ? null : testimony.id))}
                      className="mt-5 text-sm font-semibold text-gray-900 hover:text-[color:var(--color-primary-700)] transition-colors inline-flex items-center gap-2 cursor-pointer"
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
        </div>
      )}
    </div>
  );
});

export default Testimony;