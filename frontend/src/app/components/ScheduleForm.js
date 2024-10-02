/**
 * This is the ScheduleForm component.
 * 
 * This component allows users to create and manage their class schedules.
 * Users can add new classes, update existing ones, and view their schedule for each day of the week.
 * 
 * The component uses React's useState hook to manage the state of the schedule, the active day, 
 * the modal for adding or editing classes, and the details of the new or edited class.
 * 
 * The daysOfWeek array contains the days from Monday to Friday.
 * The hours array contains the hours from 01 to 12, and the minutes array contains the minutes in 15-minute intervals.
 * The buildings array lists the available buildings where classes can be held.
 * 
 * The addOrUpdateClass function is used to add a new class to the schedule or update an existing class.
 * It checks if an identical class already exists to avoid duplicates.
 * 
 * The component renders a form where users can input the class name, location, start time, and end time.
 * It also displays the schedule for each day and allows users to edit or delete classes.
 * 
 * The "use client" directive at the top indicates that this component should be rendered on the client side.
 */

"use client"

import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Clock, MapPin, Edit2 } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

const buildings = [
  "Nedderman Hall",
  "Commons",
  "Science Hall",
  "Woolf Hall",
  "ERB"
];

const ScheduleForm = () => {
  const [schedule, setSchedule] = useState({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
  });
  
  const [activeDay, setActiveDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ className: '', location: '', startTime: '', endTime: '' });
  const [editingClass, setEditingClass] = useState(null);

  const addOrUpdateClass = () => {
    setSchedule(prev => {
      const updatedSchedule = { ...prev };
      if (editingClass !== null) {
        // Update existing class
        updatedSchedule[activeDay][editingClass] = newClass;
      } else {
        // Add new class
        // Check if an identical class already exists
        const classExists = updatedSchedule[activeDay].some(
          cls => 
            cls.className === newClass.className &&
            cls.location === newClass.location &&
            cls.startTime === newClass.startTime &&
            cls.endTime === newClass.endTime
        );
        
        if (!classExists) {
          updatedSchedule[activeDay].push(newClass);
        }
      }
      return updatedSchedule;
    });
    setIsModalOpen(false);
    setNewClass({ className: '', location: '', startTime: '08:00 AM', endTime: '09:00 AM' });
    setEditingClass(null);
  };


  const removeClass = (day, index) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const editClass = (day, index) => {
    setActiveDay(day);
    setNewClass(schedule[day][index]);
    setEditingClass(index);
    setIsModalOpen(true);
  };

  const getClassPositionStyle = (startTime, endTime) => {
    const timeToMinutes = (time) => {
      const [timeStr, period] = time.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const dayStartMinutes = 8 * 60; // 8:00 AM
    const dayEndMinutes = 22 * 60; // 10:00 PM
    const totalDayMinutes = dayEndMinutes - dayStartMinutes;

    const top = ((startMinutes - dayStartMinutes) / totalDayMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalDayMinutes) * 100;

    return { 
      top: `${Math.max(0, Math.min(100, top))}%`,
      height: `${Math.max(0, Math.min(100 - top, height))}%`
    };
  };

  const validateClassTimes = () => {
    const [startTimeStr, startPeriod] = newClass.startTime.split(' ');
    const [endTimeStr, endPeriod] = newClass.endTime.split(' ');
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    let start = startHour * 60 + startMinute;
    let end = endHour * 60 + endMinute;

    if (startPeriod === 'PM' && startHour !== 12) start += 12 * 60;
    if (endPeriod === 'PM' && endHour !== 12) end += 12 * 60;
    if (startPeriod === 'AM' && startHour === 12) start -= 12 * 60;
    if (endPeriod === 'AM' && endHour === 12) end -= 12 * 60;

    return start < end;
  };

  const renderTimeSelector = (type) => {
    const [hour, minute, period] = newClass[type].split(/[:\s]/);

    const updateTime = (field, value) => {
      let updatedHour = field === 'hour' ? value : hour;
      let updatedMinute = field === 'minute' ? value : minute;
      let updatedPeriod = field === 'period' ? value : period;
      const formattedTime = `${updatedHour}:${updatedMinute} ${updatedPeriod}`;
      setNewClass({ ...newClass, [type]: formattedTime });
    };

    return (
      <div className="flex space-x-2">
        <select value={hour} onChange={(e) => updateTime('hour', e.target.value)} className="w-1/3 p-2 border rounded">
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select value={minute} onChange={(e) => updateTime('minute', e.target.value)} className="w-1/3 p-2 border rounded">
          {minutes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={period} onChange={(e) => updateTime('period', e.target.value)} className="w-1/3 p-2 border rounded">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-2 sm:p-6 bg-gray-50 rounded-xl shadow-lg">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Your Weekly Schedule</h2>
    
    {/* Mobile Timetable View */}
    <div className="sm:hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-6 gap-1 mb-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-100 p-1">
              <div className="h-8"></div>
              {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
                <div key={hour} className="h-8 border-t border-gray-200 text-xs text-gray-500 relative">
                  <span className="absolute -top-3 left-0 text-[10px]">
                    {`${hour % 12 || 12}${hour < 12 ? 'A' : 'P'}`}
                  </span>
                </div>
              ))}
            </div>
            {daysOfWeek.map((day) => (
              <div key={day} className="relative">
                <div className="h-8 bg-indigo-100 font-semibold text-center py-1 text-xs">
                  {day.slice(0, 3)}
                </div>
                <div className="h-[480px] relative">
                  {schedule[day].map((cls, index) => (
                    <div
                      key={index}
                      style={getClassPositionStyle(cls.startTime, cls.endTime)}
                      className="absolute inset-x-0 bg-indigo-200 border-l-4 border-indigo-500 p-1 overflow-hidden cursor-pointer hover:bg-indigo-300 transition-colors"
                      onClick={() => editClass(day, index)}
                    >
                      <p className="text-[8px] font-semibold truncate">{cls.className}</p>
                      <p className="text-[6px] truncate">{cls.location}</p>
                      <p className="text-[6px] truncate">{`${cls.startTime.split(' ')[0]} - ${cls.endTime.split(' ')[0]}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Desktop Timetable View */}
    <div className="hidden sm:block">
      <div className="grid grid-cols-6 gap-1 mb-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-100 p-2">
          <div className="h-12"></div>
          {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
            <div key={hour} className="h-12 border-t border-gray-200 text-xs text-gray-500 relative">
              <span className="absolute -top-3 left-0">
                {`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`}
              </span>
            </div>
          ))}
        </div>
        {daysOfWeek.map((day) => (
          <div key={day} className="relative">
            <div className="h-12 bg-indigo-100 font-semibold text-center py-3">{day}</div>
            <div className="h-[720px] relative">
              {schedule[day].map((cls, index) => (
                <div
                  key={index}
                  style={getClassPositionStyle(cls.startTime, cls.endTime)}
                  className="absolute inset-x-0 bg-indigo-200 border-l-4 border-indigo-500 p-1 overflow-hidden cursor-pointer hover:bg-indigo-300 transition-colors"
                  onClick={() => editClass(day, index)}
                >
                  <p className="text-xs font-semibold truncate">{cls.className}</p>
                  <p className="text-xs truncate">{cls.location}</p>
                  <p className="text-xs truncate">{`${cls.startTime} - ${cls.endTime}`}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Day Accordions */}
    <div className="space-y-2">
      {daysOfWeek.map((day) => (
        <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
          <button
            onClick={() => setActiveDay(activeDay === day ? null : day)}
            className="w-full flex justify-between items-center p-3 sm:p-4 text-left hover:bg-gray-50"
          >
            <span className="text-sm sm:text-lg font-semibold">{day}</span>
            {activeDay === day ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          {activeDay === day && (
            <div className="p-3 sm:p-4 border-t border-gray-200">
              {schedule[day].map((cls, index) => (
                <div key={index} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{cls.className}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {cls.location}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {`${cls.startTime} - ${cls.endTime}`}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => editClass(day, index)} className="text-blue-500 hover:text-blue-700 mr-2">
                      <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button onClick={() => removeClass(day, index)} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setActiveDay(day);
                  setEditingClass(null);
                  setNewClass({ className: '', location: '', startTime: '08:00 AM', endTime: '09:00 AM' });
                }}
                className="mt-2 flex items-center justify-center w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add Class
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

      {/* Add/Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{editingClass !== null ? 'Edit' : 'Add'} Class for {activeDay}</h3>
            <input
              type="text"
              placeholder="Class Name"
              value={newClass.className}
              onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />
            <select
              value={newClass.location}
              onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              {renderTimeSelector('startTime')}
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              {renderTimeSelector('endTime')}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addOrUpdateClass}
                disabled={!validateClassTimes()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {editingClass !== null ? 'Update' : 'Add'} Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleForm;