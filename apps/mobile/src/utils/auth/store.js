import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const authKey = `stratmate-${process.env.EXPO_PUBLIC_APP_ID ?? 'app'}-jwt`;

/**
 * Explicit Keychain options used on every SecureStore call in the auth flow.
 *
 * - keychainService: pinned to a stable name so reads and writes always hit
 *   the same partition. Without this, SecureStore derives a service name from
 *   the bundle that can drift between Classic and EAS builds, causing reads
 *   to miss writes from a previous build.
 * - keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY allows the auth
 *   token to be read on every cold launch after the device has been unlocked
 *   once since boot. The default (WHEN_UNLOCKED) refuses access during the
 *   first-unlock window, which is the most common TestFlight failure mode.
 * - requireAuthentication: false keeps SecureStore on its non-biometric code
 *   path, so it never reads NSFaceIDUsageDescription or constructs a
 *   biometry-current-set access control object — both of which can throw
 *   NSException and trip iOS 26's unhandled async-void TurboModule rethrow.
 */
export const secureStoreOptions = {
  keychainService: 'stratmate-auth',
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  requireAuthentication: false,
};

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  setAuth: (auth) => {
    if (auth) {
      SecureStore.setItemAsync(
        authKey,
        JSON.stringify(auth),
        secureStoreOptions,
      ).catch(() => {
        // Swallow Keychain write errors — the app remains in-memory authed
        // for this session and the next launch will re-auth via the WebView.
        // Throwing here would propagate into the unhandled-rejection /
        // TurboModule rethrow path and crash on iOS 26.x.
      });
    } else {
      SecureStore.deleteItemAsync(authKey, secureStoreOptions).catch(() => {});
    }
    set({ auth });
  },
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signup',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  close: () => set({ isOpen: false }),
}));