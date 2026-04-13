import React from 'react';

const StatCard = ({ label, value, hint }) => {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-black/5 p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 md:p-8 shadow-lg">
        <div className="text-sm opacity-90">Welcome back</div>
        <div className="text-2xl md:text-3xl font-semibold mt-1">Admin overview</div>
        <div className="text-sm mt-2 opacity-90 max-w-2xl">
          This is a sample dashboard module. Replace these cards with real analytics from your backend.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="New signups" value="24" hint="Last 7 days" />
        <StatCard label="Active users" value="312" hint="Currently active" />
        <StatCard label="Communities" value="18" hint="Total" />
        <StatCard label="Open reports" value="3" hint="Needs review" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm border border-black/5 p-5">
          <div className="text-sm font-semibold text-gray-900">Activity</div>
          <div className="mt-3 h-56 rounded-xl bg-[#f6f8fc] border border-black/5 flex items-center justify-center text-sm text-gray-500">
            Chart placeholder
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-black/5 p-5">
          <div className="text-sm font-semibold text-gray-900">Quick actions</div>
          <div className="mt-4 space-y-2">
            <button type="button" className="w-full text-left px-4 py-3 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
              Create announcement
            </button>
            <button type="button" className="w-full text-left px-4 py-3 rounded-xl bg-black/5 text-gray-800 hover:bg-black/10 transition-colors">
              Review join requests
            </button>
            <button type="button" className="w-full text-left px-4 py-3 rounded-xl bg-black/5 text-gray-800 hover:bg-black/10 transition-colors">
              Manage subscriptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
