<script setup lang="ts">
import { computed } from 'vue';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';
import type { CaseProgressState } from '@/types/archive';

const props = defineProps<{ progress: CaseProgressState; sticky?: boolean }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const statusLabel = computed(() => ({
  not_started: ui.value.caseNotStarted,
  in_progress: ui.value.caseInProgress,
  completed: ui.value.caseCompleted
}[props.progress.status]));
</script>

<template>
  <section class="case-progress-checklist" :class="{ 'is-sticky': sticky, 'is-ready': progress.ready, 'is-complete': progress.status === 'completed' }" data-testid="case-progress-checklist">
    <header>
      <div><small>{{ ui.readiness }}</small><strong>{{ progress.percentage }}%</strong></div>
      <span :data-status="progress.status">{{ statusLabel }}</span>
    </header>
    <div class="case-progress-meter" aria-hidden="true"><i :style="{ width: `${progress.percentage}%` }"></i></div>
    <ul>
      <li :class="{ done: progress.documents.done }"><span>{{ ui.documentsProgress }}</span><strong>{{ progress.documents.completed }}/{{ progress.documents.total }}</strong></li>
      <li :class="{ done: progress.connections.done }"><span>{{ ui.connectionsProgress }}</span><strong>{{ progress.connections.completed }}/{{ progress.connections.total }}</strong></li>
      <li :class="{ done: progress.records.done }"><span>{{ ui.recordsProgress }}</span><strong>{{ progress.records.completed }}/{{ progress.records.total }}</strong></li>
      <li v-if="progress.timeline !== null" :class="{ done: progress.timeline }"><span>{{ ui.timelineProgress }}</span><strong>{{ progress.timeline ? ui.verified : ui.pending }}</strong></li>
      <li v-if="progress.cipher !== null" :class="{ done: progress.cipher }"><span>{{ ui.cipherProgress }}</span><strong>{{ progress.cipher ? ui.verified : ui.pending }}</strong></li>
    </ul>
  </section>
</template>
