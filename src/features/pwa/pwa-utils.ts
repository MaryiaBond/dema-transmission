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

export type InstallGuide = 'ios-safari' | 'safari' | 'firefox' | 'generic';

export function installGuide(): InstallGuide {
  if (isIosSafari()) return 'ios-safari';
  const userAgent = navigator.userAgent;
  if (/Firefox|FxiOS/i.test(userAgent)) return 'firefox';
  if (/Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(userAgent)) return 'safari';
  return 'generic';
}
