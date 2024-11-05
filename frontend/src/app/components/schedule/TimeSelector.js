// src/app/components/schedule/TimeSelector.js
import React from 'react';
import { hours, minutes } from './scheduleUtils';

const parseTimeString = (timeStr) => {
  // Handle empty or invalid input
  if (!timeStr) return { hour: '08', minute: '00', period: 'AM' };
  
  const [time, period] = timeStr.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  
  // Parse hour, ensuring it's two digits
  let hour = parseInt(hourStr, 10);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  hour = hour.toString().padStart(2, '0');
  
  // Parse minute, ensuring it's two digits
  const minute = minuteStr.padStart(2, '0');

  return {
    hour: hour,
    minute: minute,
    period: period
  };
};

const formatTimeForInput = (timeStr) => {
  const { hour: rawHour, minute, period } = parseTimeString(timeStr);
  let hour = parseInt(rawHour, 10);
  
  // Convert 24-hour format to 12-hour format
  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }
  
  return {
    hour: hour.toString().padStart(2, '0'),
    minute,
    period
  };
};

// In TimeSelector.js
const TimeSelector = ({ value, onChange }) => {
  // Parse the initial time value
  const { hour, minute, period } = formatTimeForInput(value);

  const updateTime = (field, newValue) => {
    let updatedHour = field === "hour" ? newValue : hour;
    let updatedMinute = field === "minute" ? newValue : minute;
    let updatedPeriod = field === "period" ? newValue : period;

    const formattedTime = `${updatedHour}:${updatedMinute} ${updatedPeriod}`;
    onChange(formattedTime);
  };

  return (
    <div className="flex space-x-2">
      <select
        value={hour}
        onChange={(e) => updateTime("hour", e.target.value)}
        className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
      >
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <select
        value={minute}
        onChange={(e) => updateTime("minute", e.target.value)}
        className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        value={period}
        onChange={(e) => updateTime("period", e.target.value)}
        className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimeSelector;