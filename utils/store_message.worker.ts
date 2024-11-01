import { parentPort } from 'worker_threads';
import { Chat, ChatSchema } from '../src/chat.schema'; // Import your Chat schema here
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'bson';
// Connect to MongoDB
// Connect to the database inside the worker thread
mongoose.connect('mongodb://localhost:27017/microservice');
const ChatModel: Model<Chat> = mongoose.model(Chat.name, ChatSchema);

parentPort.on('message', async (messages: Chat[]) => {
  try {
    console.log('messages length in worker', messages.length);
    console.log('messages  in worker', messages);
    const messagesToSave = messages.map((msg) => ({
      userId: new ObjectId(msg.userId), // Convert string back to ObjectId
      message: msg.message,
    }));

    await ChatModel.insertMany(messagesToSave);
    parentPort.postMessage({ status: 'success' });
  } catch (error) {
    parentPort.postMessage({ status: 'error', error: error.message });
  }
});
