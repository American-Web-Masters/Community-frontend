import React, { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import SettingsSectionRow from "./SettingsSectionRow";
import SegmentedControl from "./SegmentedControl";

const Divider = () => <div className="h-px bg-blue-100 mx-4" />;

const PrivacyAccountSettings = () => {
	const [directMessagesEnabled, setDirectMessagesEnabled] = useState(true);
	const [profileVisibility, setProfileVisibility] = useState("public");

	return (
		<div>
			<SettingsSectionRow
				title="Allow Direct Messages"
				description="Choose who can message you directly."
				right={
					<ToggleSwitch
						checked={directMessagesEnabled}
						onChange={setDirectMessagesEnabled}
						label={directMessagesEnabled ? "On" : "Off"}
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

				<div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
					<button
						type="button"
						className="w-full rounded-full border border-blue-300 bg-white px-6 py-3 text-[13px] sm:text-[14px] font-semibold text-gray-900 hover:bg-blue-50 transition cursor-pointer"
					>
						Change Password
					</button>

					<button
						type="button"
						className="w-full rounded-full bg-[#FDE7E7] px-6 py-3 text-[13px] sm:text-[14px] font-semibold text-red-600 hover:bg-[#FAD1D1] transition cursor-pointer"
					>
						Deactivate Account
					</button>
					<button
						type="button"
						className="w-full rounded-full bg-[#FDE7E7] px-6 py-3 text-[13px] sm:text-[14px] font-semibold text-red-600 hover:bg-[#FAD1D1] transition cursor-pointer"
					>
						Delete Account
					</button>
				</div>

				<p className="mt-5 text-center text-sm sm:text-[15px] text-red-700">
					Deactivating or deleting your account are permanent actions.
				</p>
			</div>
		</div>
	);
};

export default PrivacyAccountSettings;
