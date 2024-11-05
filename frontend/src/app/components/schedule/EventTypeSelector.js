// src/app/components/schedule/EventTypeSelector.js
import React from 'react';
import { EVENT_TYPES } from '../utility/calendarImportService';
import { BookOpen, FileSpreadsheet, ClipboardList, FileText, Beaker, Calendar } from 'lucide-react';

const eventTypeConfig = {
  [EVENT_TYPES.CLASS]: {
    icon: BookOpen,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    label: "Class",
    placeholder: "Enter class name (e.g., CSE 1320)",
  },
  [EVENT_TYPES.EXAM]: {
    icon: FileSpreadsheet,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    label: "Exam",
    placeholder: "Enter exam name (e.g., Midterm 1)",
  },
  [EVENT_TYPES.QUIZ]: {
    icon: ClipboardList,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    label: "Quiz",
    placeholder: "Enter quiz name",
  },
  [EVENT_TYPES.ASSIGNMENT]: {
    icon: FileText,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    label: "Assignment",
    placeholder: "Enter assignment name",
  },
  [EVENT_TYPES.LAB]: {
    icon: Beaker,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    label: "Lab",
    placeholder: "Enter lab name",
  },
  [EVENT_TYPES.OTHER]: {
    icon: Calendar,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    label: "Other",
    placeholder: "Enter event name",
  },
};

const EventTypeSelector = ({ selectedType, onSelect }) => {
  // Ensure selectedType is valid, default to CLASS if not
  const validType = Object.values(EVENT_TYPES).includes(selectedType) 
    ? selectedType 
    : EVENT_TYPES.CLASS;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      {Object.entries(eventTypeConfig).map(([type, config]) => {
        const Icon = config.icon;
        const isSelected = validType === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`
              ${isSelected ? `${config.color} text-white` : 'bg-gray-100 text-gray-600'}
              ${config.hoverColor} transition-colors duration-200
              p-3 rounded-lg flex flex-col items-center justify-center gap-2
              border-2 ${isSelected ? 'border-transparent' : 'border-gray-200'}
            `}
          >
            <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
            <span className="text-sm font-medium">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const getEventTypeConfig = (type) => eventTypeConfig[type];

export default EventTypeSelector;