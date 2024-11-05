export const processRecurringEvent = (event) => {
    if (!event.recurrence) {
      return [event];
    }
  
    const recurringRule = event.recurrence[0];
    if (!recurringRule || !recurringRule.includes("FREQ=WEEKLY")) {
      return [event];
    }
  
    const recurringDays = parseRecurringDays(recurringRule);
    if (recurringDays.length === 0) {
      return [event];
    }
  
    return recurringDays.map((day) => {
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
        end: { ...event.end, dateTime: endDate.toISOString() }
      };
    });
  };
  
  export const parseRecurringDays = (recurringRule) => {
    const days = {
      MO: "Monday",
      TU: "Tuesday",
      WE: "Wednesday",
      TH: "Thursday",
      FR: "Friday"
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
  
  export const compareWithExisting = (events, existingEvents) => {
    if (!existingEvents || existingEvents.length === 0) {
      return {
        newEvents: events,
        updatedEvents: [],
        unchangedEvents: []
      };
    }
  
    const newEvents = [];
    const updatedEvents = [];
    const unchangedEvents = [];
  
    events.forEach((event) => {
      const eventStartTime = new Date(event.start.dateTime).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }
      );
  
      const eventDay = event.dayOfWeek || new Date(event.start.dateTime)
        .toLocaleDateString("en-US", { weekday: "long" });
  
      const eventTitle = event.summary.toLowerCase().trim();
  
      const existingEvent = existingEvents.find((existing) => {
        const titleMatch = existing.className.toLowerCase().trim() === eventTitle;
        const dayMatch = existing.dayOfWeek === eventDay;
        const timeMatch = existing.startTime === eventStartTime;
  
        return titleMatch && dayMatch && timeMatch;
      });
  
      if (!existingEvent) {
        newEvents.push(event);
      } else {
        const eventEndTime = new Date(event.end.dateTime).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          }
        );
  
        const hasChanges =
          (event.location || "Not specified") !== (existingEvent.location || "Not specified") ||
          eventEndTime !== existingEvent.endTime;
  
        if (hasChanges) {
          updatedEvents.push({
            ...event,
            existingDetails: existingEvent,
            changes: {
              location: (event.location || "Not specified") !== (existingEvent.location || "Not specified"),
              time: eventEndTime !== existingEvent.endTime
            }
          });
        } else {
          unchangedEvents.push(event);
        }
      }
    });
  
    return { newEvents, updatedEvents, unchangedEvents };
  };