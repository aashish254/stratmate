import React, { useMemo } from 'react';
import RNScrollView from 'react-native-web/dist/exports/ScrollView';

export const ScrollView = React.forwardRef((props, ref) => {
    const extendedStyle = useMemo(() => {
        if (props.horizontal) {
            return [{flexGrow: 0}, props.style]
        }
        return props.style
    }, [props.horizontal, props.style])

  return (
    <RNScrollView
      ref={ref}
      {...props}
      style={extendedStyle}
    />
  );
});

ScrollView.displayName = 'ScrollView';

export default ScrollView;
