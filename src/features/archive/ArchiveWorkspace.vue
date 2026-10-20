<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AchievementPassport from './AchievementPassport.vue';
import AchievementToast from './AchievementToast.vue';
import ArchiveOnboarding from './ArchiveOnboarding.vue';
import ComplianceAssessment from './ComplianceAssessment.vue';
import DocumentViewer from './DocumentViewer.vue';
import InvestigationBoard from './InvestigationBoard.vue';
import MusicRecord from './MusicRecord.vue';
import LevelCompleteScene from './LevelCompleteScene.vue';
import { archiveDocuments, archiveText, documentById } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useArchiveStore } from '@/stores/archive';
import { useCitizenshipStore } from '@/stores/citizenship';
import { useExperienceStore } from '@/stores/experience';
import type { DocumentId } from '@/types/archive';

defineEmits<{ close: [] }>();
type WorkspaceTab = 'documents' | 'board' | 'music' | 'passport' | 'assessment' | 'level';
const archive = useArchiveStore();
const citizenship = useCitizenshipStore();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const activeTab = ref<WorkspaceTab>('documents');
const activeDocumentId = ref<DocumentId | null>(null);
const caseMessage = ref('');
const documents = computed(() => archiveDocuments.filter((document) => document.caseId === archive.currentCaseId));
const activeDocument = computed(() => activeDocumentId.value ? documentById[activeDocumentId.value] : null);
const tabs = computed(() => [
  { id: 'documents' as const, label: ui.value.documents }, { id: 'board' as const, label: ui.value.board },
  { id: 'music' as const, label: ui.value.music }, { id: 'passport' as const, label: ui.value.passport },
  { id: 'assessment' as const, label: ui.value.assessment },
  ...(archive.progress.level01CompletedAt ? [{ id: 'level' as const, label: 'LEVEL 01' }] : [])
]);

archive.initialize();
watch(() => citizenship.profile?.userId ?? null, (userId) => { void archive.connectCitizen(userId); }, { immediate: true });
watch(() => archive.currentCaseId, () => { activeDocumentId.value = null; caseMessage.value = ''; activeTab.value = 'documents'; });
function inspect(id: DocumentId): void { activeDocumentId.value = id; archive.discoverDocument(id); }
function completeCase(): void {
  if (!archive.completeCase()) { caseMessage.value = ui.value.caseIncomplete; return; }
  const messages = { case_001: ui.value.case001Filed, case_002: ui.value.case002Filed, case_003: `${ui.value.case003Filed} ${ui.value.allCasesWarning}` };
  caseMessage.value = messages[archive.currentCaseId];
}
function openFinal(): void { archive.completeLevel01(); activeTab.value = 'level'; }
</script>

