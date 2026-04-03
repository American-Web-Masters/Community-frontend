import React, { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import SettingsSectionRow from "./SettingsSectionRow";
import SegmentedControl from "./SegmentedControl";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";
import { changePassword, deleteAccount, toggleDirectMessaging } from "../../../api/settings.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/userSlice.js";
import { clearUser } from "../../../store/userSlice.js";
import { useNavigate } from "react-router-dom";

const Divider = () => <div className="h-px bg-blue-100 mx-4" />;

const PrivacyAccountSettings = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [directMessagesEnabled, setDirectMessagesEnabled] = useState(true);
	const [profileVisibility, setProfileVisibility] = useState("public");

	const [changePasswordOpen, setChangePasswordOpen] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [togglingDM, setTogglingDM] = useState(false);

	const getErrorMessage = (error) => {
		return (
			error?.response?.data?.message ||
			error?.response?.data?.error ||
			error?.message ||
			"Something went wrong. Please try again."
		);
	};

	const handleChangePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
		setSubmitting(true);
		try {
			const res = await changePassword({
				currentPassword,
				newPassword,
				confirmPassword,
			});

			// Backend success shape:
			// { status: 'success', data: { user: { ... } } }
			const updatedUser = res?.data?.user;
			if (updatedUser) {
				dispatch(setUser(updatedUser));
			}

			toast.success("Password changed successfully");
			setChangePasswordOpen(false);
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setSubmitting(false);
		}
	};

	const handleToggleDirectMessaging = async (nextValue) => {
		const previousValue = directMessagesEnabled;
		setDirectMessagesEnabled(nextValue);
		setTogglingDM(true);
		try {
			await toggleDirectMessaging({ allowDirectMessaging: nextValue });
			toast.success(`Direct messages ${nextValue ? "enabled" : "disabled"}`);
		} catch (error) {
			// rollback
			setDirectMessagesEnabled(previousValue);
			toast.error(getErrorMessage(error));
		} finally {
			setTogglingDM(false);
		}
	};

	const handleDelete = async ({ currentPassword }) => {
		setSubmitting(true);
		try {
			await deleteAccount({ currentPassword });
			toast.success("Account deleted successfully");
			setConfirmDeleteOpen(false);

			// Clear client state and redirect to login
			dispatch(clearUser());
			navigate("/login");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<SettingsSectionRow
				title="Allow Direct Messages"
				description="Choose who can message you directly."
				right={
					<ToggleSwitch
						checked={directMessagesEnabled}
						onChange={handleToggleDirectMessaging}
						label={directMessagesEnabled ? "On" : "Off"}
						disabled={togglingDM}
					/>
				}
			/>

			<Divider />

			<SettingsSectionRow
				title="Profile Visibility"
				right={
					<SegmentedControl
						ariaLabel="Profile visibility"
						options={[
							{ label: "Public", value: "public" },
							{ label: "Private", value: "private" },
						]}
						value={profileVisibility}
						onChange={setProfileVisibility}
					/>
				}
			/>

			<Divider />

			<div className="px-6 py-6">
				<p className="text-[16px] font-semibold text-gray-900">Account Management</p>

				<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
					<button
						type="button"
						onClick={() => setChangePasswordOpen(true)}
						className="w-full rounded-full border border-blue-300 bg-white px-6 py-3 text-[13px] sm:text-[14px] font-semibold text-gray-900 hover:bg-blue-50 transition cursor-pointer"
					>
						Change Password
					</button>
					<button
						type="button"
						onClick={() => setConfirmDeleteOpen(true)}
						className="w-full rounded-full bg-[#FDE7E7] px-6 py-3 text-[13px] sm:text-[14px] font-semibold text-red-600 hover:bg-[#FAD1D1] transition cursor-pointer"
					>
						Delete Account
					</button>
				</div>

				<p className="mt-5 text-center text-sm sm:text-[15px] text-red-700">
					Deactivating or deleting your account are permanent actions.
				</p>
			</div>

			<ChangePasswordModal
				isOpen={changePasswordOpen}
				onClose={() => setChangePasswordOpen(false)}
				onSubmit={handleChangePassword}
				loading={submitting}
			/>

			<DeleteAccountModal
				isOpen={confirmDeleteOpen}
				onClose={() => setConfirmDeleteOpen(false)}
				onConfirm={async (payload) => {
					try {
						await handleDelete(payload);
					} catch (error) {
						toast.error(getErrorMessage(error));
					}
				}}
				loading={submitting}
			/>
		</div>
	);
};

export default PrivacyAccountSettings;
