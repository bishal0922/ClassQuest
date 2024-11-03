// /frontend/src/app/lib/googleCalendar.js
let isInitialized = false;

export const initializeGoogleApi = async () => {
  if (isInitialized) return;

  try {
    await new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return;
      
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar.readonly'
          });
          
          isInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error initializing Google API:', error);
    throw error;
  }
};

export const fetchCalendarEvents = async () => {
  if (!isInitialized) {
    await initializeGoogleApi();
  }

  try {
    // Get the current user's auth instance
    const auth2 = window.gapi.auth2.getAuthInstance();
    
    // Check if user is signed in
    if (!auth2.isSignedIn.get()) {
      await auth2.signIn();
    }

    // Get user's calendar events
    const response = await window.gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 100,
      'orderBy': 'startTime'
    });

    return response.result.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const disconnectGoogleCalendar = async () => {
  if (!isInitialized) return;

  try {
    const auth2 = window.gapi.auth2.getAuthInstance();
    if (auth2.isSignedIn.get()) {
      await auth2.signOut();
    }
  } catch (error) {
    console.error('Error disconnecting from Google Calendar:', error);
    throw error;
  }
};