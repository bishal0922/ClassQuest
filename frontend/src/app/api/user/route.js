import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function POST(request) {
  try {
    const { action, data } = await request.json();
    const client = await clientPromise;
    const db = client.db("classquest");
    const usersCollection = db.collection("users");

    switch (action) {
      case 'createUser':
        const result = await usersCollection.insertOne(data);
        return NextResponse.json({ success: true, result });

      case 'getUserByFirebaseId':
        const user = await usersCollection.findOne({ firebaseId: data.firebaseId });
        return NextResponse.json({ success: true, user });

      case 'updateUserSchedule':
        const updateResult = await usersCollection.updateOne(
          { firebaseId: data.firebaseId },
          { $set: { schedule: data.schedule } }
        );
        return NextResponse.json({ success: true, result: updateResult });

      case 'getUserSchedule':
        const userWithSchedule = await usersCollection.findOne(
          { firebaseId: data.firebaseId },
          { projection: { schedule: 1 } }
        );
        return NextResponse.json({ success: true, schedule: userWithSchedule?.schedule });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}