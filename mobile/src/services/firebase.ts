// mobile/src/services/firebase.ts

import auth from '@react-native-firebase/auth';

export class FirebaseAuthService {
  // Send OTP to phone number
  async sendOTP(phoneNumber: string) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      return confirmation;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  // Verify OTP and get Firebase ID token
  async verifyOTP(confirmation: any, code: string) {
    try {
      const userCredential = await confirmation.confirm(code);
      const idToken = await userCredential.user.getIdToken();
      return {
        user: userCredential.user,
        idToken,
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw new Error(error.message || 'Invalid OTP code');
    }
  }

  // Get current Firebase ID token
  async getIdToken() {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  }

  // Sign out from Firebase
  async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Get current user
  getCurrentUser() {
    return auth().currentUser;
  }
}

export default new FirebaseAuthService();
