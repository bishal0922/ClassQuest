// src/app/lib/googleIdentityService.js
export const initializeGoogleIdentity = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return;
      
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: (response) => {
            if (response.error) {
              reject(response);
            } else {
              resolve(response);
            }
          },
        });
        return client;
      } catch (error) {
        reject(error);
      }
    });
  };
  
  export const getCalendarEvents = async () => {
    try {
      const tokenClient = await initializeGoogleIdentity();
      const response = await new Promise((resolve) => {
        tokenClient.requestAccessToken({ prompt: 'consent' });
        google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              resolve({ error: tokenResponse.error });
            }
  
            const accessToken = tokenResponse.access_token;
            const calendarResponse = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&maxResults=100&orderBy=startTime&singleEvents=true`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            const data = await calendarResponse.json();
            resolve(data);
          },
        });
      });
  
      return response;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  };