import React from "react";
import { IoMic } from "react-icons/io5";
import HelpCenterSearchResultCard from "./HelpCenterSearchResultCard";

const filterTabs = ["All", "FAQ's", "Forum"];

const searchItems = [
  {
    id: 1,
    title: "How do I reset my password?",
    preview: "To reset your password, go to the login screen and click \"Forgot Password\"...",
    tag: "FAQ's",
  },
  {
    id: 2,
    title: "Password reset not working",
    preview: "I've tried resetting my password multiple times but the email never arrives...",
    tag: "Forum",
  },
];

const HelpCenterSearchTab = () => {
  return (
    <section className="mt-6 rounded-[14px] border border-[#d4e6fa] bg-white/95 p-4 md:p-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search help articles or community questions..."
          className="w-full h-[45px] rounded-[12px] border border-[#bfd6f0] bg-white pl-7 pr-14 text-[16px] text-[#2a4770] placeholder:text-[#b6b7ba] outline-none"
        />
        <button
          type="button"
          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7f8ea2]"
          aria-label="Voice search"
        >
          <IoMic className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        {filterTabs.map((tab, index) => {
          const isActive = index === 0;
          return (
            <button
              key={tab}
              type="button"
              className={`py-2.5 rounded-full px-6 text-[12px] font-medium leading-none ${
                isActive
                  ? "btn-blue-gradient text-white"
                  : "bg-[#bad1e8] text-[#1e4278]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {searchItems.map((item) => (
          <HelpCenterSearchResultCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default HelpCenterSearchTab;
