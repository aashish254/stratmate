diff --git a/node_modules/react-native-keyboard-controller/lib/commonjs/animated.js b/node_modules/react-native-keyboard-controller/lib/commonjs/animated.js
index 8926fbb..3a9d0f1 100644
--- a/node_modules/react-native-keyboard-controller/lib/commonjs/animated.js
+++ b/node_modules/react-native-keyboard-controller/lib/commonjs/animated.js
@@ -182,7 +182,8 @@ const KeyboardProvider = props => {
     onKeyboardMove: OS === "android" ? onKeyboardMove : undefined,
     onKeyboardMoveInteractive: onKeyboardMove,
     onKeyboardMoveEnd: OS === "android" ? onKeyboardMove : undefined,
-    onFocusedInputLayoutChangedReanimated: inputLayoutHandler
+    onFocusedInputLayoutChangedReanimated: inputLayoutHandler,
+    pointerEvents: 'box-none'
   }, children), /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
     // we are using this small hack, because if the component (where
     // animated value has been used) is unmounted, then animation will
@@ -192,7 +193,8 @@ const KeyboardProvider = props => {
     //
     // To test why it's needed, try to open screen which consumes Animated.Value
     // then close it and open it again (for example 'Animated transition').
-    style: style
+    style: style,
+    pointerEvents: 'none'
   }));
 };
 exports.KeyboardProvider = KeyboardProvider;
diff --git a/node_modules/react-native-keyboard-controller/lib/module/animated.js b/node_modules/react-native-keyboard-controller/lib/module/animated.js
index 16a938c..6f0f0fb 100644
--- a/node_modules/react-native-keyboard-controller/lib/module/animated.js
+++ b/node_modules/react-native-keyboard-controller/lib/module/animated.js
@@ -174,7 +174,8 @@ export const KeyboardProvider = props => {
     onKeyboardMove: OS === "android" ? onKeyboardMove : undefined,
     onKeyboardMoveInteractive: onKeyboardMove,
     onKeyboardMoveEnd: OS === "android" ? onKeyboardMove : undefined,
-    onFocusedInputLayoutChangedReanimated: inputLayoutHandler
+    onFocusedInputLayoutChangedReanimated: inputLayoutHandler,
+    pointerEvents: 'box-none'
   }, children), /*#__PURE__*/React.createElement(Animated.View, {
     // we are using this small hack, because if the component (where
     // animated value has been used) is unmounted, then animation will
@@ -184,7 +185,8 @@ export const KeyboardProvider = props => {
     //
     // To test why it's needed, try to open screen which consumes Animated.Value
     // then close it and open it again (for example 'Animated transition').
-    style: style
+    style: style,
+    pointerEvents: 'none'
   }));
 };
 //# sourceMappingURL=animated.js.map
\ No newline at end of file
diff --git a/node_modules/react-native-keyboard-controller/src/animated.tsx b/node_modules/react-native-keyboard-controller/src/animated.tsx
index 39d5494..0dde72f 100644
--- a/node_modules/react-native-keyboard-controller/src/animated.tsx
+++ b/node_modules/react-native-keyboard-controller/src/animated.tsx
@@ -228,6 +228,7 @@ export const KeyboardProvider = (props: KeyboardProviderProps) => {
         onKeyboardMoveInteractive={onKeyboardMove}
         onKeyboardMoveEnd={OS === "android" ? onKeyboardMove : undefined}
         onFocusedInputLayoutChangedReanimated={inputLayoutHandler}
+        pointerEvents="box-none"
       >
         {children}
       </KeyboardControllerViewAnimated>
@@ -241,6 +242,7 @@ export const KeyboardProvider = (props: KeyboardProviderProps) => {
         // To test why it's needed, try to open screen which consumes Animated.Value
         // then close it and open it again (for example 'Animated transition').
         style={style}
+        pointerEvents="none"
       />
     </KeyboardContext.Provider>
   );
