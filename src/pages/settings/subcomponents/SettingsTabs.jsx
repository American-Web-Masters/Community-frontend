import React from "react";

const SettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-full p-1 shadow-sm border border-white/60 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "btn-blue-gradient text-white shadow"
                  : "text-gray-700 hover:bg-white/50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsTabs;
