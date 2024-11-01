import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('chat.createMessages')
  async saveMessage(@Payload() data: any, @Ctx() context: KafkaContext) {
    const startTime = Date.now();
    const partition = context.getPartition();
    // await new Promise((resolve) => setTimeout(resolve, 10000)); // 5 seconds delay

    const endTime = Date.now();
    Logger.log(
      `[END] Partition: ${partition}, Time Taken: ${endTime - startTime} ms`,
    );

    this.appService.saveMessage(context.getMessage().value);
    // console.log('message', context.getMessage().value);
    // console.log('heartbeat', context.getHeartbeat());
    // console.log('partition', context.getPartition());
    // const describeGroup = await context.getConsumer().describeGroup();
    // console.log('describeGroup', describeGroup);
    // console.log('getConsumer', context.getConsumer());
    // console.log('partition',context.getPartition());
  }

  @MessagePattern('chat.getMessages')
  getChatMessage(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.appService.getMessages(context.getMessage().value);
  }
}
