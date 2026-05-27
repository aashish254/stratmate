diff --git a/node_modules/@expo/cli/build/src/start/server/middleware/ExpoGoManifestHandlerMiddleware.js b/node_modules/@expo/cli/build/src/start/server/middleware/ExpoGoManifestHandlerMiddleware.js
index b5cba1b..2cbb2a5 100644
--- a/node_modules/@expo/cli/build/src/start/server/middleware/ExpoGoManifestHandlerMiddleware.js
+++ b/node_modules/@expo/cli/build/src/start/server/middleware/ExpoGoManifestHandlerMiddleware.js
@@ -143,7 +143,9 @@ class ExpoGoManifestHandlerMiddleware extends _ManifestMiddleware.ManifestMiddle
             codeSigningInfo
         });
         const expoUpdatesManifest = {
-            id: _crypto().default.randomUUID(),
+            id: _crypto().default.randomUUID({
+                disableEntropyCache: true
+            }),
             createdAt: new Date().toISOString(),
             runtimeVersion,
             launchAsset: {
