import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const { method } = req;

  switch (method) {
    case 'POST':
      // Send connection request
      try {
        const { fromUserId, toUserId } = req.body;
        await db.collection('users').updateOne(
          { firebaseId: toUserId },
          { $addToSet: { pendingConnections: fromUserId } }
        );
        res.status(200).json({ message: 'Connection request sent' });
      } catch (error) {
        res.status(500).json({ error: 'Error sending connection request' });
      }
      break;

    case 'PUT':
      // Accept connection request
      try {
        const { userId, requesterId } = req.body;
        await db.collection('users').updateOne(
          { firebaseId: userId },
          { 
            $pull: { pendingConnections: requesterId },
            $addToSet: { connections: requesterId }
          }
        );
        await db.collection('users').updateOne(
          { firebaseId: requesterId },
          { $addToSet: { connections: userId } }
        );
        res.status(200).json({ message: 'Connection request accepted' });
      } catch (error) {
        res.status(500).json({ error: 'Error accepting connection request' });
      }
      break;

    case 'DELETE':
      // Reject connection request
      try {
        const { userId, requesterId } = req.body;
        await db.collection('users').updateOne(
          { firebaseId: userId },
          { $pull: { pendingConnections: requesterId } }
        );
        res.status(200).json({ message: 'Connection request rejected' });
      } catch (error) {
        res.status(500).json({ error: 'Error rejecting connection request' });
      }
      break;

    case 'GET':
      // Get user's connections and pending requests
      try {
        const { userId } = req.query;
        const user = await db.collection('users').findOne(
          { firebaseId: userId },
          { projection: { connections: 1, pendingConnections: 1 } }
        );
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching user connections' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}