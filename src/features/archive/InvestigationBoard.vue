<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties, ComponentPublicInstance } from 'vue';
import Sortable from 'sortablejs';
import type { SortableEvent } from 'sortablejs';
import DemaAlert from './DemaAlert.vue';
import EvidenceViewer from './EvidenceViewer.vue';
import { archiveConnections, archiveEvidence, archiveText, documentById, evidenceById } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { getDiscoveredEvidenceIds } from './archive-engine';
import { useArchiveStore } from '@/stores/archive';
import { useExperienceStore } from '@/stores/experience';
import type { EvidenceId } from '@/types/archive';

const archive = useArchiveStore();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const selected = ref<EvidenceId[]>([]);
const message = ref('');
const messageKind = ref<'danger' | 'info' | 'success'>('info');
const messageNote = ref('');
const messageTitle = ref('');
const feedback = ref<{ kind: 'wrong' | 'correct'; evidence: [EvidenceId, EvidenceId] } | null>(null);
const connectionLineStyle = ref<CSSProperties | null>(null);
const evidenceField = ref<HTMLElement | null>(null);
const evidenceCards = new Map<EvidenceId, HTMLElement>();
let feedbackTimer: number | undefined;
const timelineList = ref<HTMLOListElement | null>(null);
const timelineStatus = ref('');
const timelineMoved = ref(false);
const keyboardGrabbedId = ref<EvidenceId | null>(null);
const keyboardMoved = ref(false);
let sortable: Sortable | null = null;
let timelineStatusTimer: number | undefined;
let reducedMotionQuery: MediaQueryList | null = null;
const solution = ref(archive.progress.caseSolutions[archive.currentCaseId] ?? '');
const caseEvidence = computed(() => archiveEvidence.filter((item) => item.caseId === archive.currentCaseId));
const discoveredEvidenceIds = computed(() => new Set(getDiscoveredEvidenceIds(archive.progress)));
const findings = computed(() => archiveConnections.filter((item) => item.caseId === archive.currentCaseId && archive.progress.confirmedConnections.includes(item.id)));
const sequence = computed(() => archive.progress.caseSequences[archive.currentCaseId] ?? []);

function clearVisualFeedback(): void {
  if (feedbackTimer !== undefined) window.clearTimeout(feedbackTimer);
  feedbackTimer = undefined;
  feedback.value = null;
  connectionLineStyle.value = null;
}
function resetBoardFeedback(): void {
  clearVisualFeedback();
  selected.value = [];
  message.value = '';
  messageNote.value = '';
  messageTitle.value = '';
  messageKind.value = 'info';
}
watch(() => archive.currentCaseId, () => {
  resetBoardFeedback();
  clearTimelineInteraction();
  solution.value = archive.progress.caseSolutions[archive.currentCaseId] ?? '';
  void nextTick(initializeTimelineSortable);
});
onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotionQuery.addEventListener('change', initializeTimelineSortable);
  void nextTick(initializeTimelineSortable);
});
onBeforeUnmount(() => {
  clearVisualFeedback();
  clearTimelineInteraction();
  reducedMotionQuery?.removeEventListener('change', initializeTimelineSortable);
});

