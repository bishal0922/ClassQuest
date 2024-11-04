// src/app/components/schedule/ClassCard.js
import React from 'react';
import { Edit2, X, MapPin, Clock } from 'lucide-react';
import { getEventTypeConfig } from './EventTypeSelector';

const ClassCard = ({ classData, index, onEdit, onDelete }) => {
  const eventConfig = getEventTypeConfig(classData.eventType || 'class');
  const Icon = eventConfig.icon;

  return (
    <div className={`flex justify-between items-center mb-2 p-2 rounded hover:bg-gray-100 ${
      classData.isImported ? 'bg-blue-50' : 'bg-gray-50'
    }`}>
      <div>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${classData.isImported ? 'text-blue-500' : 'text-gray-500'}`} />
          <p className="font-semibold text-sm sm:text-base">
            {classData.className}
          </p>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
          <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {classData.location}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
          <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          {`${classData.startTime} - ${classData.endTime}`}
        </p>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => onEdit(index)}
          className="text-blue-500 hover:text-blue-700 mr-2"
        >
          <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};

export default ClassCard;