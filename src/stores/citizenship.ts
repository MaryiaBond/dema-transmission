import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient, spotifyAuthConfigured } from '@/features/citizenship/supabase-client';
import { cleanOAuthCallbackUrl, hasOAuthCallbackError, profileFromUser, spotifyOAuthOptions } from '@/features/citizenship/spotify-auth';
import type { SpotifyAuthError, SpotifyAuthStatus } from '@/types/citizenship';

export const useCitizenshipStore = defineStore('citizenship', () => {
  const status = ref<SpotifyAuthStatus>('loading');
  const session = ref<Session | null>(null);
  const error = ref<SpotifyAuthError | null>(null);
  const busy = ref(false);
  const initialized = ref(false);
  const configured = spotifyAuthConfigured();
  let unsubscribe: (() => void) | null = null;

  const isAuthenticated = computed(() => status.value === 'authenticated' && Boolean(session.value));
  const profile = computed(() => session.value?.user ? profileFromUser(session.value.user) : null);

  function applySession(next: Session | null): void {
    session.value = next;
    status.value = next ? 'authenticated' : 'guest';
  }

  async function initialize(): Promise<void> {
    if (initialized.value) return;
    initialized.value = true;
    const callbackFailed = hasOAuthCallbackError(window.location);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        status.value = 'guest';
        error.value = configured ? 'session' : null;
        return;
      }
      const { data, error: sessionError } = await supabase.auth.getSession();
      applySession(data.session);
      if (sessionError) error.value = 'session';
      else if (callbackFailed) error.value = 'oauth';
      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
        applySession(next);
        if (next) error.value = null;
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    } catch {
      applySession(null);
      error.value = 'session';
    } finally {
      if (callbackFailed || new URLSearchParams(window.location.search).has('code')) cleanOAuthCallbackUrl();
    }
  }

  async function signInWithSpotify(): Promise<void> {
    busy.value = true; error.value = null;
    try {
      const supabase = getSupabaseClient();
      if (!supabase) { error.value = 'configuration'; return; }
      const { error: authError } = await supabase.auth.signInWithOAuth(spotifyOAuthOptions(window.location.origin));
      if (authError) error.value = 'oauth';
    } catch { error.value = 'oauth'; }
    finally { busy.value = false; }
  }

  async function signOut(): Promise<void> {
    busy.value = true; error.value = null;
    try {
      const supabase = getSupabaseClient();
      if (!supabase) { applySession(null); return; }
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) error.value = 'signout';
      else applySession(null);
    } catch { error.value = 'signout'; }
    finally { busy.value = false; }
  }

  function dispose(): void { unsubscribe?.(); unsubscribe = null; }

  return { status, session, profile, error, busy, configured, isAuthenticated, initialize, signInWithSpotify, signOut, dispose };
});
