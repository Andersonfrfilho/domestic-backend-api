import { LoggerModule } from '@adatechnology/nestjs-logger';
import { Module } from '@nestjs/common';

import { MESSAGE_PRODUCER, QUEUE_PRODUCER_PROVIDER } from '../../producer.token';
import { messageProducerProvider } from '../../producer.provider';
import { rabbitConnection } from './rabbit.connection';
import { RabbitConnectionLifecycleListener } from './rabbit.connection-lifecycle';
import { RabbitMQMessageProducer } from './rabbit.provider';

@Module({
  imports: [rabbitConnection, LoggerModule],
  providers: [
    RabbitConnectionLifecycleListener,
    messageProducerProvider,
    {
      provide: QUEUE_PRODUCER_PROVIDER,
      useClass: RabbitMQMessageProducer,
    },
  ],
  exports: [MESSAGE_PRODUCER, QUEUE_PRODUCER_PROVIDER],
})
export class SharedInfrastructureProviderQueueProducerImplementationsRabbitMqModule {}
