/**
 * NOTE: NOT USED YET
 * This file is responsible for handling user-related operations in our application.
 * 
 * We import the `clientPromise` from our `mongodb` file. This promise resolves to a connected MongoDB client,
 * which we use to interact with our MongoDB database.
 * 
 * The functions in this file will:
 * - Create a new user in the "users" collection.
 * - Retrieve a user from the "users" collection using their Firebase ID.
 * - Update a user's schedule in the "users" collection.
 * - Retrieve a user's schedule from the "users" collection using their Firebase ID.
 * 
 * Each function connects to the database, performs the necessary operation, and returns the result.
 */
async function fetchFromAPI(action, data) {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function createUser(userData) {
  try {
    const result = await fetchFromAPI('createUser', {
      firebaseId: userData.firebaseId,
      email: userData.email,
      displayName: userData.displayName || '',
      emailVerified: false, // Explicitly set emailVerified field
      schedule: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create user');
    }
    
    return result.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(firebaseId, updateData) {
  try {
    const result = await fetchFromAPI('updateUser', {
      firebaseId,
      ...updateData,
      updatedAt: new Date()
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user');
    }
    
    return result.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Add a specific function to update email verification status
export async function updateEmailVerificationStatus(firebaseId, isVerified) {
  console.log(`Starting email verification update for ${firebaseId} to ${isVerified}`);
  
  try {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateUser',
        data: {
          firebaseId,
          emailVerified: isVerified,
          updatedAt: new Date()
        }
      })
    });

    console.log('API Response status:', response.status);
    const result = await response.json();
    console.log('API Response data:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update verification status');
    }

    return result;
  } catch (error) {
    console.error('Error in updateEmailVerificationStatus:', error);
    throw error;
  }
}

export async function getUserByFirebaseId(firebaseId) {
  try {
    const result = await fetchFromAPI('getUserByFirebaseId', { firebaseId });
    return result.user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function updateUserSchedule(firebaseId, schedule) {
  return fetchFromAPI('updateUserSchedule', { 
    firebaseId, 
    schedule,
    updatedAt: new Date()
  });
}

export async function getUserSchedule(firebaseId) {
  const result = await fetchFromAPI('getUserSchedule', { firebaseId });
  return result.schedule;
}