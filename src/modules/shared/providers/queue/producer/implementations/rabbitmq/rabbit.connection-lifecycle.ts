import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RabbitConnectionLifecycleListener implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private connectionAttempts = 0;
  private lastConnectionAttemptTime: Date | null = null;

  constructor(private readonly amqpConnection: AmqpConnection) {}

  onModuleInit() {
    this.logger.debug('Module init started - setting up event listeners');

    const connection = this.amqpConnection.managedConnection;
    if (!connection) {
      this.logger.debug('No managed connection available yet');
      return;
    }

    // Listen for connection attempts
    connection.on('connection', () => {
      this.lastConnectionAttemptTime = new Date();
      this.connectionAttempts++;
      this.logger.log(`Connection established (attempt #${this.connectionAttempts})`);
    });

    connection.on('disconnect', (params: any) => {
      this.logger.warn(`Connection closed - error: ${params?.err?.message || 'clean close'}`);
    });

    connection.on('blocked', (reason: string) => {
      this.logger.warn(`Connection blocked: ${reason}`);
    });

    connection.on('unblocked', () => {
      this.logger.log('Connection unblocked');
    });

    this.logger.debug('Event listeners attached');
  }

  getConnectionStats() {
    return {
      totalAttempts: this.connectionAttempts,
      lastAttempt: this.lastConnectionAttemptTime,
      isConnected: this.amqpConnection.connected,
    };
  }
}
