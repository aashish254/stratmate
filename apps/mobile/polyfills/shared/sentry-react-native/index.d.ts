export class Scope {
  setTag(...args: unknown[]): this;
  setTags(...args: unknown[]): this;
  setContext(...args: unknown[]): this;
  setExtra(...args: unknown[]): this;
  setExtras(...args: unknown[]): this;
  setUser(...args: unknown[]): this;
}

export function addBreadcrumb(...args: unknown[]): void;
export function captureEvent(...args: unknown[]): null;
export function captureException(...args: unknown[]): null;
export function captureMessage(...args: unknown[]): null;
export function close(): Promise<boolean>;
export function configureScope(callback?: (scope: Scope) => void): void;
export function getCurrentScope(): Scope;
export function init(...args: unknown[]): void;
export function reactNavigationIntegration(): { name: string };
export function setContext(...args: unknown[]): void;
export function setExtra(...args: unknown[]): void;
export function setExtras(...args: unknown[]): void;
export function setTag(...args: unknown[]): void;
export function setTags(...args: unknown[]): void;
export function setUser(...args: unknown[]): void;
export function startSpan<T>(options: unknown, callback?: () => T): T | undefined;
export function startSpanManual<T>(
  options: unknown,
  callback?: (span: { end(): void }) => T,
): T | undefined;
export function withScope<T>(callback?: (scope: Scope) => T): T | undefined;
export function wrap<T>(value: T): T;
