import React from "react";
import { FiFlag } from "react-icons/fi";
import { HiOutlineChatBubbleLeft } from "react-icons/hi2";

const HelpCenterForumPostCard = ({ post }) => {
  return (
    <article className="w-full rounded-[10px] border border-[#d4e6fa] bg-white/95 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4 border-l-[4px] border-l-[#0b2f90]">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.avatar})` }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-semibold leading-tight text-[#0f2f6a]">
            {post.title}
          </h3>
          <p className="mt-1 text-[15px] text-[#6f7f99] leading-snug line-clamp-1">
            {post.preview}
          </p>

          <div className="mt-3 flex items-center gap-3 text-[12px] text-[#7b8492]">
            <span>{post.time}</span>
            <span className="inline-flex items-center gap-1">
              <HiOutlineChatBubbleLeft className="w-3.5 h-3.5" />
              {post.replies} replies
            </span>
            <button type="button" className="inline-flex items-center gap-1 hover:opacity-80">
              <span>Subscribe</span>
              <FiFlag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HelpCenterForumPostCard;
