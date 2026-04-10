import React from "react";

export const HelpCenterMainTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="inline-flex items-center bg-white/80 rounded-full p-1.5 shadow-sm border border-white/60">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2.5 rounded-full text-[10px] md:text-[12px] leading-none transition-all duration-200 ${
              isActive
                ? "btn-blue-gradient text-white"
                : "text-[#24467f] hover:bg-white/70"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export const HelpCenterCategoryTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-full text-[12px] leading-none transition-all duration-200 border ${
              isActive
                ? "btn-blue-gradient text-white border-transparent"
                : "bg-white/70 text-[#24467f] border-white/70 hover:bg-white"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
