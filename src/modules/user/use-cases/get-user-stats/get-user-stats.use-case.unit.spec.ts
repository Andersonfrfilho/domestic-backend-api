import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Test } from '@nestjs/testing';
import { USER_REPOSITORY_PROVIDE } from '../../user.token';

import {
  GET_USER_STATS_LOG_CONTEXT,
  GET_USER_STATS_LOG_MESSAGES,
} from './get-user-stats.constants';
import { GetUserStatsUseCase } from './get-user-stats.use-case';

const mockStats = {
  totalUsers: 42,
  customers: 35,
  providers: 7,
};

const mockUserRepository = { getStats: jest.fn() };
const mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };

describe('GetUserStatsUseCase', () => {
  let useCase: GetUserStatsUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetUserStatsUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();

    useCase = module.get(GetUserStatsUseCase);
    jest.clearAllMocks();
  });

  it('returns stats and logs flow', async () => {
    mockUserRepository.getStats.mockResolvedValue(mockStats);

    const result = await useCase.execute();

    expect(result).toEqual(mockStats);
    expect(mockUserRepository.getStats).toHaveBeenCalledTimes(1);

    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_STATS_LOG_MESSAGES.START_FLOW,
        context: 'GetUserStatsUseCase.execute',
      }),
    );

    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_STATS_LOG_MESSAGES.STATS_RETRIEVED,
        context: 'GetUserStatsUseCase.execute',
      }),
    );
  });
});
