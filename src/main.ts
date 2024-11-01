import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  for (let count = 1; count <= 3; count++) {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: `chat-${count}`,
            brokers: ['localhost:9093'],
          },
          consumer: {
            groupId: 'chat_consumer',
          },
          subscribe: {
            fromBeginning: true,
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    );
    app.enableShutdownHooks();
    app.listen();
    Logger.log(`Chat microservice ${count} started listening`);
  }
}
bootstrap();
