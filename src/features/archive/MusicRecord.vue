<script setup lang="ts">
import { computed } from 'vue';
import { archiveText } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';
import type { MusicInvestigation, MusicRecord } from '@/types/archive';

defineProps<{ record: MusicRecord; state?: MusicInvestigation | undefined }>();
const emit = defineEmits<{ visit: []; study: [] }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
</script>

<template>
  <article class="archive-music-record">
    <div><span>{{ record.album }}</span><h3>{{ record.title }}</h3><p>{{ archiveText(record.significance, experience.selectedLanguage) }}</p><small>{{ state?.visitedExternalLink ? ui.openedLink : ui.notOpened }}</small></div>
    <nav :aria-label="record.title">
      <a :href="record.youtube" target="_blank" rel="noopener noreferrer" @click="emit('visit')">{{ ui.youtube }} ↗</a>
      <a v-if="record.spotify" :href="record.spotify" target="_blank" rel="noopener noreferrer" @click="emit('visit')">{{ ui.spotify }} ↗</a>
      <a v-if="record.yandex" :href="record.yandex" target="_blank" rel="noopener noreferrer" @click="emit('visit')">{{ ui.yandex }} ↗</a>
    </nav>
    <button type="button" :class="{ studied: state?.markedAsStudied }" :disabled="state?.markedAsStudied" @click="emit('study')">{{ state?.markedAsStudied ? `✓ ${ui.studied}` : ui.markStudied }}</button>
  </article>
</template>
