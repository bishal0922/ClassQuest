import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { analyzeEventType } from './utility/calendarImportService';
import { useAuthContext } from './AuthProvider';
import RestrictedFeatureModal from './RestrictedFeatureModal';
import GoogleCalendarButton from './calendar/GoogleCalendarButton';
import OutlookCalendarButton from './calendar/OutlookCalendarButton';
import EventCard from './calendar/EventCard';
import ImportOptions from './calendar/ImportOptions';
import { processRecurringEvent, compareWithExisting } from '../utils/calendarProcessing';
// src/app/components/calendar/CalendarSync.js (continued)
const CalendarSync = ({ onEventsImported, onClose, existingEvents }) => {
  const [syncStatus, setSyncStatus] = useState("idle");
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const [importMode, setImportMode] = useState("all");
  const [comparisonStatus, setComparisonStatus] = useState({
    new: 0,
    updated: 0,
    unchanged: 0,
  });
  const { user, isGuestMode } = useAuthContext();

  if (isGuestMode) {
    return (
      <RestrictedFeatureModal
        isOpen={true}
        onClose={onClose}
        featureName="Calendar Sync"
      />
    );
  }

  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSyncStatus("syncing");
    setDebugLog([]);

    try {
      addDebugLog("Starting calendar sync process");

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        callback: handleTokenResponse
      });

      addDebugLog("Requesting access token");
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (error) {
      handleSyncError("Initial error:", error);
    }
  };

  const handleOutlookAuth = () => {
    alert("Outlook calendar is currently experiencing issues. Please check back later or contact Team 3.");
  };

  const handleTokenResponse = async (tokenResponse) => {
    if (tokenResponse.error) {
      handleSyncError("Token error:", tokenResponse.error);
      return;
    }

    try {
      await fetchAndProcessEvents(tokenResponse.access_token);
    } catch (error) {
      handleSyncError("Error processing events:", error);
    }
  };

  const fetchAndProcessEvents = async (accessToken) => {
    addDebugLog("Fetching calendar events");

    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 4);

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: "2500",
      showDeleted: "false",
      singleEvents: "false",
      orderBy: "updated",
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Calendar API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    await processCalendarEvents(data.items || []);
  };

  const processCalendarEvents = async (events) => {
    addDebugLog(`Processing ${events.length} events`);

    const processedEvents = [];
    const seenEvents = new Map();

    for (const event of events) {
      if (event.start?.dateTime && event.end?.dateTime) {
        const recurringInstances = processRecurringEvent(event);
        recurringInstances.forEach((evt) => {
          const eventKey = `${evt.summary}_${evt.dayOfWeek}_${new Date(
            evt.start.dateTime
          ).toLocaleTimeString()}`;

          if (!seenEvents.has(eventKey)) {
            seenEvents.set(eventKey, evt);
            const eventAnalysis = analyzeEventType(evt);
            processedEvents.push({
              ...evt,
              analysis: eventAnalysis,
            });
          }
        });
      }
    }

    const { newEvents, updatedEvents, unchangedEvents } = compareWithExisting(
      processedEvents,
      existingEvents
    );

    setComparisonStatus({
      new: newEvents.length,
      updated: updatedEvents.length,
      unchanged: unchangedEvents.length,
    });

    const sortedEvents = sortEvents([...newEvents, ...updatedEvents]);
    setDetectedEvents(sortedEvents);
    setSyncStatus("success");
  };

  const sortEvents = (events) => {
    return events.sort((a, b) => {
      // First sort by recurrence group
      if (a.recurrenceGroupId && b.recurrenceGroupId) {
        if (a.recurrenceGroupId !== b.recurrenceGroupId) {
          return a.recurrenceGroupId.localeCompare(b.recurrenceGroupId);
        }
      }
      // Then by confidence
      const confidenceDiff = b.analysis.confidence - a.analysis.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      // Then by time
      return new Date(a.start.dateTime) - new Date(b.start.dateTime);
    });
  };

  const handleSyncError = (context, error) => {
    console.error(context, error);
    addDebugLog(`${context} ${error.message}`);
    setSyncStatus("error");
    setError(error.message);
  };

  const handleEventSelection = (event, isSelected) => {
    const newSelected = new Set(selectedEvents);

    if (event.recurrenceGroupId) {
      const groupEvents = detectedEvents.filter(
        (e) => e.recurrenceGroupId === event.recurrenceGroupId
      );
      groupEvents.forEach((e) => {
        if (isSelected) {
          newSelected.add(e.id);
        } else {
          newSelected.delete(e.id);
        }
      });
    } else {
      if (isSelected) {
        newSelected.add(event.id);
      } else {
        newSelected.delete(event.id);
      }
    }

    setSelectedEvents(newSelected);
  };

  const handleImport = () => {
    const selectedEventsData = detectedEvents
      .filter((event) => selectedEvents.has(event.id))
      .map(mapEventToScheduleFormat);

    onEventsImported(selectedEventsData);
  };

