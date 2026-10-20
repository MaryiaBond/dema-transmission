<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SpotifyAuthPanel from './SpotifyAuthPanel.vue';
import { useCitizenshipStore } from '@/stores/citizenship';

const { t } = useI18n();
const citizenship = useCitizenshipStore();
</script>

<template>
  <section id="citizenship" class="citizenship-invite" aria-labelledby="citizenship-title">
    <div class="wrap citizenship-invite-inner reveal">
      <div class="citizenship-mark" aria-hidden="true">D//21</div>
      <div class="citizenship-content">
        <span class="pretitle">{{ t('citizenship.inviteLabel') }}</span>
        <h2 id="citizenship-title">{{ t('citizenship.inviteTitle') }}</h2>
        <p>{{ t('citizenship.inviteCopy') }}</p>
        <button v-if="!citizenship.isAuthenticated" class="citizenship-action" type="button" :disabled="citizenship.busy || !citizenship.configured" @click="citizenship.signInWithSpotify">
          {{ citizenship.busy ? t('citizenship.working') : t('citizenship.obtain') }} <span aria-hidden="true">↗</span>
        </button>
        <p v-if="!citizenship.configured" class="citizenship-notice" data-testid="spotify-auth-unavailable">{{ t('citizenship.unavailable') }}</p>
        <p v-else-if="citizenship.error" class="citizenship-error-inline" role="alert">{{ t(`citizenship.${citizenship.error}Error`) }}</p>
        <SpotifyAuthPanel v-if="citizenship.profile" :profile="citizenship.profile" :busy="citizenship.busy" @sign-out="citizenship.signOut" />
      </div>
    </div>
  </section>
</template>
