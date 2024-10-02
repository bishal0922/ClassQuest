/**
 * This is the ScheduleComparison component.
 * It allows users to select multiple users and compare their schedules.
 * The component uses React's useState hook to manage the state of selected users and the comparison result.
 * The mockUsers array is a placeholder for user data. In a real application, this data would likely come from an API or database.
 * The handleUserSelect function is used to add or remove users from the selectedUsers state when a user clicks on a button.
 * The handleCompare function is a placeholder for the actual comparison logic. It sets a mock comparison result for now.
 * The component renders a list of user buttons and a "Compare Schedules" button. The "Compare Schedules" button is disabled until at least two users are selected.
 * When the "Compare Schedules" button is clicked, the handleCompare function is called, and the comparison result is displayed.
 */
"use client"

import React, { useState } from 'react';

const ScheduleComparison = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);

  const mockUsers = [
    { id: '1', name: 'Cole Palmer' },
    { id: '2', name: 'Nicolas Jackson' },
    { id: '3', name: 'Jadon Sancho' },
  ];

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCompare = () => {
    // Mock comparison result
    setComparisonResult("Users' schedules compared. Free times: Monday 2-4pm, Wednesday 1-3pm. Refer to calendar for more details.");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Users to Compare</h2>
      <div className="mb-4">
        {mockUsers.map(user => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              selectedUsers.includes(user.id)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {user.name}
          </button>
        ))}
      </div>
      <button
        onClick={handleCompare}
        disabled={selectedUsers.length < 2}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        Compare Schedules
      </button>
      {comparisonResult && (
        <div className="mt-4 p-4 bg-white rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">Mock Comparison Result</h3>
          <p>{comparisonResult}</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleComparison;