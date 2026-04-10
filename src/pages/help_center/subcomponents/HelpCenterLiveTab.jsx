import React from "react";
import { IoChatbubbles } from "react-icons/io5";

const HelpCenterLiveTab = () => {
  return (
    <section className="mt-4 rounded-[10px] border border-[#cfe2f6] bg-white/95 min-h-[450px] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="relative w-[92px] h-[72px] mx-auto">
          <IoChatbubbles className="absolute -top-2 right-2 w-full h-full text-[#8a8a8a]" />
        </div>

        <h2 className="mt-4 text-[24px] font-semibold text-[#111111]">Live Chat Support</h2>
        <p className="mt-2 text-[18px] text-[#4d4d4d]">Get instant help from our support team</p>

        <button
          type="button"
          className="mt-6 py-2.5 px-8 rounded-full btn-blue-gradient text-white text-[14px] font-medium"
        >
          Start Chat
        </button>
      </div>
    </section>
  );
};

export default HelpCenterLiveTab;
