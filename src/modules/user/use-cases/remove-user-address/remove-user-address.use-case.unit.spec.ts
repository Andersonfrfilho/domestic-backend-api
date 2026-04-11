import { RemoveUserAddressUseCase } from './remove-user-address.use-case';

const mockUserAddress = { id: 'ua-1', userId: 'user-1', addressId: 'addr-1', isPrimary: false };

describe('RemoveUserAddressUseCase', () => {
  let useCase: RemoveUserAddressUseCase;
  let mockUserAddressRepository: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockUserAddressRepository = { findById: jest.fn(), delete: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };

    useCase = new RemoveUserAddressUseCase(mockUserAddressRepository, mockLogProvider);
  });

  it('removes user address when found and owned by user', async () => {
    mockUserAddressRepository.findById.mockResolvedValue(mockUserAddress);
    mockUserAddressRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ userId: 'user-1', userAddressId: 'ua-1' });

    expect(mockUserAddressRepository.findById).toHaveBeenCalledWith('ua-1');
    expect(mockUserAddressRepository.delete).toHaveBeenCalledWith('ua-1');
  });

  it('throws notFound when userAddress does not exist', async () => {
    mockUserAddressRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'user-1', userAddressId: 'unknown' })).rejects.toThrow();
    expect(mockUserAddressRepository.delete).not.toHaveBeenCalled();
  });

  it('throws notFound when address belongs to different user (security)', async () => {
    mockUserAddressRepository.findById.mockResolvedValue({ ...mockUserAddress, userId: 'other-user' });

    await expect(useCase.execute({ userId: 'user-1', userAddressId: 'ua-1' })).rejects.toThrow();
    expect(mockUserAddressRepository.delete).not.toHaveBeenCalled();
  });
});
