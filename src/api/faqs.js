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
  reactToFaq,
};
