import React, { useId, useMemo, useState } from "react";

const ChevronDown = ({ className = "" }) => (
	<svg
		className={className}
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M6 9L12 15L18 9"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * A Settings-style accordion row.
 * - title: left aligned label
 * - children: expanded content
 * - defaultOpen: initial open state
 */
const AccordionRow = ({ title, description, children, defaultOpen = false }) => {
	const [open, setOpen] = useState(defaultOpen);
	const reactId = useId();
	const contentId = useMemo(() => `acc-${reactId}`, [reactId]);

	return (
		<div className="px-10 py-6">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
				aria-expanded={open}
				aria-controls={contentId}
			>
				<div className="min-w-0">
					<p className="text-[16px] font-semibold text-gray-900">{title}</p>
					{description ? (
						<p className="mt-1 text-[12px] sm:text-[13px] text-gray-500 leading-snug">
							{description}
						</p>
					) : null}
				</div>
				<span
					className={`text-gray-500 transition-transform duration-200 ${
						open ? "rotate-180" : "rotate-0"
					}`}
				>
					
                    <ChevronDown />
				</span>
			</button>

			<div
				id={contentId}
				className={`${open ? "mt-4" : "mt-0"} ${open ? "block" : "hidden"}`}
			>
				<div className="rounded-xl bg-[#F7FAFF] border border-blue-100 px-5 py-4">
					<div className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed space-y-3">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AccordionRow;
