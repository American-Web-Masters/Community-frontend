import React from "react";

const SegmentedControl = ({ options, value, onChange, ariaLabel }) => {
	return (
		<div
			className="flex items-center gap-2"
			role="group"
			aria-label={ariaLabel}
		>
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={`px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-150 border ${
							active
								? "btn-blue-gradient text-white border-transparent shadow"
								: "bg-[#EAF4FF] text-gray-700 border-white/60 hover:bg-white"
						}`}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
};

export default SegmentedControl;
