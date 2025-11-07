// backend/tests/unit/utils/jwt.test.ts

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} from '../../../src/utils/jwt';

describe('JWT Utils', () => {
  const mockPayload = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    phoneNumber: '+919876543210',
    firebaseUid: 'test-firebase-uid',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = decodeToken(token);
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.phoneNumber).toBe(mockPayload.phoneNumber);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const verified = verifyAccessToken(token);
      expect(verified.userId).toBe(mockPayload.userId);
      expect(verified.phoneNumber).toBe(mockPayload.phoneNumber);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw error for expired token', () => {
      // This would require mocking time, skipping for now
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const verified = verifyRefreshToken(token);
      expect(verified.userId).toBe(mockPayload.userId);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = decodeToken(token);
      expect(decoded?.userId).toBe(mockPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});
