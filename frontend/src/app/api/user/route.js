// src/app/api/user/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function POST(request) {
  try {
    const { action, data } = await request.json();
    console.log('API received request:', { action, data });

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    switch (action) {
      case 'createUser': {
        console.log('Creating new user:', data);
        // Use updateOne with upsert instead of insertOne
        const createResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { 
            $set: {
              firebaseId: data.firebaseId,
              email: data.email,
              displayName: data.displayName || '',
              emailVerified: data.emailVerified || false,
              schedule: data.schedule || {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: []
              },
              createdAt: new Date(),
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
        
        const newUser = await usersCollection.findOne({ firebaseId: data.firebaseId });
        console.log('New user created:', newUser);
        return NextResponse.json({ success: true, user: newUser });
      }

      case 'updateUser': {
        console.log('Updating user:', data);
        const updateResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { 
            $set: {
              ...data,
              updatedAt: new Date()
            }
          }
        );
        console.log('Update result:', updateResult);
        
        if (updateResult.matchedCount === 0) {
          console.error('User not found for update:', data.firebaseId);
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }
        
        const updatedUser = await usersCollection.findOne({ firebaseId: data.firebaseId });
        console.log('Updated user:', updatedUser);
        return NextResponse.json({ success: true, user: updatedUser });
      }

      case 'getUserByFirebaseId': {
        console.log('Fetching user by firebaseId:', data.firebaseId);
        const user = await usersCollection.findOne({ firebaseId: data.firebaseId });
        console.log('Found user:', user);
        return NextResponse.json({ success: true, user });
      }

      case 'updateUserSchedule': {
        console.log('Updating user schedule:', data);
        const scheduleResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { 
            $set: { 
              schedule: data.schedule,
              updatedAt: new Date()
            } 
          }
        );
        console.log('Schedule update result:', scheduleResult);
        
        if (scheduleResult.matchedCount === 0) {
          console.error('User not found for schedule update:', data.firebaseId);
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }
        
        const updatedUser = await usersCollection.findOne({ firebaseId: data.firebaseId });
        return NextResponse.json({ success: true, user: updatedUser });
      }

      case 'getUserSchedule': {
        console.log('Fetching user schedule:', data.firebaseId);
        const userWithSchedule = await usersCollection.findOne(
          { firebaseId: data.firebaseId },
          { projection: { schedule: 1 } }
        );
        console.log('Found schedule:', userWithSchedule?.schedule);
        return NextResponse.json({ success: true, schedule: userWithSchedule?.schedule });
      }

      case 'updateEmailVerification': {
        console.log('Updating email verification status:', data);
        const verificationResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { 
            $set: { 
              emailVerified: data.emailVerified,
              updatedAt: new Date()
            } 
          }
        );
        console.log('Verification update result:', verificationResult);

        if (verificationResult.matchedCount === 0) {
          console.error('User not found for verification update:', data.firebaseId);
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }

        const updatedUser = await usersCollection.findOne({ firebaseId: data.firebaseId });
        return NextResponse.json({ success: true, user: updatedUser });
      }

      default:
        console.error('Invalid action received:', action);
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