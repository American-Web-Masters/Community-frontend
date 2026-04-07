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

/**
 * Toggle journal new-entry notifications for the authenticated user.
 *
 * PATCH /users/journal-notifications/new-entry
 * body: { toggle: boolean }
 */
export const toggleJournalNewEntryNotification = async (toggle) => {
	const response = await apiClient.patch("/users/journal-notifications/new-entry", {
		toggle,
	});
	return response.data;
};

/**
 * Toggle journal likes notifications for the authenticated user.
 *
 * PATCH /users/journal-notifications/likes
 * body: { toggle: boolean }
 */
export const toggleJournalLikesNotification = async (toggle) => {
	const response = await apiClient.patch("/users/journal-notifications/likes", {
		toggle,
	});
	return response.data;
};

/**
 * Toggle journal comment notifications for the authenticated user.
 *
 * PATCH /users/journal-notifications/comment
 * body: { toggle: boolean }
 */
export const toggleJournalCommentNotification = async (toggle) => {
	const response = await apiClient.patch("/users/journal-notifications/comment", {
		toggle,
	});
	return response.data;
};

/**
 * Toggle community notifications for the authenticated user.
 *
 * PATCH /users/community-notifications
 * body: { toggle: boolean }
 */
export const toggleCommunityNotifications = async (toggle) => {
	const response = await apiClient.patch("/users/community-notifications", {
		toggle,
	});
	return response.data;
};

export default {
	changePassword,
	deleteAccount,
	toggleDirectMessaging,
	toggleProfilePrivacy,
	toggleJournalNewEntryNotification,
	toggleJournalLikesNotification,
	toggleJournalCommentNotification,
	toggleCommunityNotifications,
};
