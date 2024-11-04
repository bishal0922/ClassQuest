"use client";
import React, { useState } from "react";
import {
  Calendar,
  X,
  AlertCircle,
  Check,
  Clock,
  MapPin,
  RefreshCw,
  CircleDot,
  Circle,
  Repeat,
  BookOpen,
  FileSpreadsheet,
  ClipboardList,
  FileText,
  Beaker,
} from "lucide-react";
import { analyzeEventType, EVENT_TYPES } from "./utility/calendarImportService";

const CalendarSync = ({ onEventsImported, onClose, existingEvents }) => {
  const [syncStatus, setSyncStatus] = useState("idle");
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const [importMode, setImportMode] = useState("all");
  const [comparisonStatus, setComparisonStatus] = useState({
    new: 0,
    existing: 0,
    updated: 0,
  });

  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const getEventIcon = (event) => {
    const eventType = event.analysis?.type || "other";

    switch (eventType) {
      case EVENT_TYPES.CLASS:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case EVENT_TYPES.EXAM:
        return <FileSpreadsheet className="h-4 w-4 text-red-500" />;
      case EVENT_TYPES.QUIZ:
        return <ClipboardList className="h-4 w-4 text-orange-500" />;
      case EVENT_TYPES.ASSIGNMENT:
        return <FileText className="h-4 w-4 text-green-500" />;
      case EVENT_TYPES.LAB:
        return <Beaker className="h-4 w-4 text-purple-500" />; // Changed from Flask to Beaker
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const parseRecurringDays = (recurringRule) => {
    if (!recurringRule) return [];

    const days = {
      MO: "Monday",
      TU: "Tuesday",
      WE: "Wednesday",
      TH: "Thursday",
      FR: "Friday",
    };

    const matchDays = recurringRule.match(/BYDAY=([A-Z,]+)/);
    if (matchDays) {
      return matchDays[1]
        .split(",")
        .map((day) => days[day])
        .filter(Boolean);
    }
    return [];
  };

  const processRecurringEvent = (event) => {
    // If it's not a recurring event, return it as is
    if (!event.recurrence) {
      return [event];
    }

    const recurringRule = event.recurrence[0];
    // Only process weekly recurring events
    if (!recurringRule || !recurringRule.includes("FREQ=WEEKLY")) {
      return [event];
    }

    const recurringDays = parseRecurringDays(recurringRule);
    if (recurringDays.length === 0) {
      return [event];
    }

    // Create a separate instance for each recurring day
    return recurringDays.map((day) => {
      // Calculate the time for this specific day
      const startDate = new Date(event.start.dateTime);
      const endDate = new Date(event.end.dateTime);

      return {
        ...event,
        id: `${event.id}_${day}`,
        dayOfWeek: day,
        recurringPattern: `Every ${day}`,
        isRecurring: true,
        recurrenceGroupId: event.id,
        start: { ...event.start, dateTime: startDate.toISOString() },
        end: { ...event.end, dateTime: endDate.toISOString() },
      };
    });
  };

  const compareWithExisting = (events) => {
    // If no existing events, treat all as new
    if (!existingEvents || existingEvents.length === 0) {
      console.log("No existing events provided - treating all events as new");
      return {
        newEvents: events,
        updatedEvents: [],
        unchangedEvents: [],
      };
    }

    console.log("Existing events:", existingEvents);
    console.log("Calendar events to compare:", events);

    const newEvents = [];
    const updatedEvents = [];
    const unchangedEvents = [];

    events.forEach((event) => {
      const eventStartTime = new Date(event.start.dateTime).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      );

      const eventDay =
        event.dayOfWeek ||
        new Date(event.start.dateTime).toLocaleDateString("en-US", {
          weekday: "long",
        });

      const eventTitle = event.summary.toLowerCase().trim();

      console.log("\nComparing event:", {
        title: eventTitle,
        day: eventDay,
        time: eventStartTime,
      });

      // Log all existing events for debugging
      console.log(
        "All existing events:",
        existingEvents.map((e) => ({
          title: e.className,
          day: e.dayOfWeek,
          time: e.startTime,
        }))
      );

      const existingEvent = existingEvents.find((existing) => {
        const titleMatch =
          existing.className.toLowerCase().trim() === eventTitle;
        const dayMatch = existing.dayOfWeek === eventDay;
        const timeMatch = existing.startTime === eventStartTime;

        console.log("Comparing with:", {
          existing: {
            title: existing.className,
            day: existing.dayOfWeek,
            time: existing.startTime,
          },
          matches: { titleMatch, dayMatch, timeMatch },
        });

        return titleMatch && dayMatch && timeMatch;
      });

      if (!existingEvent) {
        console.log("➡️ Adding as new event");
        newEvents.push(event);
      } else {
        const eventEndTime = new Date(event.end.dateTime).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );

        const hasChanges =
          (event.location || "Not specified") !==
            (existingEvent.location || "Not specified") ||
          eventEndTime !== existingEvent.endTime;

        if (hasChanges) {
          console.log("➡️ Adding as updated event");
          updatedEvents.push({
            ...event,
            existingDetails: existingEvent,
            changes: {
              location:
                (event.location || "Not specified") !==
                (existingEvent.location || "Not specified"),
              time: eventEndTime !== existingEvent.endTime,
            },
          });
        } else {
          console.log("➡️ Adding as unchanged event");
          unchangedEvents.push(event);
        }
      }
    });

    return { newEvents, updatedEvents, unchangedEvents };
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
        callback: async (tokenResponse) => {
          addDebugLog("Received token response");

          if (tokenResponse.error) {
            addDebugLog(`Token error: ${tokenResponse.error}`);
            setSyncStatus("error");
            setError(`Authentication error: ${tokenResponse.error}`);
            return;
          }

          try {
            addDebugLog("Fetching calendar events");

            const timeMin = new Date();
            const timeMax = new Date();
            timeMax.setMonth(timeMax.getMonth() + 4);

            const baseUrl =
              "https://www.googleapis.com/calendar/v3/calendars/primary/events";
            const params = new URLSearchParams({
              timeMin: timeMin.toISOString(),
              timeMax: timeMax.toISOString(),
              maxResults: "2500",
              showDeleted: "false",
              singleEvents: "false", // Keep this false to get recurring event patterns
              orderBy: "updated",
            });

            const response = await fetch(`${baseUrl}?${params.toString()}`, {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
                Accept: "application/json",
              },
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                `Calendar API error: ${response.status} - ${
                  errorData.error?.message || "Unknown error"
                }`
              );
            }

            const data = await response.json();
            addDebugLog(`Found ${data.items?.length || 0} events`);

            // Process all events, including recurring ones
            const processedEvents = [];
            const seenEvents = new Map(); // Track events by summary and time

            for (const event of data.items || []) {
              if (event.start?.dateTime && event.end?.dateTime) {
                const recurringInstances = processRecurringEvent(event);
                recurringInstances.forEach((evt) => {
                  const eventKey = `${evt.summary}_${evt.dayOfWeek}_${new Date(
                    evt.start.dateTime
                  ).toLocaleTimeString()}`;

                  // Only add if we haven't seen this exact event before
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

            // Sort and apply comparison with existing events
            const { newEvents, updatedEvents, unchangedEvents } =
              compareWithExisting(processedEvents);

            setComparisonStatus({
              new: newEvents.length,
              updated: updatedEvents.length,
              existing: unchangedEvents.length,
            });

            // Combine and sort all events
            const sortedEvents = [...newEvents, ...updatedEvents].sort(
              (a, b) => {
                // First sort by recurrence group
                if (a.recurrenceGroupId && b.recurrenceGroupId) {
                  if (a.recurrenceGroupId !== b.recurrenceGroupId) {
                    return a.recurrenceGroupId.localeCompare(
                      b.recurrenceGroupId
                    );
                  }
                }
                // Then by confidence
                const confidenceDiff =
                  b.analysis.confidence - a.analysis.confidence;
                if (confidenceDiff !== 0) return confidenceDiff;
                // Then by time
                return new Date(a.start.dateTime) - new Date(b.start.dateTime);
              }
            );

            addDebugLog(`Processed ${sortedEvents.length} events`);
            setDetectedEvents(sortedEvents);
            setSyncStatus("success");
          } catch (error) {
            addDebugLog(`Error processing events: ${error.message}`);
            setSyncStatus("error");
            setError(error.message);
          }
        },
      });

      addDebugLog("Requesting access token");
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (error) {
      addDebugLog(`Initial error: ${error.message}`);
      console.error("Calendar sync error:", error);
      setSyncStatus("error");
      setError(
        error.message || "An error occurred while syncing with Google Calendar"
      );
    }
  };
  const renderEventStatus = (event) => {
    if (event.existingDetails) {
      return (
        <div className="mt-1 text-xs text-gray-500">
          <p className="font-medium text-amber-600">Updates available:</p>
          {event.changes.location && <p>• Location changed</p>}
          {event.changes.time && <p>• Time changed</p>}
        </div>
      );
    }
    return null;
  };

  const formatConfidence = (confidence) => {
    if (confidence >= 90) return "Very likely a class";
    if (confidence >= 70) return "Probably a class";
    if (confidence >= 50) return "Might be a class";
    return "Probably not a class";
  };

  // Update checkbox handling
  const handleEventSelection = (event, isSelected) => {
    const newSelected = new Set(selectedEvents);

    if (event.recurrenceGroupId) {
      // Find all events in the same recurrence group
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
  // Update the checkbox onChange handler in the render section
  const renderEventCheckbox = (event) => (
    <input
      type="checkbox"
      checked={selectedEvents.has(event.id)}
      onChange={(e) => handleEventSelection(event, e.target.checked)}
      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
    />
  );

  const handleImport = () => {
    console.log(
      "Selected events for import:",
      detectedEvents.filter((event) => selectedEvents.has(event.id))
    );

    const selectedEventsData = detectedEvents
      .filter((event) => selectedEvents.has(event.id))
      .map((event) => {
        const mappedEvent = {
          className: event.summary,
          location: event.location || "Not specified",
          startTime: new Date(event.start.dateTime).toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }
          ),
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
        };

        console.log("Mapped event for import:", mappedEvent);
        return mappedEvent;
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

      {syncStatus === "idle" && (
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
          <p className="text-gray-500 mb-4">
            Connect your Google Calendar to import your academic schedule.
          </p>
          <button
            onClick={handleGoogleAuth}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Connect Calendar
          </button>
        </div>
      )}

      {syncStatus === "syncing" && (
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

      {syncStatus === "success" && detectedEvents.length > 0 && (
        <div>
          {/* Import Options */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Import Options</h4>
                <div className="flex space-x-4 text-sm mt-1">
                  <span className="text-green-600 flex items-center">
                    <CircleDot className="h-3 w-3 mr-1" /> New:{" "}
                    {comparisonStatus.new}
                  </span>
                  <span className="text-amber-600 flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1" /> Updates:{" "}
                    {comparisonStatus.updated}
                  </span>
                  <span className="text-gray-600 flex items-center">
                    <Circle className="h-3 w-3 mr-1" /> Unchanged:{" "}
                    {comparisonStatus.existing}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setImportMode("all")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${
                      importMode === "all"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setImportMode("new")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${
                      importMode === "new"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  New Only
                </button>
                <button
                  onClick={() => setImportMode("updates")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${
                      importMode === "updates"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Updates Only
                </button>
              </div>
            </div>
          </div>
          {/* Events List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="max-h-96 overflow-y-auto">
              {detectedEvents
                .filter((event) => {
                  if (importMode === "new") return !event.existingDetails;
                  if (importMode === "updates") return event.existingDetails;
                  return true;
                })
                .map((event) => (
                  <div
                    key={event.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <div className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedEvents.has(event.id)}
                          onChange={(e) =>
                            handleEventSelection(event, e.target.checked)
                          }
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            {getEventIcon(event)}
                            <p className="ml-2 font-medium text-gray-900">
                              {event.summary}
                            </p>
                            {event.existingDetails ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                Update Available
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                New
                              </span>
                            )}
                          </div>

                          <div className="mt-1 text-sm text-gray-500 space-y-1">
                            <p className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(
                                event.start.dateTime
                              ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                              {event.dayOfWeek && (
                                <span className="ml-2 text-indigo-600 font-medium">
                                  ({event.dayOfWeek})
                                </span>
                              )}
                            </p>
                            {event.location && (
                              <p className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </p>
                            )}
                          </div>

                          {/* Event Type and Status Badges */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {event.isRecurring && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                <Repeat className="h-3 w-3 mr-1" />
                                Recurring
                              </span>
                            )}
                            {event.recurringPattern && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {event.recurringPattern}
                              </span>
                            )}
                            {event.analysis?.type && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {event.analysis.type.charAt(0).toUpperCase() +
                                  event.analysis.type.slice(1)}
                              </span>
                            )}
                          </div>

                          {/* Changes Section */}
                          {renderEventStatus(event)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedEvents.size === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Import Selected ({selectedEvents.size})
            </button>
          </div>
        </div>
      )}

      {syncStatus === "success" && detectedEvents.length === 0 && (
        <div className="text-center text-gray-500">
          No events found in your calendar.
        </div>
      )}
    </div>
  );
};

export default CalendarSync;