function setEvidenceCard(id: EvidenceId, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof HTMLElement) evidenceCards.set(id, element);
  else evidenceCards.delete(id);
}
function updateConnectionLine([firstId, secondId]: [EvidenceId, EvidenceId]): void {
  const field = evidenceField.value;
  const first = evidenceCards.get(firstId);
  const second = evidenceCards.get(secondId);
  if (!field || !first || !second) return;
  const fieldRect = field.getBoundingClientRect();
  const firstRect = first.getBoundingClientRect();
  const secondRect = second.getBoundingClientRect();
  const startX = firstRect.left - fieldRect.left + firstRect.width / 2;
  const startY = firstRect.top - fieldRect.top + firstRect.height / 2;
  const endX = secondRect.left - fieldRect.left + secondRect.width / 2;
  const endY = secondRect.top - fieldRect.top + secondRect.height / 2;
  connectionLineStyle.value = {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${Math.hypot(endX - startX, endY - startY)}px`,
    transform: `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`
  };
}
function showVisualFeedback(kind: 'wrong' | 'correct', evidence: [EvidenceId, EvidenceId]): void {
  clearVisualFeedback();
  feedback.value = { kind, evidence };
  if (kind === 'correct') void nextTick(() => updateConnectionLine(evidence));
  feedbackTimer = window.setTimeout(clearVisualFeedback, kind === 'wrong' ? 480 : 650);
}
function toggle(id: EvidenceId): void {
  if (selected.value.includes(id)) selected.value = selected.value.filter((item) => item !== id);
  else selected.value = [...selected.value.slice(-1), id];
}
function connect(): void {
  if (selected.value.length !== 2) return;
  const evidence: [EvidenceId, EvidenceId] = [selected.value[0]!, selected.value[1]!];
  const result = archive.connectEvidence(evidence[0], evidence[1]);
  message.value = result === 'correct' ? ui.value.signalRestoredMessage : result === 'known' ? ui.value.knownConnection : ui.value.interferenceMessage;
  messageTitle.value = result === 'correct' ? ui.value.signalRestoredTitle : result === 'known' ? ui.value.systemNote : ui.value.interferenceTitle;
  messageNote.value = result === 'wrong' ? ui.value.interferenceNote : '';
  messageKind.value = result === 'correct' ? 'success' : result === 'known' ? 'info' : 'danger';
  if (result !== 'known') showVisualFeedback(result, evidence);
  else clearVisualFeedback();
  selected.value = [];
}

function clearTimelineStatus(): void {
  if (timelineStatusTimer !== undefined) window.clearTimeout(timelineStatusTimer);
  timelineStatusTimer = undefined;
  timelineStatus.value = '';
}
function announceTimelineUpdate(): void {
  clearTimelineStatus();
  timelineMoved.value = true;
  timelineStatus.value = ui.value.timelineUpdated;
  timelineStatusTimer = window.setTimeout(clearTimelineStatus, 1800);
}
function clearTimelineInteraction(): void {
  sortable?.destroy();
  sortable = null;
  clearTimelineStatus();
  keyboardGrabbedId.value = null;
  keyboardMoved.value = false;
}
function commitTimelineMove(id: EvidenceId, toIndex: number, announce = true): boolean {
  const fromIndex = sequence.value.indexOf(id);
  if (fromIndex < 0 || fromIndex === toIndex) return false;
  archive.moveEvidenceToIndex(id, toIndex);
  if (announce) announceTimelineUpdate();
  return true;
}
function handleTimelineDrop(event: SortableEvent): void {
  const id = event.item.dataset.evidence as EvidenceId | undefined;
  if (!id || event.newIndex === undefined) return;
  commitTimelineMove(id, event.newIndex);
}
function initializeTimelineSortable(): void {
  sortable?.destroy();
  sortable = null;
  if (!timelineList.value) return;
  sortable = Sortable.create(timelineList.value, {
    animation: reducedMotionQuery?.matches ? 0 : 200,
    handle: '.timeline-drag-handle',
    draggable: '.timeline-card',
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 4,
    scroll: false,
    delay: 180,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,
    swapThreshold: 0.65,
    ghostClass: 'timeline-drop-target',
    chosenClass: 'timeline-chosen',
    dragClass: 'timeline-dragging',
    onEnd: handleTimelineDrop
  });
}
function handleTimelineKeydown(event: KeyboardEvent, id: EvidenceId): void {
  const index = sequence.value.indexOf(id);
  if (index < 0) return;
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    if (keyboardGrabbedId.value === id) {
      keyboardGrabbedId.value = null;
      if (keyboardMoved.value) announceTimelineUpdate();
      keyboardMoved.value = false;
    } else {
      keyboardGrabbedId.value = id;
      keyboardMoved.value = false;
    }
    return;
  }
  if (keyboardGrabbedId.value !== id) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    keyboardGrabbedId.value = null;
    keyboardMoved.value = false;
    return;
  }
  const toIndex = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? sequence.value.length - 1 : index;
  if (toIndex === index) return;
  event.preventDefault();
  if (commitTimelineMove(id, toIndex, false)) keyboardMoved.value = true;
}
</script>

<template>
  <section class="investigation-board" data-testid="investigation-board" :data-feedback="feedback?.kind ?? 'idle'">
    <div class="archive-panel-heading"><span>{{ ui.board }}</span><small>{{ ui.selectEvidence }}</small></div>
    <div ref="evidenceField" class="evidence-field">
      <span v-if="feedback?.kind === 'correct' && connectionLineStyle" class="bandito-link" :style="connectionLineStyle" aria-hidden="true"><i></i></span>
      <template v-for="item in caseEvidence" :key="item.id">
        <button v-if="discoveredEvidenceIds.has(item.id)" :ref="(element) => setEvidenceCard(item.id, element)" type="button" class="evidence-card" :data-evidence="item.id" :data-connection-state="feedback?.evidence.includes(item.id) ? feedback.kind : undefined" :class="{ selected: selected.includes(item.id), 'connection-rejected': feedback?.kind === 'wrong' && feedback.evidence.includes(item.id), 'connection-confirmed': feedback?.kind === 'correct' && feedback.evidence.includes(item.id) }" :aria-pressed="selected.includes(item.id)" @click="toggle(item.id)">
          <EvidenceViewer :evidence="item" />
        </button>
        <div v-else class="evidence-card evidence-card-locked" aria-hidden="true"><span>████</span><small>{{ ui.undiscovered }}</small></div>
      </template>
    </div>
    <div class="connection-controls">
      <span>{{ ui.selectedEvidence }} // {{ selected.length }}/2</span>
      <button type="button" :disabled="selected.length !== 2" @click="connect">{{ ui.connect }}</button>
      <button type="button" :disabled="!selected.length" @click="selected = []">{{ ui.clear }}</button>
    </div>
    <div v-if="message" class="connection-feedback" :class="`connection-feedback-${messageKind}`" aria-live="polite">
      <DemaAlert :variant="messageKind" :title="messageTitle" :message="message" compact />
      <p v-if="messageNote" class="connection-feedback-note">{{ messageNote }}</p>
    </div>

    <div v-if="archive.currentCase.correctSequence" class="timeline-board" data-testid="timeline-board">
      <div class="archive-panel-heading"><span>{{ ui.timeline }}</span><small id="timeline-sort-hint" :class="{ 'is-subdued': timelineMoved }">{{ ui.timelineHint }}</small></div>
      <Transition name="timeline-toast">
        <p v-if="timelineStatus" class="timeline-status" role="status" aria-live="polite">{{ timelineStatus }}</p>
      </Transition>
      <ol ref="timelineList" class="timeline-sortable" :aria-label="ui.timeline">
        <li v-for="(id, index) in sequence" :key="id" class="timeline-card" :class="{ 'is-keyboard-grabbed': keyboardGrabbedId === id }" :data-evidence="id">
          <span class="timeline-position">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="timeline-event"><strong>{{ archiveText(evidenceById[id].title, experience.selectedLanguage) }}</strong><time>{{ documentById[evidenceById[id].documentId].date }}</time></div>
          <button type="button" class="timeline-drag-handle" :aria-label="`${ui.timelineHandle}: ${archiveText(evidenceById[id].title, experience.selectedLanguage)}`" aria-describedby="timeline-sort-hint" :aria-pressed="keyboardGrabbedId === id" @keydown="handleTimelineKeydown($event, id)"><span aria-hidden="true">⠿</span></button>
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
