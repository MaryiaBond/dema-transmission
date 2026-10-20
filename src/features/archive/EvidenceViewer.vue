<script setup lang="ts">
import { computed } from 'vue';
import { archiveText } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';
import type { Evidence } from '@/types/archive';

defineProps<{ evidence: Evidence }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
</script>

<template>
  <span class="evidence-viewer-label">{{ ui.evidence }}</span>
  <strong>{{ archiveText(evidence.title, experience.selectedLanguage) }}</strong>
  <small>{{ archiveText(evidence.summary, experience.selectedLanguage) }}</small>
</template>
