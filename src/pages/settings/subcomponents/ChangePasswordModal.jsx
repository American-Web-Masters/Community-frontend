import React, { useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const inputClassName =
	"w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";

/**
 * ChangePasswordModal
 *
 * Contract:
 * - isOpen: boolean
 * - loading: boolean
 * - onClose: () => void
 * - onSubmit: ({ currentPassword, newPassword, confirmPassword }) => Promise<void> | void
 */
const ChangePasswordModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const canSubmit = useMemo(() => {
		return (
			currentPassword.length > 0 &&
			newPassword.length > 0 &&
			confirmPassword.length > 0 &&
			!loading
		);
	}, [currentPassword, newPassword, confirmPassword, loading]);

	const reset = () => {
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setError("");
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		setShowConfirmPassword(false);
	};

	const handleClose = () => {
		if (loading) return;
		reset();
		onClose();
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) handleClose();
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (newPassword !== confirmPassword) {
			setError("New password and confirm password don't match.");
			return;
		}

		await onSubmit({ currentPassword, newPassword, confirmPassword });
		reset();
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4  backdrop-blur-[4px] rounded-xl"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
				<div className="p-6">
					<div className="flex items-start justify-between gap-4">
						<h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
						<button
							type="button"
							onClick={handleClose}
							disabled={loading}
							className="text-gray-500 hover:text-gray-700 text-2xl leading-none disabled:opacity-60 cursor-pointer"
							aria-label="Close"
						>
							×
						</button>
					</div>

					<form onSubmit={handleSubmit} className="mt-5 space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Current Password
							</label>
							<div className="relative">
								<input
									type={showCurrentPassword ? "text" : "password"}
									autoComplete="current-password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									className={`${inputClassName} pr-12`}
									required
									disabled={loading}
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPassword((v) => !v)}
									disabled={loading}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 disabled:opacity-60"
									aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
								>
									{showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								New Password
							</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									autoComplete="new-password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className={`${inputClassName} pr-12`}
									required
									disabled={loading}
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword((v) => !v)}
									disabled={loading}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 disabled:opacity-60"
									aria-label={showNewPassword ? "Hide new password" : "Show new password"}
								>
									{showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className={`${inputClassName} pr-12`}
									required
									disabled={loading}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((v) => !v)}
									disabled={loading}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 disabled:opacity-60"
									aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
								>
									{showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						{error ? (
							<div className="text-sm text-red-600">{error}</div>
						) : null}

						<div className="pt-2 flex gap-3">
							<button
								type="button"
								onClick={handleClose}
								disabled={loading}
								className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!canSubmit}
								className="flex-1 py-2.5 px-4 btn-blue-gradient text-white rounded-xl font-medium disabled:opacity-60 cursor-pointer"
							>
								{loading ? "Saving..." : "Update Password"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChangePasswordModal;
