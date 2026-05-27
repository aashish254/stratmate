const noop = () => {};
const returnInput = (value) => value;
const returnNull = () => null;

class Scope {
  setTag() {
    return this;
  }
  setTags() {
    return this;
  }
  setContext() {
    return this;
  }
  setExtra() {
    return this;
  }
  setExtras() {
    return this;
  }
  setUser() {
    return this;
  }
}

const scope = new Scope();

exports.Scope = Scope;
exports.addBreadcrumb = noop;
exports.captureEvent = returnNull;
exports.captureException = returnNull;
exports.captureMessage = returnNull;
exports.close = () => Promise.resolve(true);
exports.configureScope = (callback) => callback?.(scope);
exports.getCurrentScope = () => scope;
exports.init = noop;
exports.reactNavigationIntegration = () => ({ name: 'reactNavigationIntegration' });
exports.setContext = noop;
exports.setExtra = noop;
exports.setExtras = noop;
exports.setTag = noop;
exports.setTags = noop;
exports.setUser = noop;
exports.startSpan = (_options, callback) => callback?.();
exports.startSpanManual = (_options, callback) => callback?.({ end: noop });
exports.withScope = (callback) => callback?.(scope);
exports.wrap = returnInput;
