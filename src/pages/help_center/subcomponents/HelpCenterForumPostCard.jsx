import React, { useMemo, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { HiOutlineChatBubbleLeft } from "react-icons/hi2";

const DEFAULT_AVATAR = "https://i.pravatar.cc/80?img=12";

const toId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || null;
  return null;
};

const getUserDisplayName = (user) => {
  if (!user || typeof user !== "object") return "Community Member";

  const fullname = `${user.firstname || ""} ${user.lastname || ""}`.trim();
  if (fullname) return fullname;
  if (user.username) return user.username;
  return "Community Member";
};

const getUserAvatar = (user) => {
  if (!user || typeof user !== "object") return DEFAULT_AVATAR;
  return user?.profile?.profilePicture || DEFAULT_AVATAR;
};

const formatRelativeTime = (dateString) => {
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return "Just now";

  const diffMs = timestamp - Date.now();
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMs < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (absMs < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  return rtf.format(Math.round(diffMs / day), "day");
};

const HelpCenterForumPostCard = ({
  forum,
  currentUserId,
  canManage,
  onAddReply,
  onReactReply,
  onUpdateForum,
  onDeleteForum,
  isUpdating,
  isDeleting,
  isReplying,
  reactingReplyKey,
}) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(forum?.questionTitle || "");
  const [editDescription, setEditDescription] = useState(forum?.questionDescription || "");

  const forumOwnerName = useMemo(() => getUserDisplayName(forum?.user), [forum?.user]);
  const forumAvatar = useMemo(() => getUserAvatar(forum?.user), [forum?.user]);
  const createdTime = useMemo(() => formatRelativeTime(forum?.createdAt), [forum?.createdAt]);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    const success = await onAddReply(forum._id, replyText);
    if (success) {
      setReplyText("");
      setIsReplyOpen(true);
    }
  };

  const handleSaveUpdate = async () => {
    const payload = {};

    if (editTitle.trim() && editTitle.trim() !== forum.questionTitle) {
      payload.questionTitle = editTitle.trim();
    }

    if (
      editDescription.trim() &&
      editDescription.trim() !== forum.questionDescription
    ) {
      payload.questionDescription = editDescription.trim();
    }

    if (!payload.questionTitle && !payload.questionDescription) {
      setIsEditing(false);
      return;
    }

    await onUpdateForum(forum._id, payload);
    setIsEditing(false);
  };

  return (
    <article className="w-full rounded-[10px] border border-[#d4e6fa] bg-white/95 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4 border-l-[5px] border-l-[#0b2f90] rounded-[10px]">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${forumAvatar})` }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-[42px] px-3 rounded-[8px] border border-primary-100 text-[14px] text-primary-800 outline-none"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full min-h-[90px] px-3 py-2 rounded-[8px] border border-primary-100 text-[14px] text-primary-800 outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveUpdate}
                  className="px-4 py-1.5 rounded-full btn-blue-gradient text-white text-xs font-semibold disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setEditTitle(forum.questionTitle || "");
                    setEditDescription(forum.questionDescription || "");
                    setIsEditing(false);
                  }}
                  className="px-4 py-1.5 rounded-full border border-primary-200 text-primary-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-[18px] font-semibold leading-tight text-[#0f2f6a]">
                {forum.questionTitle}
              </h3>
              <p
                className={`mt-1 text-[15px] text-[#6f7f99] leading-snug ${
                  isReplyOpen ? "" : "line-clamp-2 min-h-[2.75rem]"
                }`}
              >
                {forum.questionDescription}
              </p>
            </>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-[#7b8492]">
            <span>{createdTime}</span>
            <span>By {forumOwnerName}</span>
            <span className="inline-flex items-center gap-1">
              <HiOutlineChatBubbleLeft className="w-3.5 h-3.5" />
              {forum.replies.length} replies
            </span>

            <button
              type="button"
              onClick={() => setIsReplyOpen((v) => !v)}
              aria-expanded={isReplyOpen}
              className="inline-flex items-center gap-2 font-semibold text-[#0b2f90] hover:underline"
            >
              Reply
            </button>

            {canManage && !isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-[#0b2f90] font-semibold hover:underline"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => onDeleteForum(forum._id)}
                  className="inline-flex items-center gap-1 text-red-500 font-semibold hover:underline disabled:opacity-60"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            ) : null}
          </div>

          {isReplyOpen ? (
            <div className="relative mt-4">
              <div className="rounded-[8px] border border-primary-100 bg-white px-3 py-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full min-h-[80px] px-3 py-2 rounded-[8px] border border-primary-100 text-[14px] text-primary-800 outline-none resize-none"
                />
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    disabled={!replyText.trim() || isReplying}
                    onClick={handleSubmitReply}
                    className="px-4 py-1.5 rounded-full btn-blue-gradient text-white text-xs font-semibold disabled:opacity-60"
                  >
                    {isReplying ? "Submitting..." : "Submit Reply"}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {forum.replies.length === 0 ? (
                  <p className="text-sm text-[#6f7f99]">No replies yet.</p>
                ) : (
                  forum.replies.map((reply) => {
                    const usefulSelected = reply.userReaction === "useful";
                    const notUsefulSelected = reply.userReaction === "notUseful";
                    const isReacting = reactingReplyKey === `${forum._id}:${reply._id}`;

                    return (
                      <div key={reply._id} className="rounded-[8px] border border-[#d4e6fa] bg-white px-3 py-3">
                        <div className="text-[12px] text-[#0b2f90] font-semibold">
                          {getUserDisplayName(reply.user)}
                        </div>
                        <p className="text-[13px] text-[#6f7f99] mt-1">{reply.replyText}</p>

                        <div className="mt-2 flex items-center gap-2 text-[12px]">
                          <button
                            type="button"
                            disabled={isReacting || !currentUserId}
                            onClick={() => onReactReply(forum._id, reply._id, "useful")}
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-full border disabled:opacity-60 ${
                              usefulSelected
                                ? "text-green-700 border-green-300 bg-green-50"
                                : "text-green-600 border-green-200"
                            }`}
                          >
                            <FiThumbsUp className="w-3.5 h-3.5" />
                            Useful ({reply.usefulCount || 0})
                          </button>
                          <button
                            type="button"
                            disabled={isReacting || !currentUserId}
                            onClick={() => onReactReply(forum._id, reply._id, "notUseful")}
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-full border disabled:opacity-60 ${
                              notUsefulSelected
                                ? "text-red-600 border-red-300 bg-red-50"
                                : "text-red-500 border-red-200"
                            }`}
                          >
                            <FiThumbsDown className="w-3.5 h-3.5" />
                            Not Useful ({reply.notUsefulCount || 0})
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default HelpCenterForumPostCard;
