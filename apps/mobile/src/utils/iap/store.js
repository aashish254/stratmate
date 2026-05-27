import { create } from 'zustand';

export const useInAppPurchaseStore = create((set) => ({
  isReady: false,
  offerings: null,
  isSubscribed: false,
  setIsSubscribed: (isSubscribed) => set({ isSubscribed }),
  setOfferings: (offerings) => set({ offerings }),
  setIsReady: (isReady) => set({ isReady }),
}));
