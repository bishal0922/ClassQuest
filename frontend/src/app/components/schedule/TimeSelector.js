// src/app/components/schedule/TimeSelector.js
import React from 'react';
import { hours, minutes } from './scheduleUtils';

const TimeSelector = ({ value, onChange }) => {
  const [time, period] = value.split(" ");
  const [hour, minute] = time.split(":");

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
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select
        value={minute}
        onChange={(e) => updateTime("minute", e.target.value)}
        className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
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