/**
 * Web design mode — extracts Tailwind className and computed styles
 * from DOM elements.
 */

import { type GetStyleInfo, initDesignMode } from '../../../../shared/design-mode';

// Registers the <hex-color-picker> custom element used by the design toolbar's
// background-color dropdown. Loaded conditionally because the package executes
// `customElements.define()` at module-eval time, which crashes during SSR.
if (typeof window !== 'undefined') {
  void import('vanilla-colorful/hex-color-picker.js');
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return rgb;
  const r = Number.parseInt(match[1]!, 10);
  const g = Number.parseInt(match[2]!, 10);
  const b = Number.parseInt(match[3]!, 10);
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function extractComputedStyles(el: HTMLElement): Record<string, string> {
  const cs = getComputedStyle(el);
  return {
    fontSize: cs.fontSize,
    fontFamily: cs.fontFamily,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    textAlign: cs.textAlign,
    textDecoration: cs.textDecorationLine,
    fontStyle: cs.fontStyle,
    textColor: rgbToHex(cs.color),
    backgroundColor: rgbToHex(cs.backgroundColor),
    marginTop: cs.marginTop,
    marginRight: cs.marginRight,
    marginBottom: cs.marginBottom,
    marginLeft: cs.marginLeft,
    paddingTop: cs.paddingTop,
    paddingRight: cs.paddingRight,
    paddingBottom: cs.paddingBottom,
    paddingLeft: cs.paddingLeft,
    width: cs.width,
    height: cs.height,
    minWidth: cs.minWidth,
    minHeight: cs.minHeight,
    maxWidth: cs.maxWidth,
    maxHeight: cs.maxHeight,
    borderWidth: cs.borderTopWidth,
    borderColor: rgbToHex(cs.borderTopColor),
    borderRadius: cs.borderTopLeftRadius,
    display: cs.display,
    flexDirection: cs.flexDirection,
    justifyContent: cs.justifyContent,
    alignItems: cs.alignItems,
    gap: cs.gap,
    objectFit: cs.objectFit,
    objectPosition: cs.objectPosition,
  };
}

const getStyleInfo: GetStyleInfo = (resolved) => {
  const el = resolved.element;
  const className = el instanceof HTMLElement ? el.className : '';
  const styles = el instanceof HTMLElement ? extractComputedStyles(el) : null;
  return { className, styles };
};

const reselect = initDesignMode(getStyleInfo);

// After Vite HMR replaces DOM nodes, re-find the selected element
// so the design panel stays in sync.
if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => {
    reselect();
  });
}
