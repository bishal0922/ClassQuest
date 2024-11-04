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

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   X,
//   ChevronDown,
//   ChevronUp,
//   Clock,
//   MapPin,
//   Edit2,
//   Calendar,
//   BookOpen,
//   FileSpreadsheet,
//   ClipboardList,
//   FileText,
//   Beaker,
//   CircleIcon,
// } from "lucide-react";
// import { useAuth } from "../lib/useAuth";
// import { getUserSchedule, updateUserSchedule } from "../lib/userModel";
// import CalendarSync from "./CalendarSync";
// import { EVENT_TYPES } from "./utility/calendarImportService";

// const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
// const hours = Array.from({ length: 12 }, (_, i) =>
//   (i + 1).toString().padStart(2, "0")
// );
// const minutes = Array.from({ length: 12 }, (_, i) =>
//   (i * 5).toString().padStart(2, "0")
// );

// const buildings = [
//   "Nedderman Hall",
//   "Commons",
//   "Science Hall",
//   "Woolf Hall",
//   "ERB",
// ];

// const eventTypeConfig = {
//   [EVENT_TYPES.CLASS]: {
//     icon: BookOpen,
//     color: "bg-blue-500",
//     hoverColor: "hover:bg-blue-600",
//     label: "Class",
//     placeholder: "Enter class name (e.g., CSE 1320)",
//   },
//   [EVENT_TYPES.EXAM]: {
//     icon: FileSpreadsheet,
//     color: "bg-red-500",
//     hoverColor: "hover:bg-red-600",
//     label: "Exam",
//     placeholder: "Enter exam name (e.g., Midterm 1)",
//   },
//   [EVENT_TYPES.QUIZ]: {
//     icon: ClipboardList,
//     color: "bg-orange-500",
//     hoverColor: "hover:bg-orange-600",
//     label: "Quiz",
//     placeholder: "Enter quiz name",
//   },
//   [EVENT_TYPES.ASSIGNMENT]: {
//     icon: FileText,
//     color: "bg-green-500",
//     hoverColor: "hover:bg-green-600",
//     label: "Assignment",
//     placeholder: "Enter assignment name",
//   },
//   [EVENT_TYPES.LAB]: {
//     icon: Beaker,
//     color: "bg-purple-500",
//     hoverColor: "hover:bg-purple-600",
//     label: "Lab",
//     placeholder: "Enter lab name",
//   },
//   [EVENT_TYPES.OTHER]: {
//     icon: Calendar,
//     color: "bg-gray-500",
//     hoverColor: "hover:bg-gray-600",
//     label: "Other",
//     placeholder: "Enter event name",
//   },
// };

// const EventTypeSelector = ({ selectedType, onSelect }) => {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//       {Object.entries(eventTypeConfig).map(([type, config]) => {
//         const Icon = config.icon;
//         const isSelected = selectedType === type;
//         return (
//           <button
//             key={type}
//             onClick={() => onSelect(type)}
//             className={`
//               ${isSelected ? `${config.color} text-white` : 'bg-gray-100 text-gray-600'}
//               ${config.hoverColor} transition-colors duration-200
//               p-3 rounded-lg flex flex-col items-center justify-center gap-2
//               border-2 ${isSelected ? 'border-transparent' : 'border-gray-200'}
//             `}
//           >
//             <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
//             <span className="text-sm font-medium">{config.label}</span>
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// const ScheduleForm = () => {
//   const [schedule, setSchedule] = useState({
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//   });
//   const [activeDay, setActiveDay] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newClass, setNewClass] = useState({
//     className: "",
//     location: "",
//     startTime: "08:00 AM",
//     endTime: "09:00 AM",
//   });
//   const [editingClass, setEditingClass] = useState(null);
//   const [showCalendarSync, setShowCalendarSync] = useState(false);
//   const [newEvent, setNewEvent] = useState({
//     type: EVENT_TYPES.CLASS,
//     title: "",
//     location: "",
//     startTime: "08:00 AM",
//     endTime: "09:00 AM",
//   });
//   const { user } = useAuth();

//   useEffect(() => {
//     if (user) {
//       fetchUserSchedule();
//     }
//   }, [user]);

//   const fetchUserSchedule = async () => {
//     if (user) {
//       const userSchedule = await getUserSchedule(user.uid);
//       if (userSchedule) {
//         setSchedule(userSchedule);
//       }
//     }
//   };

