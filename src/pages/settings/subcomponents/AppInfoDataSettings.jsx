import React from "react";
import SettingsSectionRow from "./SettingsSectionRow";
import AccordionRow from "./AccordionRow";

const Divider = () => <div className="h-px bg-blue-100 mx-4" />;

const VersionPill = ({ value }) => {
	return (
		<div className="inline-flex items-center gap-2 rounded-full bg-[#F2F6FF] px-4 py-2 text-[12px] text-gray-600">
			<span className="font-medium">{value}</span>
			<span className="text-gray-500" aria-hidden="true">
				
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8 12H16"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<path
						d="M12 8V16"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						opacity="0.0"
					/>
				</svg>
			</span>
		</div>
	);
};

const AppInfoDataSettings = () => {
	return (
		<div>
			<SettingsSectionRow
				title="Version Number"
				right={<VersionPill value="v2.5.1 (build 20251030)" />}
			/>

			<Divider />

			<SettingsSectionRow title="Legal & Policies" right={null} />
			<div className="h-px bg-blue-100 mx-6" />

			<AccordionRow title="Terms of Service" defaultOpen={false}>
				<p>
					This is placeholder text data. It explains the rules for using the app,
					acceptable use, and limitations of liability.
				</p>
				<ul className="mt-3 list-disc pl-5 space-y-1">
					<li>No harassment or abusive content.</li>
					<li>Don’t misuse the service or attempt unauthorized access.</li>
					<li>We may suspend accounts that violate these rules.</li>
				</ul>
			</AccordionRow>

			<div className="h-px bg-blue-100 mx-6" />

			<AccordionRow title="Privacy Policy" defaultOpen={false}>
				<p>
					This placeholder summarizes what data is collected, how it’s used, and
					how users can manage or request deletion of their data.
				</p>
				<ul className="mt-3 list-disc pl-5 space-y-1">
					<li>We collect basic account info (like username/email).</li>
					<li>We use your data to provide and improve app features.</li>
					<li>You can request deletion of your account data from Support.</li>
				</ul>
			</AccordionRow>

			<div className="h-px bg-blue-100 mx-6" />

			<AccordionRow title="Community Guidelines" defaultOpen={false}>
				<p>
					This placeholder covers expected behavior, reporting content, and
					moderation policies.
				</p>
				<ul className="mt-3 list-disc pl-5 space-y-1">
					<li>Be respectful and supportive.</li>
					<li>Report content that violates guidelines.</li>
					<li>Repeated violations may lead to account removal.</li>
				</ul>
			</AccordionRow>
		</div>
	);
};

export default AppInfoDataSettings;
