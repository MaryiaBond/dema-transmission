export type SpotifyAuthStatus = 'loading' | 'guest' | 'authenticated';
export type SpotifyAuthError = 'configuration' | 'oauth' | 'session' | 'signout';

export interface SpotifyAuthProfile {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface CitizenshipLocale {
  inviteLabel: string;
  inviteTitle: string;
  inviteCopy: string;
  obtain: string;
  working: string;
  panelTitle: string;
  displayName: string;
  userId: string;
  authState: string;
  authenticated: string;
  signOut: string;
  unavailable: string;
  oauthError: string;
  sessionError: string;
  signoutError: string;
  avatarAlt: string;
}
