import React from 'react';
import { IoClose } from "react-icons/io5";
import { 
  getTimelineUserName, 
  getTimelineActivityText, 
  getTimelineActivityIcon, 
  formatTimelineTime 
} from "../../../utils/prayerUtils";

const TimelineModal = ({
  showTimelineModal,
  setShowTimelineModal,
  timelineData
}) => {
  if (!showTimelineModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Prayer Timeline ({timelineData.length} activities)
          </h3>
          <button
            onClick={() => setShowTimelineModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {timelineData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No timeline activities yet.</p>
              </div>
            ) : (
              timelineData.map((activity, index) => (
                <div key={activity._id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    {getTimelineActivityIcon(activity.activityType, activity.activityData?.reactionEmoji)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">
                            {getTimelineUserName(activity)}
                          </span>{' '}
                          {getTimelineActivityText(activity.activityType, activity.activityData)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTimelineTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