//   const handleEventsImported = async (events) => {
//     const updatedSchedule = { ...schedule };

//     events.forEach((event) => {
//       const day = event.dayOfWeek;
//       if (updatedSchedule[day]) {
//         // First, remove any existing events that match the imported event's time slot
//         // or have the same class name at a different time
//         updatedSchedule[day] = updatedSchedule[day].filter(
//           (existingClass) =>
//             !(
//               existingClass.className === event.className ||
//               (existingClass.startTime === event.startTime &&
//                 existingClass.endTime === event.endTime)
//             )
//         );

//         // Add the new/updated event
//         updatedSchedule[day].push({
//           className: event.className,
//           location: event.location,
//           startTime: event.startTime,
//           endTime: event.endTime,
//           isImported: true,
//         });

//         // Sort by start time
//         updatedSchedule[day].sort((a, b) => {
//           const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
//           const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
//           return timeA - timeB;
//         });
//       }
//     });

//     // Update both the schedule state and the database
//     setSchedule(updatedSchedule);
//     if (user) {
//       await updateUserSchedule(user.uid, updatedSchedule);
//     }
//     setShowCalendarSync(false);

//     // Force a refresh of the accordion view
//     if (activeDay) {
//       const currentDay = activeDay;
//       setActiveDay(null);
//       setTimeout(() => setActiveDay(currentDay), 0);
//     }
//   };

//   // Update addOrUpdateClass to handle the time conversion properly
//   const addOrUpdateClass = async () => {
//     const updatedSchedule = { ...schedule };
  
//     // Parse and format times
//     const formatClassTimes = (eventData) => {
//       const [startTimeStr, startPeriod] = eventData.startTime.split(" ");
//       const [endTimeStr, endPeriod] = eventData.endTime.split(" ");
//       const [startHour, startMinute] = startTimeStr.split(":");
//       const [endHour, endMinute] = endTimeStr.split(":");
  
//       return {
//         className: eventData.title, // Use the title from newEvent
//         location: eventData.location,
//         startTime: convertTo24Hour(startHour, startMinute, startPeriod),
//         endTime: convertTo24Hour(endHour, endMinute, endPeriod),
//         eventType: eventData.type // Store the event type
//       };
//     };
  
//     if (editingClass !== null) {
//       updatedSchedule[activeDay] = updatedSchedule[activeDay].filter(
//         (_, index) => index !== editingClass
//       );
//     }
  
//     const formattedClass = formatClassTimes(newEvent);
//     updatedSchedule[activeDay].push(formattedClass);
  
//     // Sort classes by start time
//     updatedSchedule[activeDay].sort((a, b) => {
//       const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
//       const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
//       return timeA - timeB;
//     });
  
//     setSchedule(updatedSchedule);
//     if (user) {
//       await updateUserSchedule(user.uid, updatedSchedule);
//     }
  
//     setIsModalOpen(false);
//     setNewEvent({
//       type: EVENT_TYPES.CLASS,
//       title: "",
//       location: "",
//       startTime: "08:00 AM",
//       endTime: "09:00 AM",
//     });
//     setEditingClass(null);
//   };
//   const removeClass = async (day, index) => {
//     const updatedSchedule = { ...schedule };
//     updatedSchedule[day] = updatedSchedule[day].filter((_, i) => i !== index);

//     // Update state and database
//     setSchedule(updatedSchedule);
//     if (user) {
//       await updateUserSchedule(user.uid, updatedSchedule);
//     }

//     // Force a refresh of the view
//     const currentDay = activeDay;
//     setActiveDay(null);
//     setTimeout(() => setActiveDay(currentDay), 0);
//   };

//   const editClass = (day, index) => {
//     const classToEdit = schedule[day][index];
  
//     const parseTimeFor12Hour = (timeStr) => {
//       const [time, period] = timeStr.split(" ");
//       let [hours, minutes] = time.split(":").map(Number);
  
//       if (period === "PM" && hours > 12) {
//         hours -= 12;
//       }
//       if (period === "AM" && hours === 0) {
//         hours = 12;
//       }
  
//       return {
//         hour: hours.toString().padStart(2, "0"),
//         minute: minutes.toString().padStart(2, "0"),
//         period,
//       };
//     };
  
