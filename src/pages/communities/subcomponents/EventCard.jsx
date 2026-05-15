import { FaCalendarAlt, FaClock, FaBell, FaEdit, FaTrash } from 'react-icons/fa';

function EventCard({ events, isOwnerOrModerator, handleEditEvent, handleDeleteEvent, formatDate, formatTime, userTimeZone }) {
  return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            // Use local time values for display, fallback to original if not available
            const displayDate = event.localEventDate || event.eventDate;
            const displayTime = event.localEventTime || event.eventTime;
            
            return (
            <div 
              key={event._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              {/* First div: Calendar + Event Info + Icons */}
              <div className="px-4 py-3 flex">
                {/* Calendar Icon */}
                <div className="w-10 h-10 btn-blue-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaCalendarAlt className="w-5 h-5 text-white" />
                </div>
                
                {/* Event Title and Date/Time */}
                <div className="flex-1 ml-3 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {event.eventName}
                  </h3>
                  <div className="flex items-start gap-1 text-gray-700 text-sm max-sm:flex-col">
                    <div className='flex items-center gap-x-2'>
                    <FaClock className="min-w-3 min-h-3" />
                    <span>{formatDate(displayDate, displayTime)} • {formatTime(displayTime, displayDate)}</span>
                    </div>
                    {userTimeZone && (
                      <span className="text-xs text-gray-400 ml-1">({userTimeZone})</span>
                    )}
                  </div>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-start gap-1 ml-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <FaBell className="w-4 h-4 text-gray-600" />
                  </button>
                  {isOwnerOrModerator && (
                    <>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <FaEdit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <FaTrash className="w-4 h-4 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Second div: Description */}
              <div className="px-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Third div: Action Buttons */}
              <div className="px-4 py-3 mt-auto">
                <div className="flex gap-2 flex-wrap">
                  <button className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                    <a
                        href={event.calendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        Add to Calendar
                        </a>
                  </button>
                  {isOwnerOrModerator ? (
                    <button className="px-4 py-1.5 btn-blue-gradient text-white rounded-full text-sm font-medium  duration-200 shadow-sm">
                      Start Inner Circle
                    </button>
                  ) : (
                    <button className="px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors duration-200 shadow-sm">
                      Join Inner Circle
                    </button>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
  )
}

export default EventCard