// Stub for shared/design-mode
// This is a placeholder to allow the dev server to run outside the full monorepo.

export type ResolvedElement = {
  element: Element;
};

export type StyleInfo = {
  className: string;
  styles: Record<string, string> | null;
};

export type GetStyleInfo = (resolved: ResolvedElement) => StyleInfo;

export function initDesignMode(_getStyleInfo: GetStyleInfo): () => void {
  // No-op stub: design mode is a platform feature not available outside the monorepo.
  return () => {};
}
