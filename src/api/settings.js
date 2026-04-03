import apiClient from "./client.js";

/**
 * Change the current authenticated user's password.
 *
 * POST /users/change-password
 * body: { currentPassword, newPassword, confirmPassword }
 *
 * Expected response: main user object (same shape as Redux user).
 *
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} payload
 * @returns {Promise<any>} API response data
 */
export const changePassword = async (payload) => {
	const response = await apiClient.patch("/users/change-password", payload);
	return response.data;
};

export default {
	changePassword,
};
