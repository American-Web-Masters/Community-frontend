import apiClient from "./client.js";

/**
 * Get all FAQs.
 * Expected endpoint: GET /api/v1/faqs/
 */
export const getAllFaqs = async () => {
  const response = await apiClient.get("/faqs/");
  return response.data;
};

export default {
  getAllFaqs,
};