const mapEventToScheduleFormat = (event) => {
  return {
    className: event.summary,
    location: event.location || "Not specified",
    startTime: new Date(event.start.dateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    endTime: new Date(event.end.dateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    dayOfWeek:
      event.dayOfWeek ||
      new Date(event.start.dateTime).toLocaleDateString("en-US", {
        weekday: "long",
      }),
    isImported: true,
    recurrenceGroupId: event.recurrenceGroupId,
    eventType: event.analysis.type,
  };
};

  const filteredEvents = detectedEvents.filter((event) => {
    switch (importMode) {
      case "new":
        return !event.existingDetails;
      case "updates":
        return event.existingDetails;
      default:
        return true;
    }
  });

  return (
    <div className="bg-white rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center">
            Import from Google Calendar
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-1 text-sm text-white/80">
          Sync your class schedule and academic events
        </p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {syncStatus === "idle" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="max-w-sm mx-auto">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Calendar Sync Access
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                This feature is currently in testing.<br />
                Please verify your access status below.
              </p>
              <OutlookCalendarButton onAuth={handleOutlookAuth} /> 
              <GoogleCalendarButton onAuth={handleGoogleAuth} />
            </div>
          </div>
        )}

        {syncStatus === "syncing" && (
          <SyncingState debugLog={debugLog} />
        )}

        {syncStatus === "success" && detectedEvents.length > 0 && (
          <SuccessState
            comparisonStatus={comparisonStatus}
            importMode={importMode}
            onModeChange={setImportMode}
            filteredEvents={filteredEvents}
            selectedEvents={selectedEvents}
            onEventSelect={handleEventSelection}
            onImport={handleImport}
            onClose={onClose}
          />
        )}

        {syncStatus === "success" && detectedEvents.length === 0 && (
          <NoEventsState />
        )}
      </div>
    </div>
  );
};

export default CalendarSync;

// Additional supporting components for CalendarSync states
const SyncingState = ({ debugLog }) => (
  <div className="text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    <p className="mt-2 text-gray-500">Analyzing your calendar...</p>
    <div className="mt-4 text-left text-xs text-gray-400 max-h-32 overflow-y-auto">
      {debugLog.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  </div>
);

const NoEventsState = () => (
  <div className="text-center text-gray-500">
    No events found in your calendar.
  </div>
);

const SuccessState = ({
  comparisonStatus,
  importMode,
  onModeChange,
  filteredEvents,
  selectedEvents,
  onEventSelect,
  onImport,
  onClose
}) => (
  <div>
    <ImportOptions
      stats={comparisonStatus}
      activeMode={importMode}
      onModeChange={onModeChange}
    />

    <div className="bg-white rounded-lg border border-gray-200">
      <div className="max-h-96 overflow-y-auto">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={selectedEvents.has(event.id)}
            onSelect={onEventSelect}
          />
        ))}
      </div>
    </div>

    <div className="mt-4 flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onImport}
        disabled={selectedEvents.size === 0}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Import Selected ({selectedEvents.size})
      </button>
    </div>
  </div>
);