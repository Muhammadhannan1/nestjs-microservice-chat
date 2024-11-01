import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { ObjectId } from 'bson';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat extends Document {
  @Prop()
  message: string;

  @Prop()
  userId: ObjectId;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
