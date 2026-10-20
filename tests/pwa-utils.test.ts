import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installPromptDismissed, isIosSafari, isStandaloneDisplay, rememberInstallDismissal } from '@/features/pwa/pwa-utils';

describe('PWA install behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: false });
    Object.defineProperty(navigator, 'platform', { configurable: true, value: 'MacIntel' });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 Chrome/140 Safari/537.36' });
  });

  it('remembers a dismissed prompt without depending on authentication', () => {
    expect(installPromptDismissed()).toBe(false);
    rememberInstallDismissal();
    expect(installPromptDismissed()).toBe(true);
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
});
