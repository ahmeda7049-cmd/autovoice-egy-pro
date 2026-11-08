/**
 * Google Mobile Ads (AdMob) Service
 * AutoVoice EGY PRO V2
 * 
 * App ID: ca-app-pub-7096879370242564~4036694688
 * Rewarded Ad Unit ID: ca-app-pub-7096879370242564/8466894287
 */

export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-7096879370242564~4036694688',
  rewardedAdUnitId: 'ca-app-pub-7096879370242564/8466894287',
  adDurationSeconds: 15, // Standard rewarded video duration
};

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      display?: (id: string) => void;
      pubads?: () => any;
      defineSlot?: (...args: any[]) => any;
      enableServices?: () => void;
    };
  }
}

class AdMobService {
  private isInitialized = false;

  public initialize(): void {
    if (this.isInitialized) return;
    
    // Inject Google Publisher Tag / Google Mobile Ads SDK for web/PWA
    if (typeof window !== 'undefined') {
      window.googletag = window.googletag || { cmd: [] };
      window.googletag.cmd.push(() => {
        try {
          if (window.googletag && window.googletag.pubads) {
            const pubads = window.googletag.pubads();
            pubads.setRequestNonPersonalizedAds(0);
            pubads.enableSingleRequest();
            window.googletag.enableServices?.();
          }
        } catch {
          // Graceful fallback if adblock or offline
        }
      });
      this.isInitialized = true;
    }
  }

  public getAppId(): string {
    return ADMOB_CONFIG.appId;
  }

  public getRewardedAdUnitId(): string {
    return ADMOB_CONFIG.rewardedAdUnitId;
  }
}

export const admobService = new AdMobService();
