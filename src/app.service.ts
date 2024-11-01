import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Chat } from './chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
import { Worker } from 'worker_threads';
import * as path from 'path';

@Injectable()
export class AppService implements OnModuleDestroy, OnModuleInit {
  private messages: { userId: string; message: string }[] = [];
  private batchSize = 2; // Set your desired batch size
  private worker: Worker | null = null;
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
  ) {}
  onModuleInit() {
    const workerPath = path.resolve(__dirname, '../utils/store_message.worker');
    this.worker = new Worker(workerPath);
    Logger.log('[WORKER THREAD] initiated');
    this.worker.on('message', (result) => {
      if (result.status === 'success') {
        Logger.log('[Message Batch Inserted]');
        this.messages = []; // Clear the messages after successful processing
      } else {
        console.error('Worker error:', result.error);
      }
    });
  }
  async onModuleDestroy() {
    if (this.worker !== null) {
      this.worker.terminate();
      await this.chatModel.insertMany(this.messages);
      Logger.log('[WORKER THREAD] terminated');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async saveMessage(data) {
    this.messages.push({
      userId: data.userId as string,
      message: data.message,
    });
    console.log('message length', this.messages.length);
    console.log('messages', this.messages);
    if (this.messages.length >= this.batchSize) {
      this.worker.postMessage(this.messages.slice());
    }
    return { message: 'message created' };
  }
  async getMessages(data) {
    console.log('data', data);
    console.log('userId', data.userId);
    const a = await this.chatModel.find({
      userId: new ObjectId(data.userId as string),
    });
    return a;
  }
}
