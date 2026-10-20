<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { SpotifyAuthProfile } from '@/types/citizenship';

defineProps<{ profile: SpotifyAuthProfile; busy: boolean }>();
defineEmits<{ signOut: [] }>();
const { t } = useI18n();
</script>

<template>
  <article class="spotify-auth-panel" data-testid="spotify-auth-panel">
    <header><span>{{ t('citizenship.panelTitle') }}</span><strong aria-hidden="true">|-/</strong></header>
    <div class="spotify-auth-profile">
      <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="t('citizenship.avatarAlt', { name: profile.displayName ?? 'Spotify' })">
      <div>
        <small v-if="profile.displayName">{{ t('citizenship.displayName') }}</small>
        <h3 v-if="profile.displayName">{{ profile.displayName }}</h3>
        <dl>
          <div><dt>{{ t('citizenship.userId') }}</dt><dd><code>{{ profile.userId }}</code></dd></div>
          <div><dt>{{ t('citizenship.authState') }}</dt><dd>{{ t('citizenship.authenticated') }}</dd></div>
        </dl>
      </div>
    </div>
    <button class="spotify-signout" type="button" :disabled="busy" @click="$emit('signOut')">{{ t('citizenship.signOut') }}</button>
  </article>
</template>
