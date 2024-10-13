import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function GET(request) {
  console.log("GET request received");
  
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Log the query
    console.log('Search query:', query);

    // Perform the search
    const displayNameUsers = await db.collection('users').find({
        displayName: { $regex: `.*${query}.*`, $options: 'i' }
      }).project({ firebaseId: 1, displayName: 1, email: 1 }).toArray();
      
      const emailUsers = await db.collection('users').find({
        email: { $regex: `.*${query}.*`, $options: 'i' }
      }).project({ firebaseId: 1, displayName: 1, email: 1 }).toArray();
      
      console.log('Users found by displayName:', displayNameUsers.length);
      console.log('Users found by email:', emailUsers.length);
      
      const users = [...displayNameUsers, ...emailUsers];

    // If no users found, let's check the database directly
    if (users.length === 0) {
    const allUsers = await db.collection('users').find({}).limit(10).toArray();
    console.log('Sample of all users:', JSON.stringify(allUsers, null, 2));
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Error searching users' }, { status: 500 });
  }
}