import { faker } from '@faker-js/faker';
import { MongoClient } from 'mongodb';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';
import { getMongoDbName } from '../lib/mongo';

const NOTIFICATION_TYPES = [
  'SERVICE_REQUEST_CREATED',
  'SERVICE_REQUEST_ACCEPTED',
  'SERVICE_REQUEST_REJECTED',
  'SERVICE_REQUEST_COMPLETED',
  'SERVICE_REQUEST_CANCELLED',
  'REVIEW_RECEIVED',
  'PROVIDER_VERIFIED',
  'PROVIDER_REJECTED',
];

const MESSAGES: Record<string, string> = {
  SERVICE_REQUEST_CREATED: 'Sua solicitação de serviço foi criada.',
  SERVICE_REQUEST_ACCEPTED: 'Sua solicitação foi aceita pelo prestador.',
  SERVICE_REQUEST_REJECTED: 'Sua solicitação foi recusada pelo prestador.',
  SERVICE_REQUEST_COMPLETED: 'Serviço concluído! Deixe uma avaliação.',
  SERVICE_REQUEST_CANCELLED: 'Sua solicitação foi cancelada.',
  REVIEW_RECEIVED: 'Você recebeu uma nova avaliação.',
  PROVIDER_VERIFIED: 'Seu perfil de prestador foi aprovado.',
  PROVIDER_REJECTED: 'Seu perfil de prestador precisa de correções.',
};

export async function seedNotifications(client: MongoClient, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const db = client.db(getMongoDbName());
  const col = db.collection('notifications');

  const userIds = ctx.users.map((u) => u.id);
  const docs: object[] = [];

  for (let i = 0; i < cfg.notifications; i++) {
    const type = faker.helpers.arrayElement(NOTIFICATION_TYPES);
    const userId = faker.helpers.arrayElement(userIds);
    const now = faker.date.recent({ days: 30 });

    docs.push({
      message: MESSAGES[type] ?? 'Você tem uma nova notificação.',
      type,
      userId,
      read: faker.datatype.boolean({ probability: 0.4 }),
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });
  }

  await col.insertMany(docs);
  ctx.notificationsInserted = docs.length;
}
