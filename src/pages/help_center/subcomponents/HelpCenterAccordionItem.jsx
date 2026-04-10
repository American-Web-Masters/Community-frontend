import React from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const HelpCenterAccordionItem = ({
  item,
  isOpen,
  onToggle,
}) => {
  return (
    <article className="rounded-md border border-[#d6e8fa] bg-white/95 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-[12px] font-semibold text-[#12356c]">{item.title}</span>
        {isOpen ? (
          <IoChevronUp className="w-4 h-4 text-[#12356c]" />
        ) : (
          <IoChevronDown className="w-4 h-4 text-[#12356c]" />
        )}
      </button>

      {isOpen ? (
        <div className="px-4 pb-4">
          <div className="mb-2 inline-flex items-center rounded-full bg-[#e7f0ff] px-2 py-0.5 text-[9px] text-[#1f4d9a] font-medium">
            Updated
          </div>
          <p className="text-[11px] leading-[1.45] text-[#103165] font-semibold">
            {item.answer}
          </p>
          <div className="mt-3 flex items-center gap-4 text-[10px]">
            <button type="button" className="text-green-600 font-medium hover:opacity-80">
              👍 Useful
            </button>
            <button type="button" className="text-red-500 font-medium hover:opacity-80">
              👎 Not Useful
            </button>
            <button type="button" className="text-[#6d8ebb] hover:underline">
              View Related
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
};

export default HelpCenterAccordionItem;
