import type { User } from '@supabase/supabase-js';
import type { SpotifyAuthProfile } from '@/types/citizenship';

type Metadata = Record<string, unknown>;

function text(metadata: Metadata, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function profileFromUser(user: User): SpotifyAuthProfile {
  const identity = user.identities?.find((item) => item.provider === 'spotify')?.identity_data ?? {};
  const metadata = { ...identity, ...user.user_metadata } as Metadata;
  return {
    userId: user.id,
    displayName: text(metadata, ['display_name', 'full_name', 'name', 'user_name', 'preferred_username']),
    avatarUrl: text(metadata, ['avatar_url', 'picture', 'avatar'])
  };
}

export function spotifyOAuthOptions(origin: string) {
  return {
    provider: 'spotify' as const,
    options: { scopes: 'user-read-recently-played', redirectTo: origin }
  };
}

export function hasOAuthCallbackError(location: Pick<Location, 'search' | 'hash'>): boolean {
  const query = new URLSearchParams(location.search);
  const fragment = location.hash.startsWith('#') ? new URLSearchParams(location.hash.slice(1)) : new URLSearchParams();
  return query.has('error') || query.has('error_description') || fragment.has('error') || fragment.has('error_description');
}

export function cleanOAuthCallbackUrl(): void {
  const url = new URL(window.location.href);
  for (const key of ['code', 'error', 'error_code', 'error_description']) url.searchParams.delete(key);
  const fragment = url.hash.startsWith('#') ? new URLSearchParams(url.hash.slice(1)) : null;
  if (fragment && ['access_token', 'refresh_token', 'error', 'error_description'].some((key) => fragment.has(key))) url.hash = '';
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
}
