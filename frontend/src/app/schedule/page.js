/**
 * We import the ScheduleForm component, which contains the form for users to input their schedule.
 * The SchedulePage component will render a container div with some styling and include the ScheduleForm component inside it.
 * This page is part of the main application and will be displayed when users navigate to the schedule section.
 */
import React from 'react';
import ScheduleForm from '../components/schedule/ScheduleForm';

const SchedulePage = () => {
  return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ScheduleForm />
      </div>
  );
};

export default SchedulePage;