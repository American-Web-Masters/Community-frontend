
import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import HelpCenterForumPostCard from "./HelpCenterForumPostCard";
import { HelpCenterMainTabs } from "./HelpCenterTabs";

const forumPosts = [
  {
    id: 1,
    title: "How do I delete old journal entries?",
    preview:
      "I have some old entries I'd like to remove but can't find the delete option...",
    time: "2 hours ago",
    replies: 3,
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    id: 2,
    title: "Community moderation guidelines?",
    preview: "What are the rules for moderating a community I created?",
    time: "5 hours ago",
    replies: 0,
    avatar: "https://i.pravatar.cc/80?img=47",
  },
];

const FORUM_TABS = ["All", "Your Answer"];

const HelpCenterForumTab = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filteredPosts = forumPosts.filter((post) => {
    if (activeTab === "Your Answer" && post.replies < 1) return false;
    if (!search) return true;

    const q = search.toLowerCase();
    return post.title.toLowerCase().includes(q) || post.preview.toLowerCase().includes(q);
  });

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-primary-800 mb-4">Community Forum</h2>
      </div>

      <div className="rounded-[12px] bg-white/95 border border-primary-100 px-5 py-6">
        <h3 className="text-[18px] font-semibold text-primary-800">Ask a question</h3>

        <input
          type="text"
          placeholder="Question title..."
          className="mt-4 w-full h-[48px] px-4 rounded-[10px] border border-primary-100 bg-white text-[15px] text-primary-800 placeholder:text-primary-300 outline-none"
        />

        <textarea
          placeholder="Describe your question in detail..."
          className="mt-3 w-full min-h-[120px] px-4 py-3 rounded-[10px] border border-primary-100 bg-white text-[15px] text-primary-800 placeholder:text-primary-300 outline-none resize-none"
        />

        <button
          type="button"
          className="mt-5 px-6 py-2 rounded-full btn-blue-gradient text-white text-[12px] font-semibold"
        >
          Post Question
        </button>
      </div>

      <div className="mt-6 mb-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-semibold text-[#102b56] mb-3">Answered Question</div>
            <HelpCenterMainTabs
              tabs={FORUM_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="relative w-full sm:w-64">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#24467f]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search forum..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-white/80 border border-white/60 shadow-sm text-[14px] text-[#24467f] placeholder:text-[#24467f]/50 outline-none"
            />
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        {filteredPosts.length === 0 ? (
          <div className="text-center text-primary-400 text-sm py-8">No posts found.</div>
        ) : (
          filteredPosts.map((post) => (
            <HelpCenterForumPostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </section>
  );
};

export default HelpCenterForumTab;
