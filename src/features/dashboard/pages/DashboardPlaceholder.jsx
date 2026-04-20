import React from 'react';

const DashboardPlaceholder = ({ title, description }) => {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur shadow-sm border border-black/5 p-6">
      <div className="text-lg font-semibold text-text-primary">{title}</div>
      <div className="mt-2 text-sm text-text-secondary">{description}</div>
      <div className="mt-6 h-40 rounded-xl bg-primary-50/60 border border-primary-100/70 border-dashed flex items-center justify-center text-sm text-text-secondary">
        Content goes here
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
