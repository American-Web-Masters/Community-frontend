import React from 'react';
import { IoChatbubbleOutline} from "react-icons/io5";
import { PiHandsPrayingThin } from "react-icons/pi";
import { BsSend } from "react-icons/bs";
import {getActivityText,getLatestActivity,getTimeAgo } from '../../../utils/prayerUtils';
const NotificationCard = ({ prayer, activityType, onCardClick }) => {
  
   const getActivityIcon = () => {
    switch (activityType) {
      case 'comment':
        return <IoChatbubbleOutline className="w-5 h-5 text-blue-600" />;
      case 'prayed':
        return <PiHandsPrayingThin className="w-5 h-5 text-blue-600" />;
      case 'share':
        return <BsSend className="w-5 h-5 text-blue-600" />;
      default:
        return <IoChatbubbleOutline className="w-5 h-5 text-blue-600" />;
    }
  };
  const latestActivity = getLatestActivity(activityType, prayer);
  const userName = latestActivity?.user?.firstname || 'Someone';
  const prayerOwnerName = prayer.user?.firstname || null;
  const activityTime = latestActivity?.createdAt || latestActivity?.prayedAt || latestActivity?.sharedAt || prayer.createdAt;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200 min-h-32"
      onClick={() => onCardClick(prayer)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {getActivityIcon(activityType)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 ">
          <div className="flex items-start justify-between">
            <div className="flex-1 gap-y-2">
              <p className="text-medium text-gray-900">
                <span className="font-medium">You</span> {getActivityText(activityType, prayerOwnerName)}
              </p>
              <p className="text-medium text-gray-500 mt-1 line-clamp-2">
                "{prayer.content?.substring(0, 80)}..."
              </p>
            </div>
            <span className="text-sm text-gray-400 flex-shrink-0 ml-2">
              {getTimeAgo(activityTime)}
            </span>
          </div>
          
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
            {prayer.comments && prayer.comments.length > 0 && (
              <span className="flex items-center space-x-1">
                <IoChatbubbleOutline className="w-5 h-5" />
                <span>{prayer.comments.length}</span>
              </span>
            )}
            {prayer.isPrayed && prayer.isPrayed.length > 0 && (
              <span className="flex items-center space-x-1">
                <PiHandsPrayingThin className="w-5 h-5" />
                <span>{prayer.isPrayed.length}</span>
              </span>
            )}
            {prayer.shares && prayer.shares.length > 0 && (
              <span className="flex items-center space-x-1">
                <BsSend className="w-5 h-5" />
                <span>{prayer.shares.length}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
