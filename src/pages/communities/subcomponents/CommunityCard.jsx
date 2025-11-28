import React from 'react';
import { IoPersonOutline } from 'react-icons/io5';

const CommunityCard = ({
  id,
  name,
  description,
  wallAssociation,
  category,
  status,
  members = 0,
  avatar = null,
  isJoined = false,
  badgeText = null,
  badgeColor = "blue",
  onJoinClick,
  onViewClick
}) => {
  const getBadgeColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'red':
        return 'bg-red-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  // Handle both array and string for category/tags
  const parseCategory = (categoryInput) => {
    if (!categoryInput) return [];
    
    // If it's already an array, use it directly
    if (Array.isArray(categoryInput)) {
      return categoryInput;
    }
    
    // If it's a string, split by bullet points and clean up
    const parts = categoryInput.split('•').map(part => part.trim());
    
    // Filter out numbers and empty strings, return only text tags
    return parts.filter(part => part && isNaN(part));
  };

  const categoryTags = parseCategory(category);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-200 relative">
      {/* Badge positioned absolutely in top right */}
      {console.log(badgeText)}
      {wallAssociation && (
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium btn-blue-gradient`}>
          {wallAssociation}
        </span>
      )}

      {/* Header with avatar and info */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {name && name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 truncate">
            {name}
          </h3>
          {/* Category tags as gray pills */}
          <div className="flex flex-wrap gap-1 mb-1">
            {categoryTags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {/* Show +N indicator if there are more than 2 tags */}
            {categoryTags.length > 2 && (
              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                +{categoryTags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Member count */}
      <div className="flex items-center space-x-1 text-xs text-gray-600 mb-4">
        <IoPersonOutline className="w-4 h-4" />
        <span>{members} members</span>
      </div>

      {/* Action button */}
      <div className="w-full">
        {isJoined ? (
          <button
            onClick={() => onViewClick && onViewClick(id)}
            className="w-full py-2.5 bg-white text-black text-sm font-medium rounded-3xl hover:bg-gray-100 transition-colors duration-200 shadow-sm"
          >
            View Community
          </button>
        ) : (
          <button
            onClick={() => onJoinClick && onJoinClick(id)}
            className="w-full py-2.5 btn-blue-gradient text-sm font-medium rounded-3xl hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            Join Community
          </button>
        )}
      </div>
    </div>
  );
};

export default CommunityCard;