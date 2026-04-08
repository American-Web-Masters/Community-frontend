import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/ui/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useLogout } from "../../hooks/useLogout";
import { checkCalendarConnection, connectCalendar } from "../../api/calendar";
import { FcGoogle } from "react-icons/fc";
import { FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

import {
	NotificationSettings,
	PrivacyAccountSettings,
	AppInfoDataSettings,
	SettingsCard,
	SettingsTabs,
	SettingsSupportCard,
} from "./index";

const Settings = () => {
	const navigate = useNavigate();
	const { username } = useParams();
	const { logout } = useLogout();

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

	const [notifications, setNotifications] = useState({
		journal: { newEntry: true, likes: true, comments: true },
		communityMode: "all",
	});

	const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
	const [isCalendarConnected, setIsCalendarConnected] = useState(false);
	const [isCalendarLoading, setIsCalendarLoading] = useState(false);

	const checkCalendarStatus = async () => {
		try {
			setIsCalendarLoading(true);
			const response = await checkCalendarConnection();

			if (response.success) {
				setIsCalendarConnected(!!response?.data?.isConnected);
			} else {
				setIsCalendarConnected(false);
			}
		} catch (error) {
			console.error("Calendar status check error:", error);
			setIsCalendarConnected(false);
		} finally {
			setIsCalendarLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === "messaging") {
			checkCalendarStatus();
		}
	}, [activeTab]);

	const handleCalendarConnect = async () => {
		try {
			setIsConnectingCalendar(true);
			const response = await connectCalendar();

			if (response.success) {
				toast.success(response.message || "Redirecting to Google Calendar...");
			} else {
				toast.error(response.error || "Failed to connect calendar");
			}
		} catch (error) {
			console.error("Calendar connection error:", error);
			toast.error("Failed to connect calendar");
		} finally {
			setIsConnectingCalendar(false);
		}
	};

	return (
		<div className="min-h-screen light-background overflow-x-hidden">
			<Header
				showNotification={true}
				showFilter={false}
				showSearch={false}
				showLogout={true}
				onLogoutClick={logout}
			/>

			<div className="pt-4 pb-20">
				<div className="w-[95%] mx-auto">
					{/* Top bar icons shown in the screenshot are handled by header */}

					{/* Tabs row */}
					<div className="mt-5 flex items-center justify-between gap-4">
						<div className="min-w-0 ">
							<SettingsTabs
								tabs={tabs}
								activeTab={activeTab}
								onTabChange={setActiveTab}
							/>
						</div>
					</div>

					<div className="mt-6">
						{activeTab === "notifications" ? (
							<SettingsCard className="shadow-sm border border-white/60 bg-white">
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
							<SettingsCard className="shadow-sm border border-white/60 bg-white">
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
								<SettingsCard className="shadow-sm border border-white/60 bg-white">
									<AppInfoDataSettings />
								</SettingsCard>
							</>
						) : activeTab === "support" ? (
							<SettingsCard className="p-0 overflow-hidden">
								<SettingsSupportCard
									title="AO1 Community"
									avatarSrc="/cross.png"
								/>
							</SettingsCard>
						) : activeTab === "messaging" ? (
							<SettingsCard className="p-6">
								<div className="flex items-start justify-between gap-6 max-sm:flex-col">
									<div className="w-full">
										<h2 className="text-lg font-bold text-gray-900">Messaging &amp; Integrations</h2>
										<div className="mt-6 border border-gray-200 rounded-xl p-4">
											<h3 className="text-base font-bold text-gray-900">Calendar Integrations</h3>
											{isCalendarLoading ? (
												<div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
													<div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
													<span>Checking calendar connection...</span>
												</div>
											) : isCalendarConnected ? (
												<div className="mt-4 inline-flex items-center gap-2 text-green-600">
													<FaCheckCircle className="h-5 w-5" />
													<span className="text-sm font-medium">Google Calendar Connected</span>
												</div>
											) : (
												<button
													type="button"
													onClick={handleCalendarConnect}
													disabled={isConnectingCalendar}
													className="mt-4 cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-[#97a3d8] bg-white px-5 py-2 text-[18px] font-medium text-gray-800 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
												>
													<FcGoogle className="h-6 w-6" />
													<span>{isConnectingCalendar ? "Connecting..." : "Google Calendar"}</span>
												</button>
											)}
										</div>
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
