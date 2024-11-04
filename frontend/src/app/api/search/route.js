// app/api/search/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const currentUserId = searchParams.get('currentUserId');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Using aggregation to ensure unique results and exclude current user
    const users = await db.collection('users')
      .aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { displayName: { $regex: query, $options: 'i' } },
                  { email: { $regex: query, $options: 'i' } }
                ]
              },
              { firebaseId: { $ne: currentUserId } } // Exclude current user
            ]
          }
        },
        {
          $group: { // Group by email to remove duplicates
            _id: '$email',
            firebaseId: { $first: '$firebaseId' },
            displayName: { $first: '$displayName' },
            email: { $first: '$email' }
          }
        },
        {
          $project: {
            _id: 0,
            firebaseId: 1,
            displayName: 1,
            email: 1
          }
        }
      ]).toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Error searching users' }, { status: 500 });
  }
}