import React from "react";
import ToggleSwitch from "./ToggleSwitch";

const Row = ({ title, right, children }) => {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="font-semibold text-gray-900 text-sm sm:text-base">{title}</p>
          {children ? (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{children}</p>
          ) : null}
        </div>
        <div className="flex-shrink-0">{right}</div>
      </div>
    </div>
  );
};

const Divider = () => <div className="h-px bg-blue-100 mx-6" />;

const NotificationSettings = ({ value, onChange }) => {
  // value shape:
  // { journal: { newEntry, likes, comments }, communityMode: 'all'|'highlights'|'off' }
  const journal = value?.journal || { newEntry: true, likes: true, comments: true };
  const communityMode = value?.communityMode || "all";

  return (
    <div>
      <Row
        title="Journal Notifications"
        right={
          <div className="flex items-center gap-4">
            <ToggleSwitch
              checked={!!journal.newEntry}
              onChange={(v) => onChange({ ...value, journal: { ...journal, newEntry: v } })}
              label="New Entry"
            />
            <ToggleSwitch
              checked={!!journal.likes}
              onChange={(v) => onChange({ ...value, journal: { ...journal, likes: v } })}
              label="Likes"
            />
            <ToggleSwitch
              checked={!!journal.comments}
              onChange={(v) =>
                onChange({ ...value, journal: { ...journal, comments: v } })
              }
              label="Comments"
            />
          </div>
        }
      />

      <Divider />

      <Row
        title="Community Notifications"
        right={
          <ToggleSwitch
            checked={communityMode !== "off"}
            onChange={(v) =>
              onChange({
                ...value,
                // Keep shape stable: treat toggle as on/off; when on use 'all' as default.
                communityMode: v ? "all" : "off",
              })
            }
            label={communityMode !== "off" ? "On" : "Off"}
          />
        }
      />
    </div>
  );
};

export default NotificationSettings;
