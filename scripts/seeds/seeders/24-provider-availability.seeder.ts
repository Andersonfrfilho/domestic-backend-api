import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ProviderAvailability } from '@app/modules/shared/providers/database/entities/provider-availability.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// Preset schedules for variety
const SCHEDULE_PRESETS = [
  { days: [1, 2, 3, 4, 5],    start: '08:00', end: '18:00' }, // Mon-Fri standard
  { days: [1, 2, 3, 4, 5, 6], start: '07:00', end: '19:00' }, // Mon-Sat extended
  { days: [1, 2, 3, 4, 5],    start: '09:00', end: '17:00' }, // Mon-Fri shorter
  { days: [1, 3, 5],          start: '08:00', end: '18:00' }, // Mon/Wed/Fri
  { days: [2, 4, 6],          start: '09:00', end: '17:00' }, // Tue/Thu/Sat
  { days: [1, 2, 3, 4, 5, 6], start: '08:00', end: '17:00' }, // Mon-Sat morning
  { days: [0, 6],             start: '08:00', end: '16:00' }, // Weekend only
  { days: [1, 2, 3, 4, 5],   start: '06:00', end: '14:00' }, // Mon-Fri early
];

export async function seedProviderAvailability(
  ds: DataSource,
  ctx: SeedContext,
  _cfg: SeedConfig,
): Promise<void> {
  const repo = ds.getRepository(ProviderAvailability);

  const entities: ProviderAvailability[] = [];

  for (let i = 0; i < ctx.providers.length; i++) {
    const provider = ctx.providers[i];

    let days: number[];
    let startTime: string;
    let endTime: string;

    if (i === 0) {
      // provider-test: pending verification — Mon-Fri limited hours
      days = [1, 2, 3, 4, 5];
      startTime = '08:00';
      endTime = '17:00';
    } else if (i === 1) {
      // provider-full: approved — Mon-Sat full day
      days = [1, 2, 3, 4, 5, 6];
      startTime = '07:00';
      endTime = '19:00';
    } else {
      const preset = faker.helpers.arrayElement(SCHEDULE_PRESETS);
      days = preset.days;
      startTime = preset.start;
      endTime = preset.end;
    }

    for (const dayOfWeek of days) {
      entities.push(
        repo.create({
          providerId: provider.id,
          dayOfWeek,
          startTime,
          endTime,
          isActive: true,
          additionalPercentage: 0,
        }),
      );
    }
  }

  ctx.providerAvailability = await repo.save(entities);
}
