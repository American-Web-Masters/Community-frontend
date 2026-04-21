
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import HelpCenterForumPostCard from "./HelpCenterForumPostCard";
import { HelpCenterMainTabs } from "./HelpCenterTabs";
import { useStableMasonry } from "../../../hooks/useStableMasonry";
import {
  addForumReply,
  createForum,
  deleteForum,
  getAllForums,
  reactToForumReply,
  updateForum,
} from "../../../api/forums";
import { selectUser, selectUserId } from "../../../store/userSlice";

const FORUM_TABS = ["All", "Your Answer"];

const toId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || null;
  return null;
};

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

const normalizeReply = (reply, currentUserId) => {
  const useful = Array.isArray(reply?.useful) ? reply.useful : [];
  const notUseful = Array.isArray(reply?.notUseful) ? reply.notUseful : [];

  const normalizedUserId = String(currentUserId || "");
  const userReaction = normalizedUserId
    ? useful.some((entry) => String(toId(entry) || "") === normalizedUserId)
      ? "useful"
      : notUseful.some((entry) => String(toId(entry) || "") === normalizedUserId)
        ? "notUseful"
        : null
    : null;

  return {
    _id: reply?._id,
    user: reply?.user || null,
    replyText: reply?.replyText || "",
    useful,
    usefulCount: typeof reply?.usefulCount === "number" ? reply.usefulCount : useful.length,
    notUseful,
    notUsefulCount: typeof reply?.notUsefulCount === "number" ? reply.notUsefulCount : notUseful.length,
    createdAt: reply?.createdAt || "",
    updatedAt: reply?.updatedAt || "",
    userReaction,
  };
};

const normalizeForum = (forum, currentUserId) => {
  const replies = Array.isArray(forum?.replies) ? forum.replies : [];

  return {
    _id: forum?._id,
    questionTitle: forum?.questionTitle || "Untitled question",
    questionDescription: forum?.questionDescription || "",
    user: forum?.user || null,
    replies: replies.map((reply) => normalizeReply(reply, currentUserId)),
    createdAt: forum?.createdAt || "",
    updatedAt: forum?.updatedAt || "",
  };
};

const isForumManageable = (forum, currentUserId, currentUserRole) => {
  const isAdmin = currentUserRole === "admin";
  const forumOwnerId = String(toId(forum?.user) || "");
  const isOwner = String(currentUserId || "") && String(currentUserId || "") === forumOwnerId;
  return isAdmin || isOwner;
};

