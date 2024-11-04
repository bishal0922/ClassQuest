// app/lib/models/Connection.js
const ConnectionSchema = {
    userId: String,     // User who initiated/received the connection
    targetId: String,   // The other user in the connection
    status: String,     // 'pending', 'connected', 'rejected'
    initiator: String,  // firebaseId of user who initiated the connection
    createdAt: Date,
    updatedAt: Date
  };
  
  export default ConnectionSchema;
  
  // app/lib/migrations/createConnectionsCollection.js
  import { connectToDatabase } from '../mongodb';
  
  export async function migrateToConnectionsCollection() {
    const { db } = await connectToDatabase();
    
    try {
      // Create connections collection if it doesn't exist
      await db.createCollection('connections');
      
      // Create indexes
      await db.collection('connections').createIndex({ userId: 1, targetId: 1 }, { unique: true });
      await db.collection('connections').createIndex({ status: 1 });
      await db.collection('connections').createIndex({ createdAt: 1 });
      
      // Migrate existing connections from users collection
      const users = await db.collection('users').find({
        $or: [
          { connections: { $exists: true, $ne: [] } },
          { pendingConnections: { $exists: true, $ne: [] } }
        ]
      }).toArray();
  
      for (const user of users) {
        // Migrate pending connections
        if (user.pendingConnections) {
          for (const targetId of user.pendingConnections) {
            await db.collection('connections').updateOne(
              { userId: user.firebaseId, targetId },
              {
                $setOnInsert: {
                  status: 'pending',
                  initiator: user.firebaseId,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              },
              { upsert: true }
            );
          }
        }
  
        // Migrate established connections
        if (user.connections) {
          for (const targetId of user.connections) {
            await db.collection('connections').updateOne(
              { userId: user.firebaseId, targetId },
              {
                $setOnInsert: {
                  status: 'connected',
                  initiator: user.firebaseId,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              },
              { upsert: true }
            );
          }
        }
      }
  
      // Optionally: Remove old fields from users collection
      await db.collection('users').updateMany(
        {},
        { 
          $unset: { 
            connections: "",
            pendingConnections: "" 
          }
        }
      );
  
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }