diff --git a/node_modules/metro-runtime/src/modules/HMRClient.js b/node_modules/metro-runtime/src/modules/HMRClient.js
index 3e2652d..d51a046 100644
--- a/node_modules/metro-runtime/src/modules/HMRClient.js
+++ b/node_modules/metro-runtime/src/modules/HMRClient.js
@@ -22,6 +22,11 @@ class HMRClient extends EventEmitter {
     this._ws = new global.WebSocket(url);
     this._ws.onopen = () => {
       this._state = "open";
+      this._keepaliveInterval = setInterval(() => {
+        if (this._ws.readyState === WebSocket.OPEN) {
+          this._ws.send(JSON.stringify({ type: '__keepalive__' }));
+        }
+      }, 30_000);
       this.emit("open");
       this._flushQueue();
     };
@@ -30,6 +35,7 @@ class HMRClient extends EventEmitter {
     };
     this._ws.onclose = (closeEvent) => {
       this._state = "closed";
+      clearInterval(this._keepaliveInterval);
       this.emit("close", closeEvent);
     };
     this._ws.onmessage = (message) => {
