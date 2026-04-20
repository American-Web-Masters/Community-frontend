import React from "react";

export const HelpCenterMainTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex w-full sm:inline-flex sm:w-fit items-center bg-white/80 rounded-full p-1 shadow-sm border border-white/60 ">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`min-w-0 flex-1 sm:flex-none justify-center whitespace-nowrap px-3 sm:px-6 py-2.5 rounded-full text-[13px] leading-none transition-all duration-200 inline-flex items-center gap-1.5 ${
              isActive
                ? "btn-blue-gradient text-white"
                : "text-[#24467f] hover:bg-white/70"
            }`}
          >
            <span className="truncate">{tab}</span>
          </button>
        );
      })}
    </div>
  );
};

export const HelpCenterCategoryTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-scroll-container flex w-full items-center gap-3 overflow-x-auto flex-nowrap sm:flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-[12px] leading-none transition-all duration-200 border ${
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
