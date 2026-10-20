<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import EvidenceViewer from './EvidenceViewer.vue';
import { archiveConnections, archiveEvidence, archiveText, evidenceById } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useArchiveStore } from '@/stores/archive';
import { useExperienceStore } from '@/stores/experience';
import type { EvidenceId } from '@/types/archive';

const archive = useArchiveStore();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const selected = ref<EvidenceId[]>([]);
const message = ref('');
const solution = ref(archive.progress.caseSolutions[archive.currentCaseId] ?? '');
const caseEvidence = computed(() => archiveEvidence.filter((item) => item.caseId === archive.currentCaseId));
const discovered = computed(() => caseEvidence.value.filter((item) => archive.progress.discoveredEvidence.includes(item.id)));
const findings = computed(() => archiveConnections.filter((item) => item.caseId === archive.currentCaseId && archive.progress.confirmedConnections.includes(item.id)));
const sequence = computed(() => archive.progress.caseSequences[archive.currentCaseId] ?? []);

watch(() => archive.currentCaseId, () => { selected.value = []; message.value = ''; solution.value = archive.progress.caseSolutions[archive.currentCaseId] ?? ''; });
function toggle(id: EvidenceId): void {
  if (selected.value.includes(id)) selected.value = selected.value.filter((item) => item !== id);
  else selected.value = [...selected.value.slice(-1), id];
}
function connect(): void {
  if (selected.value.length !== 2) return;
  const result = archive.connectEvidence(selected.value[0]!, selected.value[1]!);
  message.value = result === 'correct' ? ui.value.correctConnection : result === 'known' ? ui.value.knownConnection : ui.value.wrongConnection;
  selected.value = [];
}
</script>

<template>
  <section class="investigation-board" data-testid="investigation-board">
    <div class="archive-panel-heading"><span>{{ ui.board }}</span><small>{{ ui.selectEvidence }}</small></div>
    <div class="evidence-field">
      <button v-for="item in discovered" :key="item.id" type="button" class="evidence-card" :data-evidence="item.id" :class="{ selected: selected.includes(item.id) }" :aria-pressed="selected.includes(item.id)" @click="toggle(item.id)">
        <EvidenceViewer :evidence="item" />
      </button>
      <div v-for="item in caseEvidence.filter((e) => !archive.progress.discoveredEvidence.includes(e.id))" :key="item.id" class="evidence-card evidence-card-locked" aria-hidden="true"><span>████</span><small>{{ ui.undiscovered }}</small></div>
    </div>
    <div class="connection-controls">
      <span>{{ ui.selectedEvidence }} // {{ selected.length }}/2</span>
      <button type="button" :disabled="selected.length !== 2" @click="connect">{{ ui.connect }}</button>
      <button type="button" :disabled="!selected.length" @click="selected = []">{{ ui.clear }}</button>
    </div>
    <p class="archive-live-message" role="status" aria-live="polite">{{ message }}</p>

    <div v-if="archive.currentCase.correctSequence" class="timeline-board" data-testid="timeline-board">
      <div class="archive-panel-heading"><span>{{ ui.timeline }}</span><small>{{ ui.timelineHint }}</small></div>
      <ol>
        <li v-for="(id, index) in sequence" :key="id">
          <span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ archiveText(evidenceById[id].title, experience.selectedLanguage) }}</strong>
          <div><button type="button" :disabled="index === 0" :aria-label="`${ui.moveUp}: ${archiveText(evidenceById[id].title, experience.selectedLanguage)}`" @click="archive.moveEvidence(id, -1)">↑</button><button type="button" :disabled="index === sequence.length - 1" :aria-label="`${ui.moveDown}: ${archiveText(evidenceById[id].title, experience.selectedLanguage)}`" @click="archive.moveEvidence(id, 1)">↓</button></div>
        </li>
      </ol>
    </div>

    <div v-if="archive.currentCaseId === 'case_003'" class="anagram-terminal" data-testid="anagram-terminal">
      <div class="archive-panel-heading"><span>{{ ui.anagramTitle }}</span><small>SCALED AND ICY</small></div>
      <p>{{ ui.anagramHint }}</p>
      <label><span class="visually-hidden">{{ ui.anagramTitle }}</span><input v-model="solution" type="text" autocomplete="off" spellcheck="false" :placeholder="ui.anagramPlaceholder" @input="archive.setCaseSolution(solution)"></label>
    </div>

    <div class="contradiction-log">
      <div class="archive-panel-heading"><span>{{ ui.findings }}</span><small>{{ findings.length }}/{{ archive.currentCase.requiredConnectionIds.length }}</small></div>
      <p v-if="!findings.length">{{ ui.noFindings }}</p>
      <article v-for="finding in findings" :key="finding.id"><i>✓</i><span>{{ archiveText(finding.finding, experience.selectedLanguage) }}</span></article>
    </div>
  </section>
</template>
