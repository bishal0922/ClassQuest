/**
 * NOTE: NOT USED YET
 * This file is responsible for setting up and configuring the connection to MongoDB.
 * We import the MongoClient from the 'mongodb' package. This client will be used to interact with our MongoDB database.
 * The MongoDB URI is retrieved from the environment variables. This URI contains the necessary information to connect to our MongoDB instance.
 * * Finally, we export the clientPromise, which will be used throughout the app to interact with the database.
 */
// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env');
}

if (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'false') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();
  return { db, client };
}