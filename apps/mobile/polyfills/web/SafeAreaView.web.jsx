import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { SafeAreaView as NativeSafeAreaView } from 'react-native-safe-area-context/lib/commonjs';
export {
  initialWindowMetrics,
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  useSafeAreaFrame,
} from 'react-native-safe-area-context/lib/commonjs';

export const SafeAreaView = forwardRef(
  ({ children, edges = ['top', 'right', 'bottom', 'left'], ...rest }, forwardedRef) => {
    const isTabletAndAbove = typeof window !== 'undefined' ? window.self !== window.top : true;
    return (
      <NativeSafeAreaView {...rest} edges={edges} ref={forwardedRef}>
        {isTabletAndAbove && (Array.isArray(edges) && edges.includes('top') || (!Array.isArray(edges) && edges.top !== 'off')) && (
          <View style={{ height: 64 }} />
        )}
        {children}
        {isTabletAndAbove && (Array.isArray(edges) && edges.includes('bottom') || (!Array.isArray(edges) && edges.bottom !== 'off')) && (
          <View style={{ height: 34 }} />
        )}
      </NativeSafeAreaView>
    );
  }
);
export default SafeAreaView;
