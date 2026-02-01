import { AdMob, RewardAdPluginEvents, AdMobRewardItem, RewardAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

class AdMobService {
  private initialized = false;
  private rewardedAdReady = false;
  private listeners: { remove: () => void }[] = [];

  async initialize(): Promise<void> {
    if (this.initialized || !Capacitor.isNativePlatform()) {
      console.log('AdMob: Skipping initialization (not native platform or already initialized)');
      return;
    }

    try {
      await AdMob.initialize({
        initializeForTesting: false,
      });
      
      this.initialized = true;
      console.log('AdMob initialized successfully');
      
      // Set up event listeners
      const loadedListener = await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('Rewarded ad loaded');
        this.rewardedAdReady = true;
      });
      this.listeners.push(loadedListener);

      const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
        console.error('Rewarded ad failed to load:', error);
        this.rewardedAdReady = false;
      });
      this.listeners.push(failedListener);

      // Preload the first rewarded ad
      await this.prepareRewardedAd();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  async prepareRewardedAd(): Promise<void> {
    if (!this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const adId = Capacitor.getPlatform() === 'ios'
        ? import.meta.env.VITE_ADMOB_REWARDED_AD_ID_IOS || 'ca-app-pub-3940256099942544/1712485313' // Test ID
        : import.meta.env.VITE_ADMOB_REWARDED_AD_ID_ANDROID || 'ca-app-pub-3940256099942544/5224354917'; // Test ID

      const options: RewardAdOptions = {
        adId,
        isTesting: import.meta.env.DEV,
      };

      await AdMob.prepareRewardVideoAd(options);
      console.log('Rewarded ad prepared');
    } catch (error) {
      console.error('Failed to prepare rewarded ad:', error);
    }
  }

  async showRewardedAd(): Promise<boolean> {
    // If not native platform, simulate watching ad
    if (!Capacitor.isNativePlatform()) {
      console.log('AdMob: Simulating ad watch (not native platform)');
      return new Promise((resolve) => {
        // Simulate ad duration
        setTimeout(() => resolve(true), 2000);
      });
    }

    if (!this.initialized) {
      console.error('AdMob not initialized');
      return false;
    }

    return new Promise(async (resolve) => {
      let resolved = false;
      
      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: AdMobRewardItem) => {
          console.log('User earned reward:', reward);
          if (!resolved) {
            resolved = true;
            // Prepare next ad
            this.prepareRewardedAd();
            resolve(true);
          }
        }
      );

      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          console.log('Rewarded ad dismissed');
          rewardListener.remove();
          dismissListener.remove();
          // Prepare next ad
          this.prepareRewardedAd();
        }
      );

      const failedListener = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        (error) => {
          console.error('Failed to show rewarded ad:', error);
          rewardListener.remove();
          dismissListener.remove();
          failedListener.remove();
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }
      );

      try {
        await AdMob.showRewardVideoAd();
      } catch (error) {
        console.error('Error showing rewarded ad:', error);
        rewardListener.remove();
        dismissListener.remove();
        failedListener.remove();
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }
    });
  }

  isReady(): boolean {
    return this.rewardedAdReady || !Capacitor.isNativePlatform();
  }

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  cleanup(): void {
    this.listeners.forEach(l => l.remove());
    this.listeners = [];
  }
}

export const adMobService = new AdMobService();
