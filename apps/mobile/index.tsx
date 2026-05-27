import ExceptionsManager from 'react-native/Libraries/Core/ExceptionsManager';

if (__DEV__) {
  ExceptionsManager.handleException = (error, isFatal) => {
    // no-op
  };
}

import 'react-native-url-polyfill/auto';
import './src/__create/polyfills';
global.Buffer = require('buffer').Buffer;

import '@expo/metro-runtime';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { AppRegistry, LogBox } from 'react-native';
import { DeviceErrorBoundaryWrapper } from './__create/DeviceErrorBoundary';
import { initTestFlightLogger } from './__create/testflight-logger';
import App from './entrypoint';
import StratMateMenu from './src/__create/stratmate-menu';

initTestFlightLogger();

if (__DEV__) {
  LogBox.ignoreAllLogs();
  LogBox.uninstall();
  AppRegistry.setWrapperComponentProvider(() => ({ children }) => {
    return (
      <>
        <DeviceErrorBoundaryWrapper>{children}</DeviceErrorBoundaryWrapper>
        <StratMateMenu />
      </>
    );
  });
}
renderRootComponent(App);
