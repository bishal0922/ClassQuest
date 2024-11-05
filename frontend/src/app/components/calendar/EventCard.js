import React from 'react';
import { Clock, MapPin, Repeat } from 'lucide-react';
import { getEventIcon } from '../../utils/eventIcons';

const EventCard = ({ event, isSelected, onSelect }) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(event, e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              {getEventIcon(event)}
              <p className="ml-2 font-medium text-gray-900">
                {event.summary}
              </p>
              {event.existingDetails ? (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  Update Available
                </span>
              ) : (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  New
                </span>
              )}
            </div>

            <div className="mt-1 text-sm text-gray-500 space-y-1">
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(event.start.dateTime).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
                {event.dayOfWeek && (
                  <span className="ml-2 text-indigo-600 font-medium">
                    ({event.dayOfWeek})
                  </span>
                )}
              </p>
              {event.location && (
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </p>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {event.isRecurring && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <Repeat className="h-3 w-3 mr-1" />
                  Recurring
                </span>
              )}
              {event.recurringPattern && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {event.recurringPattern}
                </span>
              )}
              {event.analysis?.type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.analysis.type.charAt(0).toUpperCase() + event.analysis.type.slice(1)}
                </span>
              )}
            </div>

            {event.existingDetails && (
              <div className="mt-1 text-xs text-gray-500">
                <p className="font-medium text-amber-600">Updates available:</p>
                {event.changes?.location && <p>• Location changed</p>}
                {event.changes?.time && <p>• Time changed</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;