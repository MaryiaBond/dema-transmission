import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import type { Session } from '@supabase/supabase-js';
import SpotifyAuthPanel from '@/components/citizenship/SpotifyAuthPanel.vue';
import { citizenshipLocales } from '@/content/citizenship-locales';
import { i18n } from '@/app/i18n';
import { hasOAuthCallbackError, profileFromUser, spotifyOAuthOptions } from '@/features/citizenship/spotify-auth';

const mocked = vi.hoisted(() => ({ client: null as any }));
vi.mock('@/features/citizenship/supabase-client', () => ({
  getSupabaseClient: () => mocked.client,
  spotifyAuthConfigured: () => Boolean(mocked.client)
}));

import { useCitizenshipStore } from '@/stores/citizenship';

function session(): Session {
  return {
    access_token: 'not-a-real-token', token_type: 'bearer', expires_in: 3600, expires_at: 1,
    refresh_token: 'not-a-real-refresh-token',
    user: {
      id: '12345678-0000-4000-8000-000000000021', app_metadata: { provider: 'spotify' },
      user_metadata: { display_name: 'Test Listener', avatar_url: 'https://example.com/avatar.jpg' },
      aud: 'authenticated', created_at: '2026-10-19T00:00:00Z'
    }
  } as Session;
}

function authClient(restored: Session | null = null) {
  const unsubscribe = vi.fn();
  const onAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe } } }));
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: restored }, error: null }),
      onAuthStateChange,
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { provider: 'spotify', url: 'https://accounts.spotify.test/' }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    unsubscribe
  };
}

describe('Spotify OAuth smoke flow', () => {
  beforeEach(() => { setActivePinia(createPinia()); mocked.client = null; history.replaceState(null, '', '/'); });
  afterEach(() => vi.clearAllMocks());

  it('uses the exact provider, scope, and current origin', () => {
    expect(spotifyOAuthOptions('https://outside.example')).toEqual({ provider: 'spotify', options: { scopes: 'user-read-recently-played', redirectTo: 'https://outside.example' } });
  });

  it('stays in guest mode without keys and does not throw', async () => {
    const store = useCitizenshipStore();
    await expect(store.initialize()).resolves.toBeUndefined();
    expect(store.status).toBe('guest');
    expect(store.error).toBeNull();
  });

  it('starts Spotify OAuth through Supabase', async () => {
    const client = authClient(); mocked.client = client;
    const store = useCitizenshipStore();
    await store.signInWithSpotify();
    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'spotify', options: { scopes: 'user-read-recently-played', redirectTo: window.location.origin } });
    expect(store.error).toBeNull();
  });

  it('surfaces a provider-start error without breaking guest access', async () => {
    const client = authClient();
    client.auth.signInWithOAuth.mockResolvedValueOnce({ data: null, error: new Error('provider unavailable') });
    mocked.client = client;
    const store = useCitizenshipStore();
    await store.initialize();
    await expect(store.signInWithSpotify()).resolves.toBeUndefined();
    expect(store.error).toBe('oauth');
    expect(store.status).toBe('guest');
  });

  it('restores a session and maps optional Spotify metadata without email', async () => {
    const restored = session(); mocked.client = authClient(restored);
    const store = useCitizenshipStore();
    await store.initialize();
    expect(store.status).toBe('authenticated');
    expect(store.profile).toEqual({ userId: restored.user.id, displayName: 'Test Listener', avatarUrl: 'https://example.com/avatar.jpg' });
    expect(restored.user.email).toBeUndefined();
  });

  it('signs out and returns to guest state', async () => {
    const client = authClient(session()); mocked.client = client;
    const store = useCitizenshipStore(); await store.initialize(); await store.signOut();
    expect(client.auth.signOut).toHaveBeenCalledOnce();
    expect(store.status).toBe('guest');
    expect(store.profile).toBeNull();
  });

  it('falls back to guest mode when session restoration fails', async () => {
    const client = authClient();
    client.auth.getSession.mockRejectedValueOnce(new Error('storage unavailable'));
    mocked.client = client;
    const store = useCitizenshipStore();
    await expect(store.initialize()).resolves.toBeUndefined();
    expect(store.status).toBe('guest');
    expect(store.error).toBe('session');
  });

  it('keeps the authenticated panel when sign-out fails', async () => {
    const client = authClient(session());
    client.auth.signOut.mockResolvedValueOnce({ error: new Error('network unavailable') });
    mocked.client = client;
    const store = useCitizenshipStore();
    await store.initialize();
    await expect(store.signOut()).resolves.toBeUndefined();
    expect(store.status).toBe('authenticated');
    expect(store.error).toBe('signout');
  });

  it('recognizes callback errors without exposing callback values', async () => {
    history.replaceState(null, '', '/?error=access_denied&error_description=denied');
    expect(hasOAuthCallbackError(window.location)).toBe(true);
    mocked.client = authClient();
    const store = useCitizenshipStore(); await store.initialize();
    expect(store.error).toBe('oauth');
    expect(window.location.search).toBe('');
  });

  it('maps an identity profile when user metadata is sparse', () => {
    const restored = session();
    restored.user.user_metadata = {};
    restored.user.identities = [{ id: 'spotify-id', user_id: restored.user.id, identity_id: 'spotify-id', provider: 'spotify', identity_data: { name: 'Identity Name' }, created_at: '', updated_at: '', last_sign_in_at: '' }];
    expect(profileFromUser(restored.user)).toMatchObject({ displayName: 'Identity Name', avatarUrl: null });
  });
});

describe('Spotify auth presentation', () => {
  let host: HTMLDivElement;
  beforeEach(() => { host = document.createElement('div'); document.body.append(host); });
  afterEach(() => host.remove());

  it('renders the minimal authenticated panel without requiring email', () => {
    const app = createApp(SpotifyAuthPanel, { profile: { userId: 'user-21', displayName: null, avatarUrl: null }, busy: false });
    app.use(i18n); app.mount(host);
    expect(host.textContent).toContain('user-21');
    expect(host.textContent).toContain('ПОДТВЕРЖДЕНА');
    expect(host.textContent).not.toContain('@');
    app.unmount();
  });

  it('keeps all four locale dictionaries complete', () => {
    const keys = Object.keys(citizenshipLocales.ru).sort();
    for (const language of ['be', 'en', 'es'] as const) expect(Object.keys(citizenshipLocales[language]).sort()).toEqual(keys);
  });
});
