// backend/src/config/firebase.ts

import admin from 'firebase-admin';
import env from './env';
import logger from './logger';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Parse private key (handle escaped newlines from .env)
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    logger.info('✅ Firebase Admin SDK initialized');
  } catch (error) {
    logger.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error;
  }
};

initializeFirebase();

// Export Firebase Auth
export const firebaseAuth = admin.auth();

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string) => {
  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
};

// Get or create user by phone number
export const getOrCreateFirebaseUser = async (phoneNumber: string) => {
  try {
    // Check if user exists
    try {
      const user = await firebaseAuth.getUserByPhoneNumber(phoneNumber);
      return user;
    } catch (error: any) {
      // User doesn't exist, create new user
      if (error.code === 'auth/user-not-found') {
        const newUser = await firebaseAuth.createUser({
          phoneNumber: phoneNumber,
        });
        logger.info(`Created new Firebase user: ${phoneNumber}`);
        return newUser;
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error getting/creating Firebase user:', error);
    throw error;
  }
};

// Delete Firebase user
export const deleteFirebaseUser = async (uid: string) => {
  try {
    await firebaseAuth.deleteUser(uid);
    logger.info(`Deleted Firebase user: ${uid}`);
  } catch (error) {
    logger.error('Error deleting Firebase user:', error);
    throw error;
  }
};

export default admin;
