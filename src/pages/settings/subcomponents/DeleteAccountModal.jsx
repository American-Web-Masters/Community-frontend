import React, { useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const inputClassName =
	"w-full px-5 py-3.5 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white/70 backdrop-blur-sm shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300";

/**
 * DeleteAccountModal
 *
 * Contract:
 * - isOpen: boolean
 * - loading: boolean
 * - onClose: () => void
 * - onConfirm: ({ currentPassword }) => Promise<void> | void
 */
const DeleteAccountModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
	const [currentPassword, setCurrentPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const canSubmit = useMemo(() => {
		return currentPassword.length > 0 && !loading;
	}, [currentPassword, loading]);

	const reset = () => {
		setCurrentPassword("");
		setShowPassword(false);
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
		await onConfirm({ currentPassword });
		reset();
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out flex items-center justify-center p-4 rounded-xl"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out w-full max-w-md overflow-hidden">
				<div className="p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								Delete account permanently?
							</h3>
							<p className="mt-2 text-sm text-gray-600">
								This action can’t be undone. To continue, please confirm your current
								password.
							</p>
						</div>
						<button
							type="button"
							onClick={handleClose}
							disabled={loading}
							className="text-gray-500 hover:text-gray-700 text-xl leading-none disabled:opacity-60 cursor-pointer hover:rotate-90 hover:shadow-sm active:scale-90 transition-all duration-300"
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
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									className={`${inputClassName} pr-12`}
									required
									disabled={loading}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									disabled={loading}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 disabled:opacity-60 cursor-pointer"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<FaEyeSlash className="w-4 h-4 cursor-pointer" />
									) : (
										<FaEye className="w-4 h-4 cursor-pointer" />
									)}
								</button>
							</div>
						</div>

						<div className="pt-2 flex gap-3">
							<button
								type="button"
								onClick={handleClose}
								disabled={loading}
								className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-300 disabled:opacity-60 cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!canSubmit}
								className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-60 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
							>
								{loading ? "Deleting..." : "Delete"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default DeleteAccountModal;
