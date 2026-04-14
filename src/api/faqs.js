import apiClient from "./client.js";

/**
 * Get all FAQs.
 * Expected endpoint: GET /api/v1/faqs
 */
export const getAllFaqs = async () => {
  const response = await apiClient.get("/faqs/");
  return response.data;
};

/**
 * Create a new FAQ.
 * Endpoint: POST /api/v1/faqs
 * Body: { category, question, answeres }
 */
export const createFaq = async ({ category, question, answeres }) => {
  const response = await apiClient.post("/faqs", {
    category,
    question,
    answeres,
  });
  return response.data;
};

/**
 * Get FAQ by id.
 * Endpoint: GET /api/v1/faqs/:faqId
 */
export const getFaqById = async (faqId) => {
  const response = await apiClient.get(`/faqs/${faqId}`);
  return response.data;
};

/**
 * React to FAQ as useful or notUseful.
 * Endpoint: POST /api/v1/faqs/:faqId/reaction
 */
export const reactToFaq = async (faqId, reactionType) => {
  const response = await apiClient.post(`/faqs/${faqId}/reaction`, {
    reactionType,
  });
  return response.data;
};

export default {
  getAllFaqs,
  createFaq,
  getFaqById,
  reactToFaq,
};
