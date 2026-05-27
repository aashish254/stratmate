import { SplashScreen } from 'expo-router/build/exports';
import * as Updates from 'expo-updates';
import React, { type ReactNode, useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { isErrorLike, serializeError } from 'serialize-error';
import { Button, SharedErrorBoundary } from './SharedErrorBoundary';
import { reportErrorToRemote } from './report-error-to-remote';
import { getTestFlightLogger } from './testflight-logger';

type ErrorBoundaryState = {
  hasError: boolean;
  error: unknown | null;
  sentLogs: boolean;
};

const DeviceErrorBoundary = ({
  sentLogs,
  error,
}: {
  sentLogs: boolean;
  error: unknown | null;
}) => {

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  const handleFixClick = useCallback(() => {
    // no-op: fix button removed
  }, [error]);
  const handleReload = useCallback(async () => {
    if (Platform.OS === 'web') {
      window.location.reload();
      return;
    }

    Updates.reloadAsync().catch((error) => {
      // no-op, we don't want to show an error here
    });
  }, []);
  return (
    <SharedErrorBoundary
      isOpen
      description={
        sentLogs
          ? 'It looks like an error occurred. Our team has been notified. Please restart the app.'
          : 'It looks like an error occurred while using StratMate. Please restart the app and try again.'
      }
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button color="primary" onPress={handleReload}>
            Restart app
          </Button>
      </View>
    </SharedErrorBoundary>
  );
};

export class DeviceErrorBoundaryWrapper extends React.Component<
  {
    children: ReactNode;
  },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    sentLogs: false,
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error, sentLogs: false };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    this.setState({ error });
    const logger = getTestFlightLogger();
    if (logger) {
      const serialized = serializeError(error);
      logger.logError(
        `[ERROR_BOUNDARY] ${isErrorLike(serialized) ? serialized.message : JSON.stringify(serialized)}`
      );
    }
    reportErrorToRemote({ error })
      .then(({ success, error: fetchError }) => {
        this.setState({ hasError: true, sentLogs: success });
      })
      .catch((reportError) => {
        this.setState({ hasError: true, sentLogs: false });
      });
  }

  render() {
    if (this.state.hasError) {
      return <DeviceErrorBoundary error={this.state.error} sentLogs={this.state.sentLogs} />;
    }
    return this.props.children;
  }
}
