/**
 * @file setup.ts
 * @description Vitest and JSDOM global environment setup for testing.
 * Polyfills canvas context and matchMedia required by axe-core and UI components.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Polyfill HTMLCanvasElement.prototype.getContext to silence JSDOM canvas warnings during axe-core audits
if (typeof window !== 'undefined') {
  if (!window.HTMLCanvasElement.prototype.getContext) {
    window.HTMLCanvasElement.prototype.getContext = (() =>
      ({
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (_x: number, _y: number, w: number, h: number) => ({
          data: new Array(w * h * 4).fill(0),
          width: w,
          height: h,
          colorSpace: 'srgb',
        }),
        putImageData: () => {},
        createImageData: () => ({ data: [], width: 0, height: 0, colorSpace: 'srgb' }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
      }) as unknown as CanvasRenderingContext2D) as unknown as typeof window.HTMLCanvasElement.prototype.getContext;
  }

  // Polyfill matchMedia for motion/responsive queries
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }
}
