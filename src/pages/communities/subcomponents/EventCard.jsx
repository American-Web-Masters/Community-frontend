import { useState } from 'react';
import { FaCalendarAlt, FaClock, FaBell, FaEdit, FaTrash } from 'react-icons/fa';

function EventCard({
  events,
  isOwnerOrModerator,
  handleEditEvent,
  handleDeleteEvent,
  handleStartInnerCircle,
  handleJoinInnerCircle,
  formatDate,
  formatTime,
  userTimeZone,
}) {
  const [pendingAction, setPendingAction] = useState({ eventId: null, type: null });

  const runAction = async (event, type, action) => {
    if (!action) return;

    setPendingAction({ eventId: event._id, type });

    try {
      await action(event);
    } finally {
      setPendingAction((current) => (
        current.eventId === event._id && current.type === type
          ? { eventId: null, type: null }
          : current
      ));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((event) => {
        // Use local time values for display, fallback to original if not available
        const displayDate = event.localEventDate || event.eventDate;
        const displayTime = event.localEventTime || event.eventTime;
        const eventStatus = event.status || 'scheduled';
        const isScheduled = eventStatus === 'scheduled';
        const isLive = eventStatus === 'live';
        const isEnded = eventStatus === 'ended';

        return (
          <div
            key={event._id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* First div: Calendar + Event Info + Icons */}
            <div className="px-4 py-3 flex">
              {/* Calendar Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-zinc-800 to-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
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
                {!isEnded && <a
                  className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-sky-300 transition-all duration-300 ease-out inline-flex items-center cursor-pointer"
                  href={event.calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to Calendar
                </a>}
                {isScheduled && isOwnerOrModerator && (
                  <button
                    onClick={() => runAction(event, 'start', handleStartInnerCircle)}
                    disabled={pendingAction.eventId === event._id && pendingAction.type === 'start'}
                    className="group px-4 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-600 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-80 disabled:cursor-wait disabled:hover:scale-100 inline-flex items-center gap-2 cursor-pointer"
                  >
                    {pendingAction.eventId === event._id && pendingAction.type === 'start' ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5 cursor-pointer">Start Inner Circle</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </>
                    )}
                  </button>
                )}
                {isLive && (
                  <button
                    onClick={() => runAction(event, 'join', handleJoinInnerCircle)}
                    disabled={pendingAction.eventId === event._id && pendingAction.type === 'join'}
                    className="group px-4 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-80 disabled:cursor-wait disabled:hover:scale-100 inline-flex items-center gap-2"
                  >
                    {pendingAction.eventId === event._id && pendingAction.type === 'join' ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <span className="cursor-pointer">Join Inner Circle</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </>
                    )}
                  </button>
                )}
                {isEnded && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    Ended
                  </span>
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