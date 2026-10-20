<script setup lang="ts">
import { getLocaleContent } from '@/content/locales';
import { musicResources } from '@/content/music';
import { useExperienceStore } from '@/stores/experience';

const props = withDefaults(defineProps<{ album: string; compact?: boolean }>(), { compact: false });
const store = useExperienceStore();
const release = musicResources[props.album];
</script>

<template>
  <template v-if="release">
    <a v-if="release.spotify" :class="['music-link', { 'music-link-compact': compact }]" data-service="spotify" :href="release.spotify" target="_blank" rel="noopener noreferrer" :aria-label="getLocaleContent(store.selectedLanguage).ui.albumSpotify.replace('{album}', release.title)">
      <img class="service-icon" src="/assets/spotify.svg" alt="" aria-hidden="true"><span class="music-link-label">{{ getLocaleContent(store.selectedLanguage).ui.spotifyName }}</span><span aria-hidden="true">↗</span>
    </a>
    <a v-if="release.yandex" :class="['music-link', { 'music-link-compact': compact }]" data-service="yandex" :href="release.yandex" target="_blank" rel="noopener noreferrer" :aria-label="getLocaleContent(store.selectedLanguage).ui.albumYandex.replace('{album}', release.title)">
      <img class="service-icon" src="/assets/yandex-music.svg" alt="" aria-hidden="true"><span class="music-link-label">{{ getLocaleContent(store.selectedLanguage).ui.yandexName }}</span><span aria-hidden="true">↗</span>
    </a>
  </template>
</template>
