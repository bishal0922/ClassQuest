// src/app/components/schedule/AddEditClassModal.js
import React from 'react';
import { X } from 'lucide-react';
import { buildings, validateClassTimes } from './scheduleUtils';
import TimeSelector from './TimeSelector';
import { EVENT_TYPES } from '../utility/calendarImportService';
import EventTypeSelector, { getEventTypeConfig } from './EventTypeSelector';

const AddEditClassModal = ({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  editingClass,
  onDelete,
  onSave,
}) => {
  if (!isOpen) return null;

  const eventConfig = getEventTypeConfig(newEvent.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            {editingClass !== null ? "Edit" : "Add"} Event
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <EventTypeSelector
              selectedType={newEvent.type}
              onSelect={(type) => setNewEvent({ ...newEvent, type })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {eventConfig.label} Name
            </label>
            <input
              type="text"
              placeholder={eventConfig.placeholder}
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Select Location</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <TimeSelector
                value={newEvent.startTime}
                onChange={(time) => setNewEvent({ ...newEvent, startTime: time })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <TimeSelector
                value={newEvent.endTime}
                onChange={(time) => setNewEvent({ ...newEvent, endTime: time })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            {editingClass !== null && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={onSave}
              disabled={!validateClassTimes(newEvent.startTime, newEvent.endTime)}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                ${
                  validateClassTimes(newEvent.startTime, newEvent.endTime)
                    ? `${eventConfig.color} ${eventConfig.hoverColor}`
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {editingClass !== null ? "Update" : "Add"}{" "}
              {eventConfig.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditClassModal;