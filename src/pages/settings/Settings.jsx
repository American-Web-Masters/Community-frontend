import React, { useMemo, useState } from "react";
import Header from "../../components/ui/Header";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
	NotificationSettings,
	PrivacyAccountSettings,
	AppInfoDataSettings,
	SettingsCard,
	SettingsHeader,
	SettingsTabs,
} from "./index";

const Settings = () => {
	const navigate = useNavigate();
	const { username } = useParams();

	const tabs = useMemo(
		() => [
			// NOTE: "Accessibility & Display" intentionally removed per requirement.
			{ key: "notifications", label: "Notifications" },
			{ key: "privacy", label: "Privacy & Account" },
			{ key: "messaging", label: "Messaging & Integrations" },
			{ key: "appInfo", label: "App Info & Data" },
			{ key: "support", label: "Support" },
		],
		[]
	);

	const [activeTab, setActiveTab] = useState("notifications");
	const [isSaving, setIsSaving] = useState(false);

	const [notifications, setNotifications] = useState({
		journal: { newEntry: true, likes: true, comments: true },
		communityMode: "all",
	});

	const handleSave = async () => {
		// For now this is UI-only. We’ll wire API when backend endpoints exist.
		setIsSaving(true);
		try {
			await new Promise((r) => setTimeout(r, 450));
			toast.success("Settings saved");
		} catch {
			toast.error("Failed to save settings");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen light-background overflow-x-hidden">
			<Header showNotification={true} showFilter={false} showSearch={false} />

			<div className="pt-4 pb-20">
				<div className="w-[95%] mx-auto">
					{/* Top bar icons shown in the screenshot are handled by Header */}

					<div className="mt-4">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 flex-1">
								<SettingsHeader onSave={handleSave} isSaving={isSaving} />
							</div>
							{/* On md+ the Save button is shown in the tabs row; on sm- it's shown in the header */}
							<div className="hidden lg:block" />
						</div>
					</div>

					{/* Tabs row (md+ keeps tabs + save button in the same line) */}
					<div className="mt-5 flex items-center justify-between gap-4">
						<div className="min-w-0 ">
							<SettingsTabs
								tabs={tabs}
								activeTab={activeTab}
								onTabChange={setActiveTab}
							/>
						</div>
						<div className="hidden lg:block flex-shrink-0">
							<button
								type="button"
								onClick={handleSave}
								disabled={isSaving}
								className="btn-blue-gradient px-6 py-3 rounded-full text-white text-sm font-semibold shadow-md hover:opacity-95 disabled:opacity-60"
							>
								{isSaving ? "Saving…" : "Save Changes"}
							</button>
						</div>
					</div>

					<div className="mt-6">
						{activeTab === "notifications" ? (
							<SettingsCard>
								<NotificationSettings value={notifications} onChange={setNotifications} />
								{/* <div className="h-px bg-blue-100 mx-6" /> */}
							</SettingsCard>
						) : activeTab === "privacy" ? (
							<>
							<div className="px-1 pb-4">
									<h2 className="text-2xl font-bold text-gray-900">Privacy &amp; Account</h2>
									<p className="text-gray-800 text-sm mt-1">
										Manage your visibility, data, and account security.
									</p>
								</div>
								<div className="h-px bg-blue-100 mx-4" />
							<SettingsCard>
								<PrivacyAccountSettings />
							</SettingsCard>
							</>
						) : activeTab === "appInfo" ? (
							<>
								<div className="px-1 pb-4">
									<h2 className="text-2xl font-bold text-gray-900">App Info &amp; Data</h2>
									<p className="text-gray-800 text-sm mt-1">
										Manage app data, view legal policies, and get help.
									</p>
								</div>
								<div className="h-px bg-blue-100 mx-4" />
								<SettingsCard>
									<AppInfoDataSettings />
								</SettingsCard>
							</>
						) : (
							<SettingsCard className="p-6">
								<div className="flex items-start justify-between gap-6">
									<div>
										<h2 className="text-lg font-bold text-gray-900">
											{tabs.find((t) => t.key === activeTab)?.label}
										</h2>
										<p className="text-gray-600 text-sm mt-1">
											This section is coming next.
										</p>
									</div>
									<button
										type="button"
										onClick={() => navigate(`/profile/${username}`)}
										className="text-sm font-semibold text-blue-700 hover:text-blue-900"
									>
										Back to profile
									</button>
								</div>
							</SettingsCard>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;