const HelpCenterForumTab = () => {
  const currentUser = useSelector(selectUser);
  const currentUserId = useSelector(selectUserId);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [forums, setForums] = useState([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState("");
  const [creatingForum, setCreatingForum] = useState(false);
  const [updatingForumId, setUpdatingForumId] = useState("");
  const [deletingForumId, setDeletingForumId] = useState("");
  const [replyingForumId, setReplyingForumId] = useState("");
  const [reactingReplyKey, setReactingReplyKey] = useState("");

  const loadForums = useCallback(async () => {
    try {
      setForumLoading(true);
      setForumError("");

      const data = await getAllForums();
      const source = data?.data?.forums;
      const normalizedForums = Array.isArray(source)
        ? source.map((forum) => normalizeForum(forum, currentUserId))
        : [];

      setForums(normalizedForums);
    } catch (error) {
      setForumError(getErrorMessage(error, "Failed to load forum posts."));
    } finally {
      setForumLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadForums();
  }, [loadForums]);

  const handleCreateForum = async () => {
    if (!questionTitle.trim()) {
      toast.error("Question title is required");
      return;
    }

    if (!questionDescription.trim()) {
      toast.error("Question description is required");
      return;
    }

    try {
      setCreatingForum(true);

      const data = await createForum({
        questionTitle: questionTitle.trim(),
        questionDescription: questionDescription.trim(),
      });

      const createdForum = normalizeForum(data?.data?.forum, currentUserId);

      setForums((prev) => [createdForum, ...prev]);
      setQuestionTitle("");
      setQuestionDescription("");
      toast.success("Question posted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to post your question"));
    } finally {
      setCreatingForum(false);
    }
  };

  const handleUpdateForum = async (forumId, payload) => {
    try {
      setUpdatingForumId(forumId);
      const data = await updateForum(forumId, payload);
      const updatedForum = normalizeForum(data?.data?.forum, currentUserId);

      setForums((prev) => prev.map((forum) => (forum._id === forumId ? updatedForum : forum)));
      toast.success("Forum updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update forum"));
    } finally {
      setUpdatingForumId("");
    }
  };

  const handleDeleteForum = async (forumId) => {
    try {
      setDeletingForumId(forumId);
      const response = await deleteForum(forumId);

      if (response?.status === 204 || response?.status === 200) {
        setForums((prev) => prev.filter((forum) => forum._id !== forumId));
        toast.success("Forum deleted");
      } else {
        toast.error("Failed to delete forum");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete forum"));
    } finally {
      setDeletingForumId("");
    }
  };

  const handleAddReply = async (forumId, replyText) => {
    try {
      setReplyingForumId(forumId);
      const data = await addForumReply(forumId, replyText.trim());
      const reply = normalizeReply(data?.data?.reply, currentUserId);

      setForums((prev) =>
        prev.map((forum) => {
          if (forum._id !== forumId) return forum;
          return { ...forum, replies: [reply, ...forum.replies] };
        })
      );

      toast.success(data?.message || "Reply added successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add reply"));
      return false;
    } finally {
      setReplyingForumId("");
    }
  };

  const handleReactToReply = async (forumId, replyId, reactionType) => {
    const key = `${forumId}:${replyId}`;
    try {
      setReactingReplyKey(key);
      const data = await reactToForumReply(forumId, replyId, reactionType);
      const updatedReply = normalizeReply(data?.data?.reply, currentUserId);

      setForums((prev) =>
        prev.map((forum) => {
          if (forum._id !== forumId) return forum;

          return {
            ...forum,
            replies: forum.replies.map((reply) => (reply._id === replyId ? updatedReply : reply)),
          };
        })
      );

      toast.success(data?.message || "Reaction updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update reaction"));
    } finally {
      setReactingReplyKey("");
    }
  };

  const filteredPosts = useMemo(() => {
    const userId = String(currentUserId || "");

    return forums.filter((forum) => {
      if (activeTab === "Your Answer") {
        const hasUserReply = forum.replies.some(
          (reply) => String(toId(reply.user) || "") === userId
        );

        if (!hasUserReply) return false;
      }

      if (!search) return true;

      const q = search.toLowerCase();
      return (
        forum.questionTitle.toLowerCase().includes(q) ||
        forum.questionDescription.toLowerCase().includes(q)
      );
    });
  }, [activeTab, currentUserId, forums, search]);

  // Keep forum cards in a stable masonry layout so expanding one card
  // doesn't force its row-mate to reserve empty vertical space.
  const masonryColumns = useStableMasonry(filteredPosts, 2);

  const canCreateForum = Boolean(currentUserId);

  const createForumDisabled =
    creatingForum || !questionTitle.trim() || !questionDescription.trim() || !canCreateForum;

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-primary-800 mb-4">Community Forum</h2>
      </div>

      <div className="rounded-[12px] bg-white/95 border border-primary-100 px-5 py-6">
        <h3 className="text-[18px] font-semibold text-primary-800">Ask a question</h3>

        <input
          type="text"
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
          placeholder="Question title..."
          className="mt-4 w-full h-[48px] px-4 rounded-[10px] border border-primary-100 bg-white text-[15px] text-primary-800 placeholder:text-primary-300 outline-none"
        />

        <textarea
          value={questionDescription}
          onChange={(e) => setQuestionDescription(e.target.value)}
          placeholder="Describe your question in detail..."
          className="mt-3 w-full min-h-[120px] px-4 py-3 rounded-[10px] border border-primary-100 bg-white text-[15px] text-primary-800 placeholder:text-primary-300 outline-none resize-none"
        />

        {!canCreateForum ? (
          <p className="mt-3 text-sm text-red-500">You are not logged in</p>
        ) : null}

        <button
          type="button"
          disabled={createForumDisabled}
          onClick={handleCreateForum}
          className="mt-5 px-6 py-2 rounded-full btn-blue-gradient text-white text-[12px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {creatingForum ? "Posting..." : "Post Question"}
        </button>
      </div>

      <div className="mt-6 mb-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="w-full sm:w-auto">
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

      {forumLoading ? (
        <div className="rounded-md border border-[#d6e8fa] bg-white/95 px-4 py-5 text-[#12356c]">
          Loading forum posts...
        </div>
      ) : forumError ? (
        <div className="rounded-md border border-[#f6caca] bg-white/95 px-4 py-5 text-red-600">
          {forumError}
        </div>
      ) : (
        <div className="mt-5">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-primary-400 text-sm py-8">No posts found.</div>
          ) : (
            <div className="stable-masonry-container">
              {masonryColumns.map((columnItems, columnIndex) => (
                <div key={columnIndex} className="masonry-column">
                  {columnItems.map((forum) => (
                    <div key={forum._id} className="masonry-item">
                      <HelpCenterForumPostCard
                        forum={forum}
                        currentUserId={currentUserId}
                        currentUserRole={currentUser?.role}
                        canManage={isForumManageable(forum, currentUserId, currentUser?.role)}
                        onAddReply={handleAddReply}
                        onReactReply={handleReactToReply}
                        onUpdateForum={handleUpdateForum}
                        onDeleteForum={handleDeleteForum}
                        isUpdating={updatingForumId === forum._id}
                        isDeleting={deletingForumId === forum._id}
                        isReplying={replyingForumId === forum._id}
                        reactingReplyKey={reactingReplyKey}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HelpCenterForumTab;