//     const startTime = parseTimeFor12Hour(classToEdit.startTime);
//     const endTime = parseTimeFor12Hour(classToEdit.endTime);
  
//     setActiveDay(day);
//     setNewEvent({
//       type: classToEdit.eventType || EVENT_TYPES.CLASS,
//       title: classToEdit.className,
//       location: classToEdit.location,
//       startTime: `${startTime.hour}:${startTime.minute} ${startTime.period}`,
//       endTime: `${endTime.hour}:${endTime.minute} ${endTime.period}`,
//     });
//     setEditingClass(index);
//     setIsModalOpen(true);
//   };
//   // Add a helper function to convert back to 24-hour format when saving
//   const convertTo24Hour = (hour, minute, period) => {
//     hour = parseInt(hour);
//     minute = parseInt(minute);

//     if (period === "PM" && hour !== 12) {
//       hour += 12;
//     }
//     if (period === "AM" && hour === 12) {
//       hour = 0;
//     }

//     return `${hour.toString().padStart(2, "0")}:${minute
//       .toString()
//       .padStart(2, "0")} ${period}`;
//   };

//   const formatTimeForDisplay = (hour, minute, period) => {
//     hour = parseInt(hour);
//     if (period === "PM" && hour !== 12) {
//       hour += 12;
//     } else if (period === "AM" && hour === 12) {
//       hour = 0;
//     }
//     return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
//   };

//   const getClassPositionStyle = (startTime, endTime) => {
//     const timeToMinutes = (time) => {
//       const [timeStr, period] = time.split(" ");
//       let [hours, minutes] = timeStr.split(":").map(Number);
//       if (period === "PM" && hours !== 12) hours += 12;
//       if (period === "AM" && hours === 12) hours = 0;
//       return hours * 60 + minutes;
//     };

//     const startMinutes = timeToMinutes(startTime);
//     const endMinutes = timeToMinutes(endTime);
//     const dayStartMinutes = 8 * 60; // 8:00 AM
//     const dayEndMinutes = 22 * 60; // 10:00 PM
//     const totalDayMinutes = dayEndMinutes - dayStartMinutes;

//     const top = ((startMinutes - dayStartMinutes) / totalDayMinutes) * 100;
//     const height = ((endMinutes - startMinutes) / totalDayMinutes) * 100;

//     return {
//       top: `${Math.max(0, Math.min(100, top))}%`,
//       height: `${Math.max(0, Math.min(100 - top, height))}%`,
//     };
//   };

//   const validateClassTimes = () => {
//     const [startTimeStr, startPeriod] = newClass.startTime.split(" ");
//     const [endTimeStr, endPeriod] = newClass.endTime.split(" ");
//     const [startHour, startMinute] = startTimeStr.split(":").map(Number);
//     const [endHour, endMinute] = endTimeStr.split(":").map(Number);

//     let start = startHour * 60 + startMinute;
//     let end = endHour * 60 + endMinute;

//     if (startPeriod === "PM" && startHour !== 12) start += 12 * 60;
//     if (endPeriod === "PM" && endHour !== 12) end += 12 * 60;
//     if (startPeriod === "AM" && startHour === 12) start -= 12 * 60;
//     if (endPeriod === "AM" && endHour === 12) end -= 12 * 60;

//     return start < end;
//   };

//   // Update the renderTimeSelector function
//   const renderTimeSelector = (type) => {
//     const timeValue = newEvent[type]; // Changed from newClass to newEvent
//     const [time, period] = timeValue.split(" ");
//     const [hour, minute] = time.split(":");
  
//     const updateTime = (field, value) => {
//       let updatedHour = field === "hour" ? value : hour;
//       let updatedMinute = field === "minute" ? value : minute;
//       let updatedPeriod = field === "period" ? value : period;
  
//       const formattedTime = `${updatedHour}:${updatedMinute} ${updatedPeriod}`;
//       setNewEvent({ ...newEvent, [type]: formattedTime }); // Changed from newClass to newEvent
//     };
  
