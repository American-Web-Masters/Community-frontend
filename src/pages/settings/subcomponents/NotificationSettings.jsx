import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  toggleJournalCommentNotification,
  toggleJournalLikesNotification,
  toggleJournalNewEntryNotification,
} from "../../../api/settings";
import { selectUser, updateUser } from "../../../store/userSlice";

const Row = ({ title, right, children }) => {
  return (
    <div className="px-6 py-7">
      <div className="flex sm:items-center sm:justify-between gap-6 max-sm:flex-col">
        <div>
          <p className="font-semibold text-gray-900 text-lg">{title}</p>
          {children ? (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{children}</p>
          ) : null}
        </div>
        <div className="flex-shrink-0">{right}</div>
      </div>
    </div>
  );
};

const Divider = () => <div className="h-px bg-blue-100 mx-4" />;

const NotificationSettings = ({ value, onChange }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [journal, setJournal] = React.useState({
    newEntry: true,
    likes: true,
    comment: true,
  });
  const [updatingMap, setUpdatingMap] = React.useState({
    newEntry: false,
    likes: false,
    comment: false,
  });

  React.useEffect(() => {
    const notifications = user?.journalNotifications || {}
    setJournal({
      newEntry: notifications.newEntry ?? true,
      likes: notifications.likes ?? true,
      comment: notifications.comment ?? notifications.comments ?? true,
    });
  }, [user]);

  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to update journal notification."
    );
  };

  const endpointByType = {
    newEntry: toggleJournalNewEntryNotification,
    likes: toggleJournalLikesNotification,
    comment: toggleJournalCommentNotification,
  };

  const handleJournalToggle = async (type, nextValue) => {
    const previous = journal[type];
    setJournal((prev) => ({ ...prev, [type]: nextValue }));
    setUpdatingMap((prev) => ({ ...prev, [type]: true }));

    try {
      const apiCall = endpointByType[type];
      const response = await apiCall(nextValue);
      const updatedNotifications = response?.data?.journalNotifications;

      if (updatedNotifications) {
        const normalized = {
          newEntry: updatedNotifications.newEntry ?? nextValue,
          likes: updatedNotifications.likes ?? journal.likes,
          comment: updatedNotifications.comment ?? updatedNotifications.comments ?? journal.comment,
        };

        setJournal(normalized);
        dispatch(updateUser({ journalNotifications: normalized }));
      }

      toast.success(response?.message || "Journal notification updated successfully");
    } catch (error) {
      setJournal((prev) => ({ ...prev, [type]: previous }));
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [type]: false }));
    }
  };

  const communityMode = value?.communityMode || "all";

  return (
    <div>
      <Row
        title="Journal Notifications"
        right={
          <div className="flex items-center gap-4">
            <ToggleSwitch
              checked={!!journal.newEntry}
              onChange={(v) => handleJournalToggle("newEntry", v)}
              label="New Entry"
              disabled={updatingMap.newEntry}
            />
            <ToggleSwitch
              checked={!!journal.likes}
              onChange={(v) => handleJournalToggle("likes", v)}
              label="Likes"
              disabled={updatingMap.likes}
            />
            <ToggleSwitch
              checked={!!journal.comment}
              onChange={(v) => handleJournalToggle("comment", v)}
              label="Comments"
              disabled={updatingMap.comment}
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
