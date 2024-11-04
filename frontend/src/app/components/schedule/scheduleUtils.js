// src/app/components/schedule/scheduleUtils.js

export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const hours = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);

export const minutes = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);

export const buildings = [
  "Nedderman Hall",
  "Commons",
  "Science Hall",
  "Woolf Hall",
  "ERB",
];

export const validateClassTimes = (startTime, endTime) => {
  const [startTimeStr, startPeriod] = startTime.split(" ");
  const [endTimeStr, endPeriod] = endTime.split(" ");
  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  const [endHour, endMinute] = endTimeStr.split(":").map(Number);

  let start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;

  if (startPeriod === "PM" && startHour !== 12) start += 12 * 60;
  if (endPeriod === "PM" && endHour !== 12) end += 12 * 60;
  if (startPeriod === "AM" && startHour === 12) start -= 12 * 60;
  if (endPeriod === "AM" && endHour === 12) end -= 12 * 60;

  return start < end;
};

export const getClassPositionStyle = (startTime, endTime) => {
  const timeToMinutes = (time) => {
    const [timeStr, period] = time.split(" ");
    let [hours, minutes] = timeStr.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
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
    height: `${Math.max(0, Math.min(100 - top, height))}%`,
  };
};

export const formatTimeForDisplay = (hour, minute, period) => {
  hour = parseInt(hour);
  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }
  return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
};