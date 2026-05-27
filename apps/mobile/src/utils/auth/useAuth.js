import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey, secureStoreOptions } from './store';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    // The auth state machine must always reach a terminal state. SecureStore
    // can throw or hang in TestFlight release builds (Keychain access denied,
    // missing keychain-access-groups entitlement after EAS migration, locked
    // device first-unlock state, or iOS 26 TurboModule rethrow). Without a
    // catch the unhandled rejection leaves isReady=false forever and the
    // RootLayout renders null — the user sees a blank screen indefinitely.
    Promise.race([
      SecureStore.getItemAsync(authKey, secureStoreOptions),
      new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
    ])
      .then((stored) => {
        useAuthStore.setState({
          auth: stored ? JSON.parse(stored) : null,
          isReady: true,
        });
      })
      .catch(() => {
        useAuthStore.setState({ auth: null, isReady: true });
      });
  }, []);

  useEffect(() => {}, []);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;