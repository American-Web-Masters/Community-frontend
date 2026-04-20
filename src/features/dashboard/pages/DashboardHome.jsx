import React from 'react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const StatCard = ({ label, value, hint, tone = 'primary' }) => {
  const toneStyles =
    tone === 'accent'
      ? {
          dot: 'bg-accent-500',
          value: 'text-accent-700',
          badge: 'bg-accent-50 text-accent-800 border-accent-100',
        }
      : tone === 'neutral'
        ? {
            dot: 'bg-black/30',
            value: 'text-text-primary',
            badge: 'bg-black/5 text-gray-800 border-black/10',
          }
        : {
            dot: 'bg-primary-500',
            value: 'text-primary-700',
            badge: 'bg-primary-50 text-primary-800 border-primary-100',
          };

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur shadow-sm border border-black/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-text-secondary">{label}</div>
          <div className={cx('mt-2 text-2xl font-semibold truncate', toneStyles.value)}>{value}</div>
        </div>

        <div className={cx('h-9 w-9 rounded-xl border flex items-center justify-center shrink-0', toneStyles.badge)}>
          <div className={cx('h-2.5 w-2.5 rounded-full', toneStyles.dot)} />
        </div>
      </div>

      {hint ? <div className="mt-2 text-xs text-text-secondary">{hint}</div> : null}
    </div>
  );
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl btn-blue-gradient text-white p-6 md:p-8 shadow-lg border border-white/10">
        <div className="text-sm text-white/90">Welcome back</div>
        <div className="text-2xl md:text-3xl font-semibold mt-1">
          Admin overviews
        </div>
        <div className="text-sm mt-2 text-white/90 max-w-2xl">
          This is a sample dashboard module. Replace these cards with real analytics from your backend.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="New signups" value="24" hint="Last 7 days" tone="primary" />
        <StatCard label="Active users" value="312" hint="Currently active" tone="neutral" />
        <StatCard label="Communities" value="18" hint="Total" tone="primary" />
        <StatCard label="Open reports" value="3" hint="Needs review" tone="accent" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-white/90 backdrop-blur shadow-sm border border-black/5 p-5">
          <div className="text-sm font-semibold text-text-primary">Activity</div>
          <div className="mt-3 h-56 rounded-xl bg-primary-50/60 border border-primary-100/70 border-dashed flex items-center justify-center text-sm text-text-secondary">
            Chart placeholder
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 backdrop-blur shadow-sm border border-black/5 p-5">
          <div className="text-sm font-semibold text-text-primary">Quick actions</div>
          <div className="mt-4 space-y-2">
            <button type="button" className="w-full text-left px-4 py-3 rounded-xl btn-blue-gradient hover:opacity-95 transition-opacity">
              Create announcement
            </button>
            <button type="button" className="w-full text-left px-4 py-3 rounded-xl bg-accent-50 text-accent-800 border border-accent-100 hover:bg-accent-100 transition-colors">
              Review join requests
            </button>
            <button type="button" className="w-full text-left px-4 py-3 rounded-xl bg-primary-50 text-primary-800 border border-primary-100 hover:bg-primary-100 transition-colors">
              Manage subscriptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
