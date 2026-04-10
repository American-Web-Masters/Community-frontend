import React from "react";

const tagStyles = {
  "FAQ's": "bg-[#9cccf1] text-[#2c6b95]",
  Forum: "bg-[#b8e8c9] text-[#3e8d58]",
};

const HelpCenterSearchResultCard = ({ item }) => {
  return (
    <article className="w-full rounded-[12px] border border-[#c8dbf0] bg-white/95 px-6 py-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold leading-tight text-[#111f73]">{item.title}</h3>
        <p className="mt-2 text-[15px] leading-snug text-[#5e6676] truncate">{item.preview}</p>
      </div>
      <span
        className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-[9px] font-medium ${tagStyles[item.tag] || "bg-[#d9e8f7] text-[#4a6380]"}`}
      >
        {item.tag}
      </span>
    </article>
  );
};

export default HelpCenterSearchResultCard;
