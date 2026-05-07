import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';

import { QUEUE_PRODUCER_PROVIDER } from '../../producer.token';
import { rabbitConnection } from './rabbit.connection';
import { RabbitConnectionLifecycleListener } from './rabbit.connection-lifecycle';
import { RabbitMQMessageProducer } from './rabbit.provider';

@Module({
  imports: [rabbitConnection, LoggerModule],
  providers: [
    RabbitConnectionLifecycleListener,
    {
      provide: QUEUE_PRODUCER_PROVIDER,
      useClass: RabbitMQMessageProducer,
    },
  ],
  exports: [QUEUE_PRODUCER_PROVIDER],
})
export class SharedInfrastructureProviderQueueProducerImplementationsRabbitMqModule {}
