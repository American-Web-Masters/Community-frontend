import React, { useId } from "react";

const ToggleSwitch = ({ checked, onChange, label, disabled = false }) => {
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer ${
          checked ? "bg-blue-900" : "bg-blue-100"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      {label ? (
        <span id={`${id}-label`} className="text-xs sm:text-sm text-black font-semibold">
          {label}
        </span>
      ) : null}
    </div>
  );
};

export default ToggleSwitch;