//     return (
//       <div className="flex space-x-2">
//         <select
//           value={hour}
//           onChange={(e) => updateTime("hour", e.target.value)}
//           className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
//         >
//           {hours.map((h) => (
//             <option key={h} value={h}>
//               {h}
//             </option>
//           ))}
//         </select>
//         <select
//           value={minute}
//           onChange={(e) => updateTime("minute", e.target.value)}
//           className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
//         >
//           {minutes.map((m) => (
//             <option key={m} value={m}>
//               {m}
//             </option>
//           ))}
//         </select>
//         <select
//           value={period}
//           onChange={(e) => updateTime("period", e.target.value)}
//           className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
//         >
//           <option value="AM">AM</option>
//           <option value="PM">PM</option>
//         </select>
//       </div>
//     );
//   };
//   const getCurrentScheduleEvents = () => {
//     return Object.entries(schedule).flatMap(([day, classes]) =>
//       classes.map((cls) => ({
//         ...cls,
//         dayOfWeek: day,
//       }))
//     );
//   };

//   return (
//     <div className="max-w-full mx-auto p-2 sm:p-6 bg-gray-50 rounded-xl shadow-lg">
//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={() => setShowCalendarSync(true)}
//           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//         >
//           <Calendar className="mr-2 -ml-1 h-5 w-5" />
//           Import from Calendar
//         </button>
//       </div>
//       <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
//         Your Weekly Schedule
//       </h2>

//       {/* Mobile Timetable View */}
//       <div className="sm:hidden">
//         <div className="overflow-x-auto">
//           <div className="inline-block min-w-full">
//             <div className="grid grid-cols-6 gap-1 mb-8 bg-white rounded-lg shadow overflow-hidden">
//               <div className="bg-gray-100 p-1">
//                 <div className="h-8"></div>
//                 {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
//                   <div
//                     key={hour}
//                     className="h-8 border-t border-gray-200 text-xs text-gray-500 relative"
//                   >
//                     <span className="absolute -top-3 left-0 text-[10px]">
//                       {`${hour % 12 || 12}${hour < 12 ? "A" : "P"}`}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               {daysOfWeek.map((day) => (
//                 <div key={day} className="relative">
//                   <div className="h-8 bg-indigo-100 font-semibold text-center py-1 text-xs">
//                     {day.slice(0, 3)}
//                   </div>
//                   <div className="h-[480px] relative">
//                     {schedule[day].map((cls, index) => (
//                       <div
//                         key={index}
//                         style={getClassPositionStyle(
//                           cls.startTime,
//                           cls.endTime
//                         )}
//                         className="absolute inset-x-0 bg-indigo-200 border-l-4 border-indigo-500 p-1 overflow-hidden cursor-pointer hover:bg-indigo-300 transition-colors"
//                         onClick={() => editClass(day, index)}
//                       >
//                         <p className="text-[8px] font-semibold truncate">
//                           {cls.className}
//                         </p>
//                         <p className="text-[6px] truncate">{cls.location}</p>
//                         <p className="text-[6px] truncate">{`${
//                           cls.startTime.split(" ")[0]
//                         } - ${cls.endTime.split(" ")[0]}`}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Desktop Timetable View */}
//       <div className="hidden sm:block">
//         <div className="grid grid-cols-6 gap-1 mb-8 bg-white rounded-lg shadow overflow-hidden">
//           <div className="bg-gray-100 p-2">
//             <div className="h-12"></div>
//             {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
//               <div
//                 key={hour}
//                 className="h-12 border-t border-gray-200 text-xs text-gray-500 relative"
//               >
//                 <span className="absolute -top-3 left-0">
//                   {`${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`}
//                 </span>
//               </div>
//             ))}
//           </div>
//           {daysOfWeek.map((day) => (
//             <div key={day} className="relative">
//               <div className="h-12 bg-indigo-100 font-semibold text-center py-3">
//                 {day}
//               </div>
//               <div className="h-[720px] relative">
//                 {schedule[day].map((cls, index) => (
//                   <div
//                     key={index}
//                     style={getClassPositionStyle(cls.startTime, cls.endTime)}
//                     className="absolute inset-x-0 bg-indigo-200 border-l-4 border-indigo-500 p-1 overflow-hidden cursor-pointer hover:bg-indigo-300 transition-colors"
//                     onClick={() => editClass(day, index)}
//                   >
//                     <p className="text-xs font-semibold truncate">
//                       {cls.className}
//                     </p>
//                     <p className="text-xs truncate">{cls.location}</p>
//                     <p className="text-xs truncate">{`${cls.startTime} - ${cls.endTime}`}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Day Accordions */}
//       <div className="space-y-2">
//         {daysOfWeek.map((day) => (
//           <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
//             <button
//               onClick={() => setActiveDay(activeDay === day ? null : day)}
//               className="w-full flex justify-between items-center p-3 sm:p-4 text-left hover:bg-gray-50"
//             >
//               <span className="text-sm sm:text-lg font-semibold">{day}</span>
//               {activeDay === day ? (
//                 <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
//               ) : (
//                 <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
//               )}
//             </button>
//             {activeDay === day && (
//               <div className="p-3 sm:p-4 border-t border-gray-200">
//                 {schedule[day].map((cls, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
//                   >
//                     <div>
//                       <p className="font-semibold text-sm sm:text-base">
//                         {cls.className}
//                       </p>
//                       <p className="text-xs sm:text-sm text-gray-600 flex items-center">
//                         <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />{" "}
//                         {cls.location}
//                       </p>
//                       <p className="text-xs sm:text-sm text-gray-600 flex items-center">
//                         <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />{" "}
//                         {`${cls.startTime} - ${cls.endTime}`}
//                       </p>
//                     </div>
//                     <div className="flex items-center">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           editClass(day, index);
//                         }}
//                         className="text-blue-500 hover:text-blue-700 mr-2"
//                       >
//                         <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           removeClass(day, index);
//                         }}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4 sm:h-5 sm:w-5" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//         <button
//   onClick={() => {
//     setIsModalOpen(true);
//     setActiveDay(day);
//     setEditingClass(null);
//     setNewEvent({
//       type: EVENT_TYPES.CLASS,
//       title: "",
//       location: "",
//       startTime: newEvent.startTime, // Preserve the selected times
//       endTime: newEvent.endTime,     // instead of resetting them
//     });
//   }}
//   className="mt-2 flex items-center justify-center w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
// >
//   <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
//   Add Class
// </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Add/Edit Class Modal */}
//       {isModalOpen && (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-4">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-2xl font-semibold text-gray-900">
//             {editingClass !== null ? "Edit" : "Add"} Event
//           </h3>
//           <button
//             onClick={() => setIsModalOpen(false)}
//             className="text-gray-400 hover:text-gray-500 transition-colors"
//           >
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         <div className="space-y-6">
//           {/* Event Type Selector */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Event Type
//             </label>
//             <EventTypeSelector
//               selectedType={newEvent.type}
//               onSelect={(type) => setNewEvent({ ...newEvent, type })}
//             />
//           </div>

