// src/app/api/user/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function POST(request) {
  try {
    const { action, data } = await request.json();
    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    switch (action) {
      case 'createUser':
        // Use updateOne with upsert instead of insertOne
        const createResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { 
            $set: {
              firebaseId: data.firebaseId,
              email: data.email,
              displayName: data.displayName || '',
              schedule: data.schedule || {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: []
              }
            }
          },
          { upsert: true }
        );
        
        const newUser = await usersCollection.findOne({ firebaseId: data.firebaseId });
        return NextResponse.json({ success: true, user: newUser });

      case 'updateUser':
        const updateResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { $set: data }
        );
        
        if (updateResult.matchedCount === 0) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }
        
        const updatedUser = await usersCollection.findOne({ firebaseId: data.firebaseId });
        return NextResponse.json({ success: true, user: updatedUser });

      case 'getUserByFirebaseId':
        const user = await usersCollection.findOne({ firebaseId: data.firebaseId });
        return NextResponse.json({ success: true, user });

      case 'updateUserSchedule':
        const scheduleResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { $set: { schedule: data.schedule } }
        );
        
        if (scheduleResult.matchedCount === 0) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ success: true, result: scheduleResult });

      case 'getUserSchedule':
        const userWithSchedule = await usersCollection.findOne(
          { firebaseId: data.firebaseId },
          { projection: { schedule: 1 } }
        );
        return NextResponse.json({ success: true, schedule: userWithSchedule?.schedule });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API route error:', error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}