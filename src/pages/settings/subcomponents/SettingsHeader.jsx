import React from "react";

const SettingsHeader = ({ onSave, isSaving }) => {
  return (
  <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm">
          Control when and how you receive alerts from the community.
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
    className="lg:hidden btn-blue-gradient px-6 py-3 rounded-full text-white text-sm max-sm:text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
};

export default SettingsHeader;
