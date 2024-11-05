import React from 'react';
import { Calendar, ChevronRight, Mail } from 'lucide-react';

const GoogleCalendarButton = ({ onAuth, onRequestAccess }) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onAuth}
        className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <div className="flex items-center">
          <div className="bg-white p-1 rounded mr-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          Connect Google Calendar
          <ChevronRight className="ml-2 h-4 w-4" />
        </div>
      </button>
      <a
        href="mailto:classquestdevs@gmail.com?subject=ClassQuest Calendar Sync Access Request&body=Hello, I would like to request access to the Google Calendar Sync feature."
        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Mail className="mr-2 h-4 w-4" />
        Request Access
      </a>
    </div>
  );
};

export default GoogleCalendarButton;