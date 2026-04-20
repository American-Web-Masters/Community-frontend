import apiClient from "./client.js";

/**
 * GET /api/v1/forums
 * Public endpoint
 */
export const getAllForums = async () => {
  const response = await apiClient.get("/forums");
  return response.data;
};

/**
 * GET /api/v1/forums/:forumId
 * Public endpoint
 */
export const getForumById = async (forumId) => {
  const response = await apiClient.get(`/forums/${forumId}`);
  return response.data;
};

/**
 * POST /api/v1/forums
 * Auth required
 */
export const createForum = async ({ questionTitle, questionDescription }) => {
  const response = await apiClient.post("/forums", {
    questionTitle,
    questionDescription,
  });
  return response.data;
};

/**
 * PATCH /api/v1/forums/:forumId
 * Auth required
 */
export const updateForum = async (forumId, payload) => {
  const response = await apiClient.patch(`/forums/${forumId}`, payload);
  return response.data;
};

/**
 * DELETE /api/v1/forums/:forumId
 * Auth required
 */
export const deleteForum = async (forumId) => {
  const response = await apiClient.delete(`/forums/${forumId}`);
  return {
    status: response.status,
    data: response.data ?? null,
  };
};

/**
 * POST /api/v1/forums/:forumId/replies
 * Auth required
 */
export const addForumReply = async (forumId, replyText) => {
  const response = await apiClient.post(`/forums/${forumId}/replies`, {
    replyText,
  });
  return response.data;
};

/**
 * POST /api/v1/forums/:forumId/replies/:replyId/reaction
 * Auth required
 */
export const reactToForumReply = async (forumId, replyId, reactionType) => {
  const response = await apiClient.post(`/forums/${forumId}/replies/${replyId}/reaction`, {
    reactionType,
  });
  return response.data;
};

export default {
  getAllForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  addForumReply,
  reactToForumReply,
};
