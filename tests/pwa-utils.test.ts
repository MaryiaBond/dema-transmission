import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installGuide, isIosSafari, isStandaloneDisplay } from '@/features/pwa/pwa-utils';

describe('PWA install behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: false });
    Object.defineProperty(navigator, 'platform', { configurable: true, value: 'MacIntel' });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 Chrome/140 Safari/537.36' });
  });

  it('recognizes installed display mode', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(isStandaloneDisplay()).toBe(true);
  });

  it('shows manual guidance only for Safari on iOS and iPadOS', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 Version/18.0 Mobile/15E148 Safari/604.1' });
    expect(isIosSafari()).toBe(true);
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 CriOS/140 Mobile/15E148 Safari/604.1' });
    expect(isIosSafari()).toBe(false);
  });

  it('selects browser-specific fallback installation guidance', () => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 Firefox/140' });
    expect(installGuide()).toBe('firefox');
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 Version/18.0 Safari/605.1.15' });
    expect(installGuide()).toBe('safari');
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 Chrome/140 Safari/537.36' });
    expect(installGuide()).toBe('generic');
  });
});
