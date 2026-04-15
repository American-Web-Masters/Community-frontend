import React, { useMemo, useState } from "react";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { HiOutlineChatBubbleLeft } from "react-icons/hi2";

const HelpCenterForumPostCard = ({ post }) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const answerText = useMemo(() => {
    if (typeof post.answer === "string" && post.answer.trim()) return post.answer;
    return post.preview;
  }, [post.answer, post.preview]);

  return (
    <article className="w-full rounded-[10px] border border-[#d4e6fa] bg-white/95 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4 border-l-[5px] border-l-[#0b2f90] rounded-[10px]">
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

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-[#7b8492]">
            <span>{post.time}</span>
            <span className="inline-flex items-center gap-1">
              <HiOutlineChatBubbleLeft className="w-3.5 h-3.5" />
              {post.replies} replies
            </span>

            <button
              type="button"
              onClick={() => setIsReplyOpen((v) => !v)}
              aria-expanded={isReplyOpen}
              className="inline-flex items-center gap-2 font-semibold text-[#0b2f90] hover:underline"
            >
              Reply
            </button>
          </div>

          {isReplyOpen ? (
            <div className="relative mt-4 pl-10">
              <div className="absolute left-4 -top-1 bottom-2 w-[2px] bg-black rounded-full" />
              <div className="absolute left-4 top-4 w-7 h-[2px] bg-black rounded-full" />

              <div className="rounded-[8px] border-2 border-primary-500 bg-white px-4 py-3">
                <div className="text-[12px] leading-snug">
                  <span className="font-semibold text-[#0b2f90]">Answered By Admin :</span>{" "}
                  <span className="text-[#6f7f99]">{answerText}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-4 pr-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-green-600 hover:underline"
                >
                  <FiThumbsUp className="w-4 h-4" />
                  Useful
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-500 hover:underline"
                >
                  <FiThumbsDown className="w-4 h-4" />
                  Not Useful
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default HelpCenterForumPostCard;
