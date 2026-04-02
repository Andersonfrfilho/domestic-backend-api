import { describe, expect, it } from '@jest/globals';
import { Phone } from './phone.entity';

describe('Phone Entity - Unit Tests', () => {
  describe('Phone constructor', () => {
    it('should create a Phone entity instance', () => {
      const phone = new Phone();

      expect(phone).toBeDefined();
      expect(phone).toBeInstanceOf(Phone);
    });

    it('should assign phone number property correctly', () => {
      const phone = new Phone();
      phone.number = '+5585993056772';

      expect(phone.number).toBe('+5585993056772');
      expect(typeof phone.number).toBe('string');
    });
  });

  describe('Phone entity full lifecycle', () => {
    it('should create a complete phone object with all fields', () => {
      const phone = new Phone();
      const now = new Date();

      phone.id = '660e8400-e29b-41d4-a716-446655440001';
      phone.number = '+5585993056772';
      phone.type = 'MOBILE';
      phone.isVerified = true;
      phone.createdAt = now;

      expect(phone.id).toBe('660e8400-e29b-41d4-a716-446655440001');
      expect(phone.number).toBe('+5585993056772');
      expect(phone.type).toBe('MOBILE');
      expect(phone.isVerified).toBe(true);
      expect(phone.createdAt).toEqual(now);
    });
  });
});
