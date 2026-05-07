import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

const LIFECYCLE_LOG_PREFIX = '🐰 RabbitMQ';

export const rabbitConnection = RabbitMQModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    console.log(`${LIFECYCLE_LOG_PREFIX} [INIT] Factory invoked - starting environment variable loading phase`);

    const user = configService.get('QUEUE_RABBITMQ_USER');
    const pass = configService.get('QUEUE_RABBITMQ_PASS');
    const host = configService.get('QUEUE_RABBITMQ_HOST');
    const port = configService.get('QUEUE_RABBITMQ_PORT');

    console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] User loaded: ${user ? '✓ set' : '✗ not set'}`);
    console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Pass loaded: ${pass ? '✓ set' : '✗ not set'}`);
    console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Host loaded: ${host ? `✓ ${host}` : '✗ not set'}`);
    console.log(`${LIFECYCLE_LOG_PREFIX} [ENV] Port loaded: ${port ? `✓ ${port}` : '✗ not set'}`);

    const uri = `amqp://${user}:${pass}@${host}:${port}`;
    console.log(`${LIFECYCLE_LOG_PREFIX} [URI] Constructed: amqp://***:***@${host}:${port}`);

    return {
      // ✅ EXCHANGES - Declaramos todas as exchanges que vamos usar
      exchanges: [
        // Exchange para notificações (emails, SMS, push notifications)
        {
          name: 'notifications',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        // Exchange para auditoria e logs de segurança
        {
          name: 'audit',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        // Exchange para integrações com sistemas externos
        {
          name: 'integration',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        // Exchange para analytics e processamento assíncrono
        {
          name: 'analytics',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        // Exchange para testes de saúde
        {
          name: 'health',
          type: 'direct',
          options: {
            durable: false,
            autoDelete: true,
          },
        },
        // Exchange padrão para mensagens sem exchange específico
        {
          name: 'default',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        // Exchange de domínio Zolve — eventos de negócio (provider, service-request, review)
        {
          name: 'zolve.events',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        // 🔥 DEAD LETTER EXCHANGES - Para mensagens que falharam
        {
          name: 'notifications.dlx',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        {
          name: 'integration.dlx',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
        {
          name: 'analytics.dlx',
          type: 'topic',
          options: {
            durable: true,
            autoDelete: false,
          },
        },
      ],

      // ✅ QUEUES — declaração + bindings no mesmo passo (sem race condition)
      queues: [
        {
          name: 'email.notifications',
          options: { durable: true, deadLetterExchange: 'notifications.dlx', messageTtl: 86400000 },
          bindings: [
            { exchange: 'notifications', routingKey: 'email.welcome' },
            { exchange: 'notifications', routingKey: 'email.*' },
          ],
        },
        {
          name: 'audit.events',
          options: { durable: true, messageTtl: 604800000 },
          bindings: [
            { exchange: 'audit', routingKey: 'audit.user.created' },
            { exchange: 'audit', routingKey: 'audit.*' },
          ],
        },
        {
          name: 'crm.sync',
          options: { durable: true, deadLetterExchange: 'integration.dlx' },
          bindings: [
            { exchange: 'integration', routingKey: 'integration.crm.sync' },
            { exchange: 'integration', routingKey: 'integration.*' },
          ],
        },
        {
          name: 'risk.analysis',
          options: { durable: true, deadLetterExchange: 'analytics.dlx' },
          bindings: [
            { exchange: 'analytics', routingKey: 'analytics.risk.analysis' },
            { exchange: 'analytics', routingKey: 'analytics.*' },
          ],
        },
        {
          name: 'health.test.queue',
          options: { durable: false, autoDelete: true },
          bindings: [{ exchange: 'health', routingKey: 'health.test' }],
        },
        {
          name: 'default.queue',
          options: { durable: true },
          bindings: [{ exchange: 'default', routingKey: '#' }],
        },
        {
          name: 'provider.events',
          options: { durable: true },
          bindings: [{ exchange: 'zolve.events', routingKey: 'provider.*' }],
        },
        {
          name: 'service-request.events',
          options: { durable: true },
          bindings: [{ exchange: 'zolve.events', routingKey: 'service_request.*' }],
        },
        // Dead letter queues
        {
          name: 'email.notifications.dlq',
          options: { durable: true, messageTtl: 2592000000 },
          bindings: [{ exchange: 'notifications.dlx', routingKey: '#' }],
        },
        {
          name: 'crm.sync.dlq',
          options: { durable: true, messageTtl: 2592000000 },
          bindings: [{ exchange: 'integration.dlx', routingKey: '#' }],
        },
        {
          name: 'risk.analysis.dlq',
          options: { durable: true, messageTtl: 2592000000 },
          bindings: [{ exchange: 'analytics.dlx', routingKey: '#' }],
        },
      ],

      uri,
      connectionInitOptions: {
        wait: false,
      },
      enableControllerDiscovery: false,
    };
  },
  inject: [ConfigService],
});
