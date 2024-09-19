import React from 'react';
import ScheduleForm from '../components/ScheduleForm';

const SchedulePage = () => {
  return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Schedule</h1>
        <ScheduleForm />
      </div>
  );
};

export default SchedulePage;