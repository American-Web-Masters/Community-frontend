import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  toggleCommunityNotifications,
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
  const [communityEnabled, setCommunityEnabled] = React.useState(true);
  const [updatingCommunity, setUpdatingCommunity] = React.useState(false);

  React.useEffect(() => {
    const notifications = user?.journalNotifications || {};
    setJournal({
      newEntry: notifications.newEntry ?? true,
      likes: notifications.likes ?? true,
      comment: notifications.comment ?? notifications.comments ?? true,
    });
  }, [user]);

  React.useEffect(() => {
    const rawCommunityNotifications = user?.communityNotifications;

    const normalizedFromUser =
      typeof rawCommunityNotifications === "boolean"
        ? rawCommunityNotifications
        : rawCommunityNotifications?.enabled ?? rawCommunityNotifications?.toggle;

    if (typeof normalizedFromUser === "boolean") {
      setCommunityEnabled(normalizedFromUser);
      return;
    }

    setCommunityEnabled((value?.communityMode || "all") !== "off");
  }, [user, value?.communityMode]);

  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to update notification."
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

  const handleCommunityToggle = async (nextValue) => {
    const previousValue = communityEnabled;

    setCommunityEnabled(nextValue);
    setUpdatingCommunity(true);
    onChange?.({
      ...value,
      communityMode: nextValue ? "all" : "off",
    });

    try {
      const response = await toggleCommunityNotifications(nextValue);
      const responseCommunity = response?.data?.communityNotifications;

      const normalizedFromResponse =
        typeof responseCommunity === "boolean"
          ? responseCommunity
          : responseCommunity?.enabled ?? responseCommunity?.toggle;

      const finalValue =
        typeof normalizedFromResponse === "boolean" ? normalizedFromResponse : nextValue;

      setCommunityEnabled(finalValue);
      onChange?.({
        ...value,
        communityMode: finalValue ? "all" : "off",
      });

      dispatch(updateUser({ communityNotifications: finalValue }));
      toast.success(response?.message || "Community notifications updated successfully");
    } catch (error) {
      setCommunityEnabled(previousValue);
      onChange?.({
        ...value,
        communityMode: previousValue ? "all" : "off",
      });
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingCommunity(false);
    }
  };

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
            checked={communityEnabled}
            onChange={handleCommunityToggle}
            label={communityEnabled ? "On" : "Off"}
            disabled={updatingCommunity}
          />
        }
      />
    </div>
  );
};

export default NotificationSettings;
