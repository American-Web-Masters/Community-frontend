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

/**
 * Delete the current authenticated user's account.
 *
 * POST /users/delete-account
 * body: { currentPassword }
 *
 * @param {{ currentPassword: string }} payload
 * @returns {Promise<any>} API response data
 */
export const deleteAccount = async (payload) => {
	const response = await apiClient.patch("/users/delete-account", payload);
	return response.data;
};

/**
 * Toggle whether the current user allows direct messaging.
 *
 * PATCH /user-profiles/direct-messaging/toggle
 * body: { allowDirectMessaging: boolean }
 *
 * @param {{ allowDirectMessaging: boolean }} payload
 * @returns {Promise<any>} API response data
 */
export const toggleDirectMessaging = async (payload) => {
	const response = await apiClient.patch(
		"/user-profiles/direct-messaging/toggle",
		payload
	);
	return response.data;
};

/**
 * Toggle whether the current user's profile is private.
 *
 * PATCH /user-profiles/privacy/toggle
 * body: { togglePrivacy: boolean }
 *
 * @param {{ togglePrivacy: boolean }} payload
 * @returns {Promise<any>} API response data
 */
export const toggleProfilePrivacy = async (payload) => {
	const response = await apiClient.patch("/user-profiles/privacy/toggle", payload);
	return response.data;
};

export default {
	changePassword,
	deleteAccount,
	toggleDirectMessaging,
	toggleProfilePrivacy,
};
