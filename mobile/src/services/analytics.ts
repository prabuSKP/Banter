// mobile/src/services/analytics.ts

import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
  /**
   * Log screen view
   */
  async logScreenView(screenName: string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`Analytics: Screen view logged - ${screenName}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Log custom event
   */
  async logEvent(eventName: string, params?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, params);
      console.log(`Analytics: Event logged - ${eventName}`, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, string>) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
      console.log('Analytics: User properties set', properties);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Set user ID
   */
  async setUserId(userId: string) {
    try {
      await analytics().setUserId(userId);
      console.log(`Analytics: User ID set - ${userId}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // ============ App Events ============

  /**
   * Log app open
   */
  async logAppOpen() {
    await this.logEvent('app_open');
  }

  /**
   * Log login
   */
  async logLogin(method: string = 'phone') {
    await this.logEvent('login', {
      method,
    });
  }

  /**
   * Log sign up
   */
  async logSignUp(method: string = 'phone') {
    await this.logEvent('sign_up', {
      method,
    });
  }

  // ============ Call Events ============

  /**
   * Log call initiated
   */
  async logCallInitiated(callType: 'audio' | 'video', receiverId: string) {
    await this.logEvent('call_initiated', {
      call_type: callType,
      receiver_id: receiverId,
    });
  }

  /**
   * Log call accepted
   */
  async logCallAccepted(callType: 'audio' | 'video', callId: string) {
    await this.logEvent('call_accepted', {
      call_type: callType,
      call_id: callId,
    });
  }

  /**
   * Log call completed
   */
  async logCallCompleted(callType: 'audio' | 'video', duration: number, coinsCharged: number) {
    await this.logEvent('call_completed', {
      call_type: callType,
      duration_seconds: duration,
      coins_charged: coinsCharged,
      value: coinsCharged * 0.1, // Revenue in INR
      currency: 'INR',
    });
  }

  /**
   * Log call rejected
   */
  async logCallRejected(callType: 'audio' | 'video', callId: string) {
    await this.logEvent('call_rejected', {
      call_type: callType,
      call_id: callId,
    });
  }

  /**
   * Log call missed
   */
  async logCallMissed(callType: 'audio' | 'video', callId: string) {
    await this.logEvent('call_missed', {
      call_type: callType,
      call_id: callId,
    });
  }

  // ============ Wallet Events ============

  /**
   * Log wallet recharge initiated
   */
  async logRechargeInitiated(amount: number, coins: number, packageId: string) {
    await this.logEvent('recharge_initiated', {
      value: amount,
      currency: 'INR',
      coins,
      package_id: packageId,
    });
  }

  /**
   * Log wallet recharge completed
   */
  async logRechargeCompleted(amount: number, coins: number, packageId: string, paymentId: string) {
    await this.logEvent('purchase', {
      value: amount,
      currency: 'INR',
      coins,
      package_id: packageId,
      transaction_id: paymentId,
    });
  }

  /**
   * Log wallet recharge failed
   */
  async logRechargeFailed(amount: number, coins: number, reason: string) {
    await this.logEvent('recharge_failed', {
      value: amount,
      currency: 'INR',
      coins,
      reason,
    });
  }

  // ============ Friend Events ============

  /**
   * Log friend request sent
   */
  async logFriendRequestSent(receiverId: string) {
    await this.logEvent('friend_request_sent', {
      receiver_id: receiverId,
    });
  }

  /**
   * Log friend request accepted
   */
  async logFriendRequestAccepted(senderId: string) {
    await this.logEvent('friend_request_accepted', {
      sender_id: senderId,
    });
  }

  /**
   * Log friend removed
   */
  async logFriendRemoved(friendId: string) {
    await this.logEvent('friend_removed', {
      friend_id: friendId,
    });
  }

  // ============ Host Events ============

  /**
   * Log host application submitted
   */
  async logHostApplicationSubmitted() {
    await this.logEvent('host_application_submitted');
  }

  /**
   * Log host application approved
   */
  async logHostApplicationApproved() {
    await this.logEvent('host_application_approved');
  }

  /**
   * Log host earnings
   */
  async logHostEarning(amount: number, callType: 'audio' | 'video') {
    await this.logEvent('host_earning', {
      value: amount,
      currency: 'INR',
      call_type: callType,
    });
  }

  /**
   * Log host withdrawal requested
   */
  async logHostWithdrawalRequested(amount: number, method: string) {
    await this.logEvent('host_withdrawal_requested', {
      value: amount,
      currency: 'INR',
      method,
    });
  }

  /**
   * Log host rating submitted
   */
  async logHostRatingSubmitted(hostId: string, rating: number) {
    await this.logEvent('host_rating_submitted', {
      host_id: hostId,
      rating,
    });
  }

  // ============ Settings Events ============

  /**
   * Log settings changed
   */
  async logSettingsChanged(settingName: string, value: any) {
    await this.logEvent('settings_changed', {
      setting_name: settingName,
      value: String(value),
    });
  }

  /**
   * Log privacy settings updated
   */
  async logPrivacyUpdated(whoCanCall: string, profileVisibility: string) {
    await this.logEvent('privacy_updated', {
      who_can_call: whoCanCall,
      profile_visibility: profileVisibility,
    });
  }

  // ============ Error Events ============

  /**
   * Log error
   */
  async logError(errorName: string, errorMessage: string, fatal: boolean = false) {
    await this.logEvent('app_error', {
      error_name: errorName,
      error_message: errorMessage,
      fatal: fatal ? 'yes' : 'no',
    });
  }

  // ============ Admin Events ============

  /**
   * Log admin action
   */
  async logAdminAction(action: string, targetId?: string) {
    await this.logEvent('admin_action', {
      action,
      target_id: targetId,
    });
  }

  // ============ Search Events ============

  /**
   * Log search
   */
  async logSearch(searchTerm: string, resultCount: number) {
    await this.logEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
    });
  }

  // ============ Engagement Events ============

  /**
   * Log share
   */
  async logShare(contentType: string, itemId: string, method: string) {
    await this.logEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method,
    });
  }

  /**
   * Log tutorial begin
   */
  async logTutorialBegin() {
    await this.logEvent('tutorial_begin');
  }

  /**
   * Log tutorial complete
   */
  async logTutorialComplete() {
    await this.logEvent('tutorial_complete');
  }
}

export default new AnalyticsService();
