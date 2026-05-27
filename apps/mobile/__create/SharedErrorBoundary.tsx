import React, {
  type ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Animated, Text, View } from 'react-native';
import { isErrorLike, serializeError } from 'serialize-error';

export function SharedErrorBoundary({
  isOpen,
  children,
  description,
}: {
  isOpen: boolean;
  children?: ReactNode;
  description?: string;
}): React.ReactElement {
  const animation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    // fallback 100 if height not measured yet so it starts off-screen
    outputRange: [Math.max(contentHeight + 34, 100), 0],
  });

  const opacity = animation;

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        bottom: 34,
        transform: [
          {
            translateY,
          },
        ],
        zIndex: 50,
        alignItems: 'center',
        justifyContent: 'center',
        left: '5%',
        width: '90%',
      }}
    >
      <View
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        style={{
          backgroundColor: '#18191B',
          borderRadius: 8,
          padding: 16,
          maxWidth: 448,
          width: '100%',
          marginHorizontal: 16,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <View
          style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}
        >
          <View style={{ flexShrink: 0 }}>
            <View
              style={{
                width: 32,
                height: 32,
                backgroundColor: '#F2F2F2',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#000', fontSize: 18, lineHeight: 18 }}>
                ⚠
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ gap: 4 }}>
              <Text
                style={{ color: '#F2F2F2', fontSize: 14, fontWeight: '300' }}
              >
                App Error Detected
              </Text>
              <Text
                style={{ color: '#959697', fontSize: 14, fontWeight: '300' }}
              >
                {description ??
                  'It looks like an error occurred while trying to use your app.'}
              </Text>
            </View>
            {children}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
export function Button({
  color = 'primary',
  onPress = () => {},
  children,
}: {
  color?: 'primary' | 'secondary';
  onPress?: () => void;
  children: string;
}): React.ReactElement {
  return (
    <View
      style={{
        backgroundColor: color === 'secondary' ? '#2C2D2F' : '#F9F9F9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: color === 'secondary' ? '#414243' : '#C4C4C4',
        padding: 4,
        paddingHorizontal: 8,
      }}
    >
      <Text
        style={{
          color: color === 'secondary' ? 'white' : '#18191B',
          fontSize: 14,
        }}
        onPress={onPress}
      >
        {children}
      </Text>
    </View>
  );
}

function InternalErrorBoundary({
  error: errorArg = null,
}: {
  error: unknown | null;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const handleCopyError = useCallback(() => {
    const serializedError = serializeError(errorArg);
    const text = isErrorLike(serializedError)
      ? `${serializedError.message}\n\n${serializedError.stack}`
      : JSON.stringify(serializedError, null, 2);
    navigator.clipboard.writeText(text);
    setIsOpen(false);
  }, [errorArg]);

  const postCountRef = useRef(0);
  const lastPostTimeRef = useRef(0);
  const lastErrorKeyRef = useRef<string | null>(null);
  const MAX_ERROR_POSTS_PER_ERROR = 5;
  const THROTTLE_MS = 1000;

  useEffect(() => {
    const serialized = serializeError(errorArg);
    const errorKey = JSON.stringify(serialized);

    if (errorKey !== lastErrorKeyRef.current) {
      lastErrorKeyRef.current = errorKey;
      postCountRef.current = 0;
    }

    if (postCountRef.current >= MAX_ERROR_POSTS_PER_ERROR) {
      return;
    }

    const now = Date.now();
    const timeSinceLastPost = now - lastPostTimeRef.current;

    const post = () => {
      if (postCountRef.current >= MAX_ERROR_POSTS_PER_ERROR) {
        return;
      }
      postCountRef.current += 1;
      lastPostTimeRef.current = Date.now();
      window.parent.postMessage(
        { type: 'sandbox:error:detected', error: serialized },
        '*'
      );
    };

    if (timeSinceLastPost < THROTTLE_MS) {
      const timer = setTimeout(post, THROTTLE_MS - timeSinceLastPost);
      return () => clearTimeout(timer);
    }

    post();
  }, [errorArg]);

  function isInIframe() {
    try {
      return window.parent !== window;
    } catch {
      return true;
    }
  }
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {!isInIframe() && (
        <SharedErrorBoundary isOpen={isOpen}>
          <Button color="primary" onPress={handleCopyError}>
            Copy error
          </Button>
        </SharedErrorBoundary>
      )}
    </View>
  );
}

type ErrorBoundaryState = { hasError: boolean; error: unknown | null };

export class ErrorBoundaryWrapper extends React.Component<
  {
    children: ReactNode;
  },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.warn(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <InternalErrorBoundary error={this.state.error} />;
    }
    return this.props.children;
  }
}