<template>
  <div class="archive-workspace" data-testid="archive-workspace">
    <header class="archive-system-bar">
      <div><span class="archive-signal" aria-hidden="true"></span><strong>{{ ui.system }}</strong><small>{{ ui.phase }}</small></div>
      <button type="button" class="dialog-close" :aria-label="ui.close" @click="$emit('close')">✕</button>
    </header>

    <div v-if="archive.migrationPending" class="archive-sync-prompt" role="status">
      <p>{{ ui.syncOffer }}</p><button type="button" :disabled="archive.syncState === 'working'" @click="archive.confirmMigration">{{ archive.syncState === 'working' ? ui.syncWorking : ui.syncAction }}</button>
    </div>
    <p v-else-if="archive.syncState === 'synced'" class="archive-sync-state">{{ ui.syncSuccess }}</p>
    <p v-else-if="archive.syncState === 'error'" class="archive-sync-state archive-sync-error">{{ ui.syncError }}</p>

    <ArchiveOnboarding v-if="!archive.progress.onboardingCompletedAt" :first-entered-at="archive.progress.firstEnteredAt" @complete="archive.completeOnboarding" />

    <div v-else class="archive-shell">
      <aside class="archive-case-rail" :aria-label="ui.cases">
        <span>{{ ui.cases }}</span>
        <button v-for="item in archive.archiveCases" :key="item.id" type="button" :disabled="!archive.progress.unlockedCases.includes(item.id)" :class="{ active: archive.currentCaseId === item.id, complete: archive.progress.completedCases.includes(item.id) }" @click="archive.setCurrentCase(item.id)">
          <small>{{ item.code }}</small><strong>{{ archiveText(item.title, experience.selectedLanguage) }}</strong><i>{{ archive.progress.completedCases.includes(item.id) ? '✓' : archive.progress.unlockedCases.includes(item.id) ? '→' : '×' }}</i>
        </button>
        <div class="archive-case-progress"><span>{{ ui.recordsStudied }}</span><strong>{{ archive.studiedCount }} / 09</strong></div>
      </aside>

      <main class="archive-main">
        <div class="archive-case-heading">
          <div><span>{{ archive.currentCase.code }} // {{ ui.classified }}</span><h1>{{ archiveText(archive.currentCase.title, experience.selectedLanguage) }}</h1></div>
          <p>{{ archiveText(archive.currentCase.briefing, experience.selectedLanguage) }}</p>
        </div>

        <nav class="archive-tabs" :aria-label="ui.system">
          <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" :disabled="tab.id === 'assessment' && !archive.assessmentUnlocked && !archive.progress.assessmentCompletedAt" @click="activeTab = tab.id">{{ tab.label }}</button>
        </nav>

        <section v-if="activeTab === 'documents'" class="archive-documents" data-testid="archive-documents">
          <div class="archive-document-list">
            <div class="archive-panel-heading"><span>{{ ui.documentRegister }}</span><small>{{ archive.progress.discoveredEvidence.filter((id) => archive.currentCase.evidenceIds.includes(id)).length }} / {{ archive.currentCase.evidenceIds.length }}</small></div>
            <button v-for="document in documents" :key="document.id" type="button" :class="{ active: activeDocumentId === document.id }" @click="inspect(document.id)">
              <span>{{ document.date }}</span><strong>{{ archiveText(document.title, experience.selectedLanguage) }}</strong><small>{{ document.evidenceIds.every((id) => archive.progress.discoveredEvidence.includes(id)) ? ui.discovered : ui.inspect }}</small>
            </button>
          </div>
          <DocumentViewer v-if="activeDocument" :document="activeDocument" />
          <div v-else class="archive-empty-document"><span aria-hidden="true">∴</span><p>{{ ui.inspect }}</p></div>
        </section>

        <InvestigationBoard v-else-if="activeTab === 'board'" />

        <section v-else-if="activeTab === 'music'" class="archive-records" data-testid="archive-records">
          <div class="archive-panel-heading"><span>{{ ui.music }}</span><small>{{ archive.studiedCount }} / 09</small></div>
          <p class="archive-record-disclaimer">{{ ui.studyDisclaimer }}</p>
          <MusicRecord v-for="record in archive.caseMusic" :key="record.id" :record="record" :state="archive.progress.investigatedMusicRecords[record.id]" @visit="archive.visitExternalLink(record.id)" @study="archive.markMusicStudied(record.id)" />
        </section>

        <AchievementPassport v-else-if="activeTab === 'passport'" />

        <ComplianceAssessment v-else-if="activeTab === 'assessment'" @complete="openFinal" />

        <LevelCompleteScene v-else-if="activeTab === 'level'" @archive="activeTab = 'documents'" @achievements="activeTab = 'passport'" @story="$emit('close')" />

        <footer v-if="activeTab !== 'assessment' && activeTab !== 'level'" class="archive-case-footer">
          <div><span>{{ archive.currentCaseReady ? ui.caseReady : ui.caseIncomplete }}</span><small>{{ ui.unofficial }}</small></div>
          <button type="button" :class="{ ready: archive.currentCaseReady }" @click="completeCase">{{ archive.progress.completedCases.includes(archive.currentCaseId) ? `✓ ${ui.completed}` : ui.fileCase }}</button>
          <p role="status" aria-live="polite">{{ caseMessage }}</p>
        </footer>
        <p v-if="!archive.assessmentUnlocked && activeTab === 'passport'" class="assessment-lock-note">{{ ui.assessmentLocked }}</p>
        <button v-if="archive.progress.level01CompletedAt && activeTab === 'passport'" type="button" class="open-final-record" @click="activeTab = 'level'">{{ ui.openFinal }}</button>
      </main>
    </div>
    <AchievementToast v-if="archive.earnedNoticeId" :id="archive.earnedNoticeId" @close="archive.clearEarnedNotice" />
  </div>
</template>
