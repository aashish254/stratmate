diff --git a/node_modules/react-native-purchases-ui/lib/commonjs/utils/environment.js b/node_modules/react-native-purchases-ui/lib/commonjs/utils/environment.js
index 43e5e6a..b67d36a 100644
--- a/node_modules/react-native-purchases-ui/lib/commonjs/utils/environment.js
+++ b/node_modules/react-native-purchases-ui/lib/commonjs/utils/environment.js
@@ -31,6 +31,12 @@ function shouldUsePreviewAPIMode() {
  */
 function isExpoGo() {
   var _globalThis$expo;
+  if (!__DEV__) {
+    return false;
+  }
+  if (globalThis.expo && globalThis.expo.modules && globalThis.expo.modules.AnythingLauncherModule) {
+    return true;
+  }
   if (!!_reactNative.NativeModules.RNPaywalls && !!_reactNative.NativeModules.RNCustomerCenter) {
     return false;
   }
diff --git a/node_modules/react-native-purchases-ui/lib/module/utils/environment.js b/node_modules/react-native-purchases-ui/lib/module/utils/environment.js
index 435d456..4002fe2 100644
--- a/node_modules/react-native-purchases-ui/lib/module/utils/environment.js
+++ b/node_modules/react-native-purchases-ui/lib/module/utils/environment.js
@@ -26,6 +26,12 @@ export function shouldUsePreviewAPIMode() {
  */
 function isExpoGo() {
   var _globalThis$expo;
+  if (!__DEV__) {
+    return false;
+  }
+  if (globalThis.expo && globalThis.expo.modules && globalThis.expo.modules.AnythingLauncherModule) {
+    return true;
+  }
   if (!!NativeModules.RNPaywalls && !!NativeModules.RNCustomerCenter) {
     return false;
   }
diff --git a/node_modules/react-native-purchases-ui/src/utils/environment.ts b/node_modules/react-native-purchases-ui/src/utils/environment.ts
index 5605bf2..ed86595 100644
--- a/node_modules/react-native-purchases-ui/src/utils/environment.ts
+++ b/node_modules/react-native-purchases-ui/src/utils/environment.ts
@@ -26,6 +26,7 @@ declare global {
   var expo: {
     modules?: {
       ExpoGo?: boolean;
+      AnythingLauncherModule?: boolean;
     };
   };
 }
@@ -34,6 +35,12 @@ declare global {
  * Detects if the app is running in Expo Go
  */
 function isExpoGo(): boolean {
+  if (!__DEV__) {
+    return false;
+  }
+  if (globalThis.expo && globalThis.expo.modules && globalThis.expo.modules.AnythingLauncherModule) {
+    return true;
+  }
   if (!!NativeModules.RNPaywalls && !!NativeModules.RNCustomerCenter) {
     return false;
   }
