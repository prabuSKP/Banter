// backend/tests/unit/utils/validators.test.ts

import {
  phoneNumberSchema,
  firebaseIdTokenSchema,
  userUpdateSchema,
  messageSchema,
  callInitiateSchema,
  validate,
} from '../../../src/utils/validators';

describe('Validators', () => {
  describe('phoneNumberSchema', () => {
    it('should validate correct phone number format', () => {
      const validNumbers = [
        '+919876543210',
        '+12345678901',
        '+441234567890',
      ];

      validNumbers.forEach(number => {
        expect(() => phoneNumberSchema.parse(number)).not.toThrow();
      });
    });

    it('should reject invalid phone number format', () => {
      const invalidNumbers = [
        '9876543210', // Missing country code
        '+91 98765 43210', // Contains spaces
        '91-9876543210', // Missing +
        '+91', // Too short
        'invalid',
      ];

      invalidNumbers.forEach(number => {
        expect(() => phoneNumberSchema.parse(number)).toThrow();
      });
    });
  });

  describe('firebaseIdTokenSchema', () => {
    it('should validate non-empty token', () => {
      expect(() => firebaseIdTokenSchema.parse('valid-token')).not.toThrow();
    });

    it('should reject empty token', () => {
      expect(() => firebaseIdTokenSchema.parse('')).toThrow();
    });
  });

  describe('userUpdateSchema', () => {
    it('should validate correct user update data', () => {
      const validData = {
        displayName: 'John Doe',
        bio: 'Software developer',
        gender: 'male' as const,
        interests: ['coding', 'music'],
      };

      expect(() => userUpdateSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid gender', () => {
      const invalidData = {
        gender: 'invalid',
      };

      expect(() => userUpdateSchema.parse(invalidData)).toThrow();
    });

    it('should reject too many interests', () => {
      const invalidData = {
        interests: Array(11).fill('interest'), // Max is 10
      };

      expect(() => userUpdateSchema.parse(invalidData)).toThrow();
    });

    it('should accept partial updates', () => {
      const partialData = {
        displayName: 'John',
      };

      expect(() => userUpdateSchema.parse(partialData)).not.toThrow();
    });
  });

  describe('messageSchema', () => {
    it('should validate direct message', () => {
      const validMessage = {
        receiverId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Hello!',
        messageType: 'text' as const,
      };

      expect(() => messageSchema.parse(validMessage)).not.toThrow();
    });

    it('should validate room message', () => {
      const validMessage = {
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Hello room!',
        messageType: 'text' as const,
      };

      expect(() => messageSchema.parse(validMessage)).not.toThrow();
    });

    it('should reject message without receiverId or roomId', () => {
      const invalidMessage = {
        content: 'Hello!',
        messageType: 'text' as const,
      };

      expect(() => messageSchema.parse(invalidMessage)).toThrow();
    });

    it('should reject invalid message type', () => {
      const invalidMessage = {
        receiverId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Hello!',
        messageType: 'invalid',
      };

      expect(() => messageSchema.parse(invalidMessage)).toThrow();
    });

    it('should validate message with media URL', () => {
      const validMessage = {
        receiverId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Check this out',
        messageType: 'image' as const,
        mediaUrl: 'https://example.com/image.jpg',
      };

      expect(() => messageSchema.parse(validMessage)).not.toThrow();
    });
  });

  describe('callInitiateSchema', () => {
    it('should validate audio call', () => {
      const validCall = {
        receiverId: '550e8400-e29b-41d4-a716-446655440000',
        callType: 'audio' as const,
      };

      expect(() => callInitiateSchema.parse(validCall)).not.toThrow();
    });

    it('should validate video call', () => {
      const validCall = {
        receiverId: '550e8400-e29b-41d4-a716-446655440000',
        callType: 'video' as const,
      };

      expect(() => callInitiateSchema.parse(validCall)).not.toThrow();
    });

    it('should reject invalid call type', () => {
      const invalidCall = {
        receiverId: '550e8400-e29b-41d4-a716-446655440000',
        callType: 'invalid',
      };

      expect(() => callInitiateSchema.parse(invalidCall)).toThrow();
    });
  });

  describe('validate helper', () => {
    it('should validate data with schema', () => {
      const result = validate(phoneNumberSchema, '+919876543210');
      expect(result).toBe('+919876543210');
    });

    it('should throw on validation failure', () => {
      expect(() => validate(phoneNumberSchema, 'invalid')).toThrow();
    });
  });
});
