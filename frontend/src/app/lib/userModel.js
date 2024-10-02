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
import clientPromise from './mongodb';

export async function createUser(userData) {
  const client = await clientPromise;
  const db = client.db("classquest");
  const usersCollection = db.collection("users");

  const result = await usersCollection.insertOne(userData);
  return result;
}

export async function getUserByFirebaseId(firebaseId) {
  const client = await clientPromise;
  const db = client.db("classquest");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ firebaseId });
  return user;
}

export async function updateUserSchedule(firebaseId, schedule) {
  const client = await clientPromise;
  const db = client.db("classquest");
  const usersCollection = db.collection("users");

  const result = await usersCollection.updateOne(
    { firebaseId },
    { $set: { schedule } }
  );
  return result;
}

export async function getUserSchedule(firebaseId) {
  const client = await clientPromise;
  const db = client.db("classquest");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ firebaseId });
  return user ? user.schedule : null;
}