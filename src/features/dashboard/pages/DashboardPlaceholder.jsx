import React from 'react';

const DashboardPlaceholder = ({ title, description }) => {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-black/5 p-6">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-600">{description}</div>
      <div className="mt-6 h-40 rounded-xl bg-[#f6f8fc] border border-black/5 flex items-center justify-center text-sm text-gray-500">
        Content goes here
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
