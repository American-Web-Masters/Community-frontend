import React from "react";

const SettingsSectionRow = ({ title, description, right }) => {
	return (
		<div className="px-6 py-6">
			<div className="flex flex-row items-center justify-between gap-4 sm:gap-6">
				<div className="min-w-0">
					<p className="text-[16px] font-semibold text-gray-900">{title}</p>
					{description ? (
						<p className="mt-1 text-[12px] sm:text-[13px] text-gray-600">
							{description}
						</p>
					) : null}
				</div>
				<div className="flex-shrink-0">{right}</div>
			</div>
		</div>
	);
};

export default SettingsSectionRow;
