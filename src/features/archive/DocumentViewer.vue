<script setup lang="ts">
import { computed } from 'vue';
import { archiveText } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';
import type { ArchiveDocument, SourceCategory } from '@/types/archive';

const props = defineProps<{ document: ArchiveDocument }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const categoryLabel = (category: SourceCategory) => ({ historical_fact: ui.value.sourceHistorical, confirmed_canon: ui.value.sourceCanon, game_fiction: ui.value.sourceFiction }[category]);
</script>

<template>
  <article class="archive-document-viewer" data-testid="document-viewer">
    <div class="archive-document-stamp">{{ document.date }}</div>
    <span class="archive-source-kind" :data-kind="document.category">{{ categoryLabel(document.category) }}</span>
    <h3>{{ archiveText(document.title, experience.selectedLanguage) }}</h3>
    <p>{{ archiveText(document.body, experience.selectedLanguage) }}</p>
    <a v-if="document.source" :href="document.source.url" target="_blank" rel="noopener noreferrer">{{ ui.source }} // {{ document.source.label }} <span aria-hidden="true">↗</span></a>
    <div class="archive-document-code">{{ props.document.id.toUpperCase() }}</div>
  </article>
</template>
