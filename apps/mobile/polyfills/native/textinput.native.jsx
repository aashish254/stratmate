import React from 'react';
import RNTextInput from 'react-native/Libraries/Components/TextInput/TextInput';

const TextInput = React.forwardRef((props, ref) => {
  return (
    <RNTextInput
      ref={ref}
      placeholderTextColor={props.placeholderTextColor || 'black'}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
