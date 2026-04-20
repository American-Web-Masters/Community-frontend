import apiClient from "./client.js";

/**
 * Get all forums.
 * Endpoint: GET /api/v1/forums
 */
export const getForums = async () => {
  const response = await apiClient.get("/forums");
  return response.data;
};

/**
 * Add a reply to a forum.
 * Endpoint: POST /api/v1/forums/:forumId/replies
 * Body: { replyText }
 */
export const addForumReply = async (forumId, replyText) => {
  const response = await apiClient.post(`/forums/${forumId}/replies`, {
    replyText,
  });
  return response.data;
};

export default {
  getForums,
  addForumReply,
};
