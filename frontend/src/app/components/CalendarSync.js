"use client";
import React, { useState } from 'react';
import { Calendar, X, AlertCircle, Check } from 'lucide-react';

const CalendarSync = ({ onEventsImported, onClose }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());

  // Helper function to detect if an event is likely a class
  const isLikelyClass = (event) => {
    const summary = event.summary?.toLowerCase() || '';
    const location = event.location?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';

    // Common patterns for academic events
    const patterns = {
      courseCode: /([A-Z]{2,4})\s*[-]?\s*(\d{3,4}[A-Z]?)/i,
      keywords: /(lecture|lab|seminar|class|course|exam)/i,
      locations: /(hall|room|building|lab|classroom|\bRM\b)/i,
      timePattern: /^(M|T|W|R|F|MW|TR|MWF)\s+\d{1,2}:\d{2}/i
    };

    let score = 0;
    if (patterns.courseCode.test(summary)) score += 5;
    if (patterns.keywords.test(summary)) score += 3;
    if (patterns.keywords.test(description)) score += 2;
    if (location && patterns.locations.test(location)) score += 2;
    if (patterns.timePattern.test(summary)) score += 2;
    if (event.recurrence) score += 3;

    const hour = new Date(event.start.dateTime).getHours();
    if (hour >= 8 && hour <= 22) score += 1;

    return {
      isClass: score >= 5,
      confidence: Math.min((score / 10) * 100, 100)
    };
  };

  const handleGoogleAuth = async () => {
    try {
      setSyncStatus('syncing');

      // Get auth instance
      const auth2 = window.gapi.auth2.getAuthInstance();
      const user = await auth2.signIn();
      
      // List calendar events
      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
      });

      // Process events
      const events = response.result.items
        .filter(event => event.start?.dateTime && event.end?.dateTime)
        .map(event => ({
          ...event,
          analysis: isLikelyClass(event)
        }))
        .sort((a, b) => b.analysis.confidence - a.analysis.confidence);

      setDetectedEvents(events);
      setSyncStatus('success');
    } catch (error) {
      console.error('Calendar sync error:', error);
      setSyncStatus('error');
    }
  };

  const formatConfidence = (confidence) => {
    if (confidence >= 90) return 'Very likely a class';
    if (confidence >= 70) return 'Probably a class';
    if (confidence >= 50) return 'Might be a class';
    return 'Probably not a class';
  };

  const handleImport = () => {
    const selectedEventsData = detectedEvents
      .filter(event => selectedEvents.has(event.id))
      .map(event => {
        const startDate = new Date(event.start.dateTime);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return {
          className: event.summary,
          location: event.location || 'Not specified',
          startTime: startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          endTime: new Date(event.end.dateTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          dayOfWeek: days[startDate.getDay()]
        };
      });

    onEventsImported(selectedEventsData);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Import from Google Calendar</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-6 w-6" />
        </button>
      </div>

      {syncStatus === 'idle' && (
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
          <p className="text-gray-500 mb-4">
            Connect your Google Calendar to import your class schedule.
          </p>
          <button
            onClick={handleGoogleAuth}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Connect Calendar
          </button>
        </div>
      )}

      {syncStatus === 'syncing' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Analyzing your calendar...</p>
        </div>
      )}

      {syncStatus === 'success' && (
        <div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                We've identified potential classes. Select the ones you want to import.
              </p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {detectedEvents.map((event) => (
              <div key={event.id} className="border-b border-gray-200 py-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedEvents);
                      if (e.target.checked) {
                        newSelected.add(event.id);
                      } else {
                        newSelected.delete(event.id);
                      }
                      setSelectedEvents(newSelected);
                    }}
                    className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{event.summary}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start.dateTime).toLocaleString()}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">📍 {event.location}</p>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.analysis.isClass 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatConfidence(event.analysis.confidence)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedEvents.size === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Import Selected
            </button>
          </div>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="text-center text-red-600">
          <p>Failed to connect to Google Calendar. Please try again.</p>
          <button
            onClick={() => setSyncStatus('idle')}
            className="mt-2 text-indigo-600 hover:text-indigo-500"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarSync;