import React from 'react';
import ScheduleComparison from '../components/ScheduleComparison';

const ComparePage = () => {
  return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Compare Schedules</h1>
        <ScheduleComparison />
      </div>
  );
};

export default ComparePage;