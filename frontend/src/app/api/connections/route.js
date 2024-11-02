// app/api/connections/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'all', 'connected', 'sent', 'received'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    let query = { userId };
    
    // Filter based on connection type
    switch (type) {
      case 'connected':
        query.status = 'connected';
        break;
      case 'sent':
        query = { userId, initiator: userId, status: 'pending' };
        break;
      case 'received':
        query = { userId, initiator: { $ne: userId }, status: 'pending' };
        break;
      // 'all' or undefined will return all connections
    }

    // Get connections with user details
    const connections = await db.collection('connections')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'targetId',
            foreignField: 'firebaseId',
            as: 'targetUser'
          }
        },
        { $unwind: '$targetUser' },
        {
          $project: {
            _id: 1,
            status: 1,
            createdAt: 1,
            initiator: 1,
            targetUser: {
              firebaseId: 1,
              displayName: 1,
              email: 1
            }
          }
        }
      ]).toArray();

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { fromUserId, toUserId } = body;

    if (!fromUserId || !toUserId) {
      return NextResponse.json({ error: 'Both user IDs are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if connection already exists
    const existingConnection = await db.collection('connections').findOne({
      $or: [
        { userId: fromUserId, targetId: toUserId },
        { userId: toUserId, targetId: fromUserId }
      ]
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 409 }
      );
    }

    // Create new connection
    await db.collection('connections').insertMany([
      {
        userId: fromUserId,
        targetId: toUserId,
        status: 'pending',
        initiator: fromUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: toUserId,
        targetId: fromUserId,
        status: 'pending',
        initiator: fromUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    return NextResponse.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, requesterId } = body;

    if (!userId || !requesterId) {
      return NextResponse.json({ error: 'Both user IDs are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Update both connection records to connected status
    await db.collection('connections').updateMany(
      {
        $or: [
          { userId, targetId: requesterId },
          { userId: requesterId, targetId: userId }
        ]
      },
      {
        $set: {
          status: 'connected',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ message: 'Connection accepted successfully' });
  } catch (error) {
    console.error('Error accepting connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userId, targetId } = body;

    if (!userId || !targetId) {
      return NextResponse.json({ error: 'Both user IDs are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Remove both connection records
    await db.collection('connections').deleteMany({
      $or: [
        { userId, targetId },
        { userId: targetId, targetId: userId }
      ]
    });

    return NextResponse.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}