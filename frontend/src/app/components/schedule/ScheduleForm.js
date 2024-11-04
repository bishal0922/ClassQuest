// /**
//  * This is the ScheduleForm component.
//  *
//  * This component allows users to create and manage their class schedules.
//  * Users can add new classes, update existing ones, and view their schedule for each day of the week.
//  *
//  * The component uses React's useState hook to manage the state of the schedule, the active day,
//  * the modal for adding or editing classes, and the details of the new or edited class.
//  *
//  * The daysOfWeek array contains the days from Monday to Friday.
//  * The hours array contains the hours from 01 to 12, and the minutes array contains the minutes in 15-minute intervals.
//  * The buildings array lists the available buildings where classes can be held.
//  *
//  * The addOrUpdateClass function is used to add a new class to the schedule or update an existing class.
//  * It checks if an identical class already exists to avoid duplicates.
//  *
//  * The component renders a form where users can input the class name, location, start time, and end time.
//  * It also displays the schedule for each day and allows users to edit or delete classes.
//  *
//  * The "use client" directive at the top indicates that this component should be rendered on the client side.
//  */
"use client";

import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../lib/useAuth";
import { getUserSchedule, updateUserSchedule } from "../../lib/userModel";
import CalendarSync from "../CalendarSync";
import { daysOfWeek, getClassPositionStyle } from "./scheduleUtils";
import ClassCard from "./ClassCard";
import AddEditClassModal from "./AddEditClassModal";
import { EVENT_TYPES } from "../utility/calendarImportService";

const ScheduleForm = () => {
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });
  const [activeDay, setActiveDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: EVENT_TYPES.CLASS,
    title: "",
    location: "",
    startTime: "08:00 AM",
    endTime: "09:00 AM",
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserSchedule();
    }
  }, [user]);

  const fetchUserSchedule = async () => {
    if (user) {
      const userSchedule = await getUserSchedule(user.uid);
      if (userSchedule) {
        setSchedule(userSchedule);
      }
    }
  };

  const handleEventsImported = async (events) => {
    const updatedSchedule = { ...schedule };

    events.forEach((event) => {
      const day = event.dayOfWeek;
      if (updatedSchedule[day]) {
    // src/app/components/schedule/ScheduleForm.js (continued)

    updatedSchedule[day] = updatedSchedule[day].filter(
      (existingClass) =>
        !(
          existingClass.className === event.className ||
          (existingClass.startTime === event.startTime &&
            existingClass.endTime === event.endTime)
        )
    );

    updatedSchedule[day].push({
      className: event.className,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      isImported: true,
    });

    updatedSchedule[day].sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
      return timeA - timeB;
    });
  }
});

setSchedule(updatedSchedule);
if (user) {
  await updateUserSchedule(user.uid, updatedSchedule);
}
setShowCalendarSync(false);

if (activeDay) {
  const currentDay = activeDay;
  setActiveDay(null);
  setTimeout(() => setActiveDay(currentDay), 0);
}
};

const addOrUpdateClass = async () => {
const updatedSchedule = { ...schedule };

if (editingClass !== null) {
  updatedSchedule[activeDay] = updatedSchedule[activeDay].filter(
    (_, index) => index !== editingClass
  );
}

const formattedClass = {
  className: newEvent.title,
  location: newEvent.location,
  startTime: newEvent.startTime,
  endTime: newEvent.endTime,
  eventType: newEvent.type,
};

updatedSchedule[activeDay].push(formattedClass);

updatedSchedule[activeDay].sort((a, b) => {
  const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
  const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
  return timeA - timeB;
});

setSchedule(updatedSchedule);
if (user) {
  await updateUserSchedule(user.uid, updatedSchedule);
}

setIsModalOpen(false);
setNewEvent({
  type: EVENT_TYPES.CLASS,
  title: "",
  location: "",
  startTime: "08:00 AM",
  endTime: "09:00 AM",
});
setEditingClass(null);
};

