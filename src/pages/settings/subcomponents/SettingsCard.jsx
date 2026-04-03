import React from "react";

const SettingsCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white backdrop-blur-md rounded-xl shadow-sm border border-white/60 ${className}`}
    >
      {children}
    </div>
  );
};

export default SettingsCard;
