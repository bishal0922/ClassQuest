// src/app/lib/googleCalendar.js
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
              scope: 'https://www.googleapis.com/auth/calendar.readonly',
              cookiepolicy: 'single_host_origin',
              ux_mode: 'popup'
            });
            
            isInitialized = true;
            resolve();
          } catch (error) {
            console.error('Google API initialization error:', error);
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
    const auth2 = window.gapi.auth2.getAuthInstance();
    
    if (!auth2.isSignedIn.get()) {
      const user = await auth2.signIn({
        prompt: 'consent' // Force consent prompt to show scope permissions
      });
      
      // Check if the user has granted the necessary permissions
      const hasCalendarScope = user.getGrantedScopes().includes('https://www.googleapis.com/auth/calendar.readonly');
      if (!hasCalendarScope) {
        throw new Error('Calendar permission was not granted');
      }
    }

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
    
    // Handle specific error cases
    if (error.error === 'popup_blocked_by_browser') {
      throw new Error('Please allow popups for this site to sign in with Google');
    } else if (error.error === 'immediate_failed') {
      throw new Error('Google sign-in was not possible. Please try again');
    } else {
      throw error;
    }
  }
};

export const disconnectGoogleCalendar = async () => {
  if (!isInitialized) return;

  try {
    const auth2 = window.gapi.auth2.getAuthInstance();
    if (auth2.isSignedIn.get()) {
      await auth2.signOut();
      await auth2.disconnect(); // Also revoke access
    }
  } catch (error) {
    console.error('Error disconnecting from Google Calendar:', error);
    throw error;
  }
};