import React from "react";
import { IoChevronDown } from "react-icons/io5";
import HelpCenterForumPostCard from "./HelpCenterForumPostCard";

const forumPosts = [
  {
    id: 1,
    title: "How do I delete old journal entries?",
    preview: "I have some old entries I'd like to remove but can't find the delete option...",
    time: "2 hours ago",
    replies: 3,
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    id: 2,
    title: "Community moderation guidelines?",
    preview: "What are the rules for moderating a community I created?",
    time: "5 hours ago",
    replies: 7,
    avatar: "https://i.pravatar.cc/80?img=47",
  },
];

const HelpCenterForumTab = () => {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-[#102b56]">Community Forum</h2>
        <button
          type="button"
          className="py-2 px-4 rounded-full bg-white text-[#576780] text-[12px] border border-[#d7e7fa] inline-flex items-center gap-2"
        >
          <span>Recent</span>
          <IoChevronDown className="w-4 h-4 text-[#526f95]" />
        </button>
      </div>

      <div className="mt-4 rounded-[12px] bg-white/95 border border-[#d4e6fa] px-5 py-6">
        <h3 className="text-[18px] font-semibold text-[#1a2d45]">Ask a question</h3>

        <input
          type="text"
          placeholder="Question title..."
          className="mt-4 w-full h-[48px] px-4 rounded-[10px] border border-[#cfe0f5] bg-white text-[15px] text-[#213c63] placeholder:text-[#9aa8bb] outline-none"
        />

        <textarea
          placeholder="Describe your question in detail..."
          className="mt-3 w-full min-h-[120px] px-4 py-3 rounded-[10px] border border-[#cfe0f5] bg-white text-[15px] text-[#213c63] placeholder:text-[#9aa8bb] outline-none resize-none"
        />

        <button
          type="button"
          className="mt-5 px-6 py-2 rounded-full btn-blue-gradient text-white text-[12px] font-semibold"
        >
          Post Question
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {forumPosts.map((post) => (
          <HelpCenterForumPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default HelpCenterForumTab;
