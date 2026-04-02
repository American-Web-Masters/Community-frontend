import React from "react";

/**
 * Modular confirm modal for destructive or important actions.
 *
 * Contract:
 * - isOpen: boolean
 * - title: string
 * - message: string|ReactNode
 * - confirmText/cancelText: string
 * - variant: "danger" | "primary"
 * - loading: boolean
 * - onConfirm: () => Promise<void> | void
 * - onClose: () => void
 */
const ConfirmActionModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "danger",
	loading = false,
}) => {
	if (!isOpen) return null;

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget && !loading) onClose();
	};

	const confirmBtnClass =
		variant === "danger"
			? "bg-red-600 hover:bg-red-700"
			: "btn-blue-gradient hover:opacity-95";

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[4px] rounded-xl"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
				<div className="p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
							<div className="mt-2 text-sm text-gray-600">{message}</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="text-gray-500 hover:text-gray-700 text-xl leading-none disabled:opacity-60 cursor-pointer"
							aria-label="Close"
						>
							×
						</button>
					</div>

					<div className="mt-6 flex gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
						>
							{cancelText}
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={loading}
							className={`flex-1 py-2.5 px-4 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-60 cursor-pointer ${confirmBtnClass}`}
						>
							{loading ? "Please wait..." : confirmText}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConfirmActionModal;
