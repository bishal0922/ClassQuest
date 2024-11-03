// src/app/components/CalendarSync.js
"use client";
import React, { useState } from 'react';
import { Calendar, X, AlertCircle, Check } from 'lucide-react';

const CalendarSync = ({ onEventsImported, onClose }) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const isLikelyClass = (event) => {
    const summary = event.summary?.toLowerCase() || '';
    const location = event.location?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';

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

  const getRecurringPattern = (event) => {
    if (!event.recurrence) return null;
    
    const recurringRule = event.recurrence[0];
    if (recurringRule.includes('FREQ=WEEKLY')) {
      const days = {
        'MO': 'Monday',
        'TU': 'Tuesday',
        'WE': 'Wednesday',
        'TH': 'Thursday',
        'FR': 'Friday'
      };
      
      const matchDays = recurringRule.match(/BYDAY=([A-Z,]+)/);
      if (matchDays) {
        const daysList = matchDays[1].split(',')
          .map(day => days[day])
          .join(', ');
        return `Every ${daysList}`;
      }
    }
    return 'Recurring';
  };

  const deduplicateEvents = (events) => {
    const uniqueEvents = new Map();

    events.forEach(event => {
      const key = event.summary + (event.location || '');
      
      if (!uniqueEvents.has(key)) {
        if (event.recurrence) {
          uniqueEvents.set(key, {
            ...event,
            recurringPattern: getRecurringPattern(event),
            originalDates: [event.start.dateTime]
          });
        } else {
          uniqueEvents.set(key, event);
        }
      } else if (event.recurrence) {
        const existingEvent = uniqueEvents.get(key);
        existingEvent.originalDates.push(event.start.dateTime);
      }
    });

    return Array.from(uniqueEvents.values());
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSyncStatus('syncing');
    setDebugLog([]);

    try {
      addDebugLog('Starting calendar sync process');
      
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: async (tokenResponse) => {
          addDebugLog('Received token response');
          
          if (tokenResponse.error) {
            addDebugLog(`Token error: ${tokenResponse.error}`);
            setSyncStatus('error');
            setError(`Authentication error: ${tokenResponse.error}`);
            return;
          }

          try {
            addDebugLog('Fetching calendar events');
            const response = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&maxResults=100&orderBy=startTime&singleEvents=true`,
              {
                headers: {
                  'Authorization': `Bearer ${tokenResponse.access_token}`,
                  'Accept': 'application/json',
                },
              }
            );

            if (!response.ok) {
              throw new Error(`Calendar API error: ${response.status}`);
            }

            const data = await response.json();
            addDebugLog(`Found ${data.items?.length || 0} events`);

            const processedEvents = (data.items || [])
              .filter(event => event.start?.dateTime && event.end?.dateTime)
              .map(event => ({
                ...event,
                analysis: isLikelyClass(event)
              }));

            const uniqueEvents = deduplicateEvents(processedEvents)
              .sort((a, b) => b.analysis.confidence - a.analysis.confidence);

            addDebugLog(`Processed ${uniqueEvents.length} unique events`);
            setDetectedEvents(uniqueEvents);
            setSyncStatus('success');
          } catch (error) {
            addDebugLog(`Error processing events: ${error.message}`);
            setSyncStatus('error');
            setError(error.message);
          }
        },
      });

      addDebugLog('Requesting access token');
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      addDebugLog(`Initial error: ${error.message}`);
      console.error('Calendar sync error:', error);
      setSyncStatus('error');
      setError(error.message || 'An error occurred while syncing with Google Calendar');
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
      .flatMap(event => {
        if (event.recurringPattern) {
          const daysInPattern = event.recurringPattern
            .replace('Every ', '')
            .split(', ');
          
          return daysInPattern.map(day => ({
            className: event.summary,
            location: event.location || 'Not specified',
            startTime: new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            endTime: new Date(event.end.dateTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            dayOfWeek: day
          }));
        }
        
        const startDate = new Date(event.start.dateTime);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return [{
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
        }];
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

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
          <div className="mt-4 text-left text-xs text-gray-400 max-h-32 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {syncStatus === 'success' && detectedEvents.length > 0 && (
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
                      {new Date(event.start.dateTime).toLocaleTimeString([], { 
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                      {event.recurringPattern && (
                        <span className="ml-2 text-indigo-600">
                          ({event.recurringPattern})
                        </span>
                      )}
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

      {syncStatus === 'success' && detectedEvents.length === 0 && (
        <div className="text-center text-gray-500">
          No events found in your calendar.
        </div>
      )}
    </div>
  );
};

export default CalendarSync;