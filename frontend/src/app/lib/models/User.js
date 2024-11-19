/**
 * This file defines the schema for the User model.
 * 
 * The User model contains the following fields:
 * - firebaseId: The unique identifier of the user in Firebase.
 * - email: The email address of the user.
 * - displayName: The display name of the user.
 * - schedule: An object containing the schedule of the user for each day of the week.
 * - connections: An array of user IDs representing mutual connections.
 * - pendingConnections: An array of user IDs representing pending connection requests.
 * - createdAt: The date and time when the user was created.
 * - updatedAt: The date and time when the user was last updated.
 */

const UserSchema = {
  firebaseId: String,
  email: String,
  displayName: String,
  schedule: {
    Monday: [{ className: String, location: String, startTime: String, endTime: String }],
    Tuesday: [{ className: String, location: String, startTime: String, endTime: String }],
    Wednesday: [{ className: String, location: String, startTime: String, endTime: String }],
    Thursday: [{ className: String, location: String, startTime: String, endTime: String }],
    Friday: [{ className: String, location: String, startTime: String, endTime: String }]
  },
  connections: [String], // Array of firebaseIds of connected users
  pendingConnections: [String], // Array of firebaseIds of pending connection requests
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

export default UserSchema;