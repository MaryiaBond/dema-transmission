const DISMISS_KEY = 'the-outside:pwa-install-dismissed:v1';

export function isStandaloneDisplay(): boolean {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return navigatorWithStandalone.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export function isIosSafari(): boolean {
  const touchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || touchMac;
  const thirdParty = /CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
  return ios && !thirdParty;
}

export function installPromptDismissed(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

export function rememberInstallDismissal(): void {
  try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* Installation remains optional when storage is unavailable. */ }
}