//           {/* Title Input */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               {eventTypeConfig[newEvent.type].label} Name
//             </label>
//             <input
//               type="text"
//               placeholder={eventTypeConfig[newEvent.type].placeholder}
//               value={newEvent.title}
//               onChange={(e) =>
//                 setNewEvent({ ...newEvent, title: e.target.value })
//               }
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//             />
//           </div>

//           {/* Location Input */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Location
//             </label>
//             <select
//               value={newEvent.location}
//               onChange={(e) =>
//                 setNewEvent({ ...newEvent, location: e.target.value })
//               }
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//             >
//               <option value="">Select Location</option>
//               {buildings.map((building) => (
//                 <option key={building} value={building}>
//                   {building}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Time Selection */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time
//               </label>
//               {renderTimeSelector("startTime")}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 End Time
//               </label>
//               {renderTimeSelector("endTime")}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end space-x-3 mt-6">
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               Cancel
//             </button>
//             {editingClass !== null && (
//               <button
//                 onClick={() => {
//                   removeClass(activeDay, editingClass);
//                   setIsModalOpen(false);
//                 }}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Delete
//               </button>
//             )}
//             <button
//               onClick={addOrUpdateClass}
//               disabled={!validateClassTimes()}
//               className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
//                 ${
//                   validateClassTimes()
//                     ? `${eventTypeConfig[newEvent.type].color} ${eventTypeConfig[newEvent.type].hoverColor}`
//                     : "bg-gray-400 cursor-not-allowed"
//                 }`}
//             >
//               {editingClass !== null ? "Update" : "Add"}{" "}
//               {eventTypeConfig[newEvent.type].label}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )}

//       {/* Calendar Sync Modal */}
//       {showCalendarSync && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//             <CalendarSync
//               onEventsImported={handleEventsImported}
//               onClose={() => setShowCalendarSync(false)}
//               existingEvents={getCurrentScheduleEvents()}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ScheduleForm;

// src/app/components/schedule/ScheduleForm.js
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