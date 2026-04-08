import React from "react";

const SettingsCard = ({ children, className = "" }) => {
  return (
    <div
      className={`backdrop-blur-md rounded-xl  ${className}`}
    >
      {children}
    </div>
  );
};

export default SettingsCard;
