import React from 'react';
import ScheduleComparison from '../components/ScheduleComparison';

const ComparePage = () => {
  // Add this somewhere in your component
  return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Compare Schedules</h1>
        <p className="text-sm text-gray-500 mb-4">note: likely to be integrated alongside search in the future, rather than being an 
          independent component <br/>todo: integrate with backend api routes</p>
        <ScheduleComparison />
      </div>
  );
};

export default ComparePage;