const removeClass = async (day, index) => {
const updatedSchedule = { ...schedule };
updatedSchedule[day] = updatedSchedule[day].filter((_, i) => i !== index);

setSchedule(updatedSchedule);
if (user) {
  await updateUserSchedule(user.uid, updatedSchedule);
}

const currentDay = activeDay;
setActiveDay(null);
setTimeout(() => setActiveDay(currentDay), 0);
};

const editClass = (day, index) => {
const classToEdit = schedule[day][index];
setActiveDay(day);
setNewEvent({
  type: classToEdit.eventType || EVENT_TYPES.CLASS,
  title: classToEdit.className,
  location: classToEdit.location,
  startTime: classToEdit.startTime,
  endTime: classToEdit.endTime,
});
setEditingClass(index);
setIsModalOpen(true);
};

const renderTimetableClass = (cls, index, day) => (
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
);

return (
  <div className="max-w-full mx-auto p-2 sm:p-6 bg-gray-50 rounded-xl shadow-lg">
  {/* Header */}
  <div className="flex justify-between items-center mb-6">
    <button
      onClick={() => setShowCalendarSync(true)}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Import from Calendar
    </button>
  </div>
  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
    Your Weekly Schedule
  </h2>

  {/* Mobile Timetable View */}
  <div className="sm:hidden">
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-6 gap-1 mb-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-100 p-1">
            <div className="h-8"></div>
            {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
              <div
                key={hour}
                className="h-8 border-t border-gray-200 text-xs text-gray-500 relative"
              >
                <span className="absolute -top-3 left-0 text-[10px]">
                  {`${hour % 12 || 12}${hour < 12 ? "A" : "P"}`}
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
                {schedule[day].map((cls, index) => renderTimetableClass(cls, index, day))}
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
          <div
            key={hour}
            className="h-12 border-t border-gray-200 text-xs text-gray-500 relative"
          >
            <span className="absolute -top-3 left-0">
              {`${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`}
            </span>
          </div>
        ))}
      </div>
      {daysOfWeek.map((day) => (
        <div key={day} className="relative">
          <div className="h-12 bg-indigo-100 font-semibold text-center py-3">
            {day}
          </div>
          <div className="h-[720px] relative">
            {schedule[day].map((cls, index) => renderTimetableClass(cls, index, day))}
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
          {activeDay === day ? (
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
        {activeDay === day && (
          <div className="p-3 sm:p-4 border-t border-gray-200">
            {schedule[day].map((cls, index) => (
              <ClassCard
                key={index}
                classData={cls}
                index={index}
                onEdit={() => editClass(day, index)}
                onDelete={() => removeClass(day, index)}
              />
            ))}
            <button
              onClick={() => {
                setIsModalOpen(true);
                setActiveDay(day);
                setEditingClass(null);
                setNewEvent({
                  type: EVENT_TYPES.CLASS,
                  title: "",
                  location: "",
                  startTime: newEvent.startTime,
                  endTime: newEvent.endTime,
                });
              }}
              className="mt-2 flex items-center justify-center w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Add Event 
            </button>
          </div>
        )}
      </div>
    ))}
  </div>

  {/* Modals */}
  {isModalOpen && (
    <AddEditClassModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      newEvent={newEvent}
      setNewEvent={setNewEvent}
      editingClass={editingClass}
      onDelete={() => {
        removeClass(activeDay, editingClass);
        setIsModalOpen(false);
      }}
      onSave={addOrUpdateClass}
    />
  )}

  {showCalendarSync && (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
        <CalendarSync
          onEventsImported={handleEventsImported}
          onClose={() => setShowCalendarSync(false)}
          existingEvents={Object.entries(schedule).flatMap(([day, classes]) =>
            classes.map((cls) => ({
              ...cls,
              dayOfWeek: day,
            }))
          )}
        />
      </div>
    </div>
  )}
</div>
);
};

export default ScheduleForm;