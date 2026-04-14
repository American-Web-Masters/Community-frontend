import React from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const HelpCenterAccordionItem = ({
  item,
  isOpen,
  onToggle,
  onReact,
  isReacting = false,
}) => {
  const isUsefulSelected = item.userReaction === "useful";
  const isNotUsefulSelected = item.userReaction === "notUseful";

  return (
    <article className="rounded-md border border-[#d6e8fa] bg-white/95 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-[16px] font-semibold text-[#12356c]">{item.title}</span>
        {isOpen ? (
          <IoChevronUp className="w-5 h-5 text-[#12356c]" />
        ) : (
          <IoChevronDown className="w-5 h-5 text-[#12356c]" />
        )}
      </button>

      {isOpen ? (
        <div className="px-6 pb-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-[#e7f0ff] px-3 py-1 text-[12px] text-[#1f4d9a] font-medium">
            Updated
          </div>
          <p className="text-[14px] leading-[1.5] text-[#103165] font-semibold">
            {item.answer}
          </p>
          <div className="mt-4 flex items-center gap-4 text-[12px]">
            <button
              type="button"
              disabled={isReacting}
              onClick={() => onReact?.(item.id, "useful")}
              className={`font-medium hover:opacity-80 disabled:opacity-60 ${
                isUsefulSelected ? "text-green-700" : "text-green-600"
              }`}
            >
              👍 Useful ({item.usefulCount || 0})
            </button>
            <button
              type="button"
              disabled={isReacting}
              onClick={() => onReact?.(item.id, "notUseful")}
              className={`font-medium hover:opacity-80 disabled:opacity-60 ${
                isNotUsefulSelected ? "text-red-600" : "text-red-500"
              }`}
            >
              👎 Not Useful ({item.notUsefulCount || 0})
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
