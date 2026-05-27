diff --git a/node_modules/expo-speech-recognition/build/ExpoSpeechRecognitionModule.js b/node_modules/expo-speech-recognition/build/ExpoSpeechRecognitionModule.js
index f3ea867..dd0009a 100644
--- a/node_modules/expo-speech-recognition/build/ExpoSpeechRecognitionModule.js
+++ b/node_modules/expo-speech-recognition/build/ExpoSpeechRecognitionModule.js
@@ -1,9 +1,11 @@
-import { requireNativeModule } from "expo";
+import { requireOptionalNativeModule } from "expo";
 // It loads the native module object from the JSI or falls back to
 // the bridge module (from NativeModulesProxy) if the remote debugger is on.
-export const ExpoSpeechRecognitionModule = requireNativeModule("ExpoSpeechRecognition");
-const stop = ExpoSpeechRecognitionModule.stop;
-const abort = ExpoSpeechRecognitionModule.abort;
-ExpoSpeechRecognitionModule.abort = () => abort();
-ExpoSpeechRecognitionModule.stop = () => stop();
+export const ExpoSpeechRecognitionModule = requireOptionalNativeModule("ExpoSpeechRecognition");
+if (ExpoSpeechRecognitionModule) {
+    const stop = ExpoSpeechRecognitionModule.stop;
+    const abort = ExpoSpeechRecognitionModule.abort;
+    ExpoSpeechRecognitionModule.abort = () => abort();
+    ExpoSpeechRecognitionModule.stop = () => stop();
+}
 //# sourceMappingURL=ExpoSpeechRecognitionModule.js.map
\ No newline at end of file