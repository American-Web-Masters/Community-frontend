import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoShareOutline,
} from "react-icons/io5";
import {
  PiHandsPrayingThin,
} from "react-icons/pi";

const PrayerCard = ({
  user,
  timeAgo,
  urgency,
  prayerText,
  status,
  onPray,
  onBookmark,
  onComment,
  onShare,
  onMore,
}) => {
  const getUrgencyMeter = (urgency) => {
    let percentage = 0;
    let color = "";

    switch (urgency?.toLowerCase()) {
      case "low":
        percentage = 33.33;
        color = "bg-green-500";
        break;
      case "normal":
      case "medium":
        percentage = 66.66;
        color = "bg-yellow-500";
        break;
      case "urgent":
      case "high":
        percentage = 100;
        color = "bg-red-500";
        break;
      default:
        percentage = 33.33;
        color = "bg-green-500";
    }

    return { percentage, color };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-500 text-white";
      case "scheduled":
        return "bg-blue-600 text-white";
      case "submitted":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const urgencyMeter = getUrgencyMeter(urgency);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200/50 p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <img className="rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPnE_fy9lLMRP5DLYLnGN0LRLzZOiEpMrU4g&s" alt="banda" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">
                {user?.name || "Anonymous"}
              </h3>
              <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${urgencyMeter.color} transition-all duration-300`}
                  style={{ width: `${urgencyMeter.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {urgency}
              </span>
            </div>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {status === "Draft" && (
              <button className="bg-blue-600 btn-blue-gradient text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                Draft
              </button>
            )}
            {status === "Scheduled" && (
              <button className="btn-blue-gradient text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                Scheduled
              </button>
            )}
            <svg
              width="18"
              height="25"
              viewBox="0 0 28 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.03578 11.0538C3.03578 8.12217 4.19093 5.31059 6.24712 3.23759C8.30332 1.1646 11.0921 0 14 0C16.9079 0 19.6967 1.1646 21.7529 3.23759C23.8091 5.31059 24.9642 8.12217 24.9642 11.0538V16.9976L27.8181 22.7519C27.9494 23.0168 28.0115 23.3111 27.9983 23.6069C27.9851 23.9027 27.8971 24.1902 27.7426 24.4421C27.5882 24.694 27.3725 24.9019 27.1159 25.0461C26.8594 25.1903 26.5705 25.2659 26.2768 25.2659H20.0679C19.7195 26.6212 18.9346 27.8214 17.8363 28.6783C16.7381 29.5351 15.3887 30 14 30C12.6113 30 11.2619 29.5351 10.1637 28.6783C9.06543 27.8214 8.28049 26.6212 7.93209 25.2659H1.7232C1.42949 25.2659 1.14063 25.1903 0.884076 25.0461C0.627522 24.9019 0.411786 24.694 0.257358 24.4421C0.102931 24.1902 0.0149391 23.9027 0.00174063 23.6069C-0.0114578 23.3111 0.0505752 23.0168 0.181948 22.7519L3.03578 16.9976V11.0538ZM11.2871 25.2659C11.5621 25.746 11.9575 26.1446 12.4338 26.4218C12.91 26.699 13.4501 26.8449 14 26.8449C14.5499 26.8449 15.09 26.699 15.5662 26.4218C16.0425 26.1446 16.4379 25.746 16.7129 25.2659H11.2871ZM14 3.15824C11.9229 3.15824 9.93094 3.99009 8.46223 5.4708C6.99352 6.95151 6.16841 8.95979 6.16841 11.0538V16.9976C6.16838 17.4877 6.05523 17.971 5.83792 18.4094L4.00533 22.1077H23.9962L22.1636 18.4094C21.9458 17.9711 21.8321 17.4878 21.8316 16.9976V11.0538C21.8316 8.95979 21.0065 6.95151 19.5378 5.4708C18.0691 3.99009 16.0771 3.15824 14 3.15824Z"
                fill="#03045E"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Prayer Text */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed text-sm line-clamp-2 overflow-hidden">
          {prayerText}
        </p>
        <button className="text-blue-600 text-sm font-medium mt-1 hover:underline">
          Read more
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-blue-200/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPray}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <PiHandsPrayingThin className="w-5 h-5" />
          </button>

          <button
            onClick={onComment}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoChatbubbleOutline className="w-5 h-5" />
          </button>

          <button
            onClick={onBookmark}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoBookmarkOutline className="w-5 h-5" />
          </button>

          <button
            onClick={onShare}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <IoShareOutline className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrayerCard;
