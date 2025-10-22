
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
	return (
		<div
			className="min-h-screen w-full flex flex-col items-center justify-center relative bg-cover bg-center"
			style={{
				backgroundImage: "url('/background.png')",
			}}
		>
			{/* Overlay for soft color effect */}
			<div className="absolute inset-0 bg-[#f7e6c4]/10 z-0" />

			{/* Main Content */}
			<div className="relative z-10 flex flex-col items-center justify-center w-full h-full pt-24 pb-16 gap-y-12 md:gap-y-16 lg:gap-y-28 ">
				<div className="flex flex-col items-center justify-center px-4">
                {/* Headings */}
				<h1 className="text-2xl sm:text-4xl md:text-5xl font-serif  text-center text-[#2d1a05] tracking-wide mb-2" style={{letterSpacing: '0.08em'}}>
					TOGETHER, WE LIVE<br />
					FOR AN AUDIENCE OF ONE
				</h1>
				<p className="text-base md:text-xl text-center text-[#2d1a05] mt-2 mb-8 ">
					Welcome! Join a Christ-centered community focused on prayer, fellowship, and spiritual growth.
				</p>

                </div>

				{/* Button */}
				<div className="flex flex-col items-center space-y-4">
					<Link to="/signup">
						<button
							className="sm:mt-4 px-6 py-2 sm:px-8 sm:py-3 rounded-full bg-[#D3AF37] hover:bg-yellow-500 text-white font-semibold  sm:text-lg shadow-lg transition-colors duration-200 cursor-pointer"
						>
							Join The Community
						</button>
					</Link>
					
					{/* Login Link */}
					<p className="text-[#2d1a05] text-sm">
						Already have an account?{' '}
						<Link 
							to="/login" 
							className="text-[#D3AF37] hover:text-yellow-500 font-semibold transition-colors duration-200 underline"
						>
							Login here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
