<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import AchievementPassport from './AchievementPassport.vue';
import AchievementToast from './AchievementToast.vue';
import AtmosphereImage from './AtmosphereImage.vue';
import ArchiveOnboarding from './ArchiveOnboarding.vue';
import ComplianceAssessment from './ComplianceAssessment.vue';
import DemaAlert from './DemaAlert.vue';
import { caseAtmosphereAssets, caseCoverAssets } from './dema-assets';
import DocumentViewer from './DocumentViewer.vue';
import InvestigationBoard from './InvestigationBoard.vue';
import MusicRecord from './MusicRecord.vue';
import ProgressChecklist from './ProgressChecklist.vue';
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
const mainElement = ref<HTMLElement | null>(null);
const caseMessage = ref('');
const documents = computed(() => archiveDocuments.filter((document) => document.caseId === archive.currentCaseId));
const activeDocument = computed(() => activeDocumentId.value ? documentById[activeDocumentId.value] : null);
const atmosphereTab = computed<'documents' | 'board' | 'music' | null>(() => activeTab.value === 'documents' || activeTab.value === 'board' || activeTab.value === 'music' ? activeTab.value : null);
const atmosphereAsset = computed(() => caseAtmosphereAssets[atmosphereTab.value ?? 'documents'][archive.currentCaseId]);
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
function hideBrokenCaseCover(event: Event): void {
  if (event.currentTarget instanceof HTMLImageElement) event.currentTarget.hidden = true;
}
function completeCase(): void {
  if (!archive.completeCase()) { caseMessage.value = ui.value.caseIncomplete; return; }
  const messages = { case_001: ui.value.case001Filed, case_002: ui.value.case002Filed, case_003: `${ui.value.case003Filed} ${ui.value.allCasesWarning}` };
  caseMessage.value = messages[archive.currentCaseId];
}
function showFinal(): void {
  activeTab.value = 'level';
  void nextTick(() => mainElement.value?.querySelector('.level-complete-scene')?.scrollIntoView({ block: 'start' }));
}
function selectTab(tab: WorkspaceTab): void { if (tab === 'level') showFinal(); else activeTab.value = tab; }
function openFinal(): void { archive.completeLevel01(); showFinal(); }
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
          <span class="case-card-cover" aria-hidden="true">
            <img v-if="archive.progress.unlockedCases.includes(item.id)" :src="caseCoverAssets[item.id].src" alt="" loading="lazy" decoding="async" :width="caseCoverAssets[item.id].width" :height="caseCoverAssets[item.id].height" sizes="(max-width: 768px) 82vw, 250px" :style="{ objectPosition: caseCoverAssets[item.id].mobilePosition }" @error="hideBrokenCaseCover">
          </span>
          <small>{{ item.code }}</small><strong>{{ archiveText(item.title, experience.selectedLanguage) }}</strong>
          <p>{{ archiveText(item.briefing, experience.selectedLanguage) }}</p>
          <em>{{ !archive.progress.unlockedCases.includes(item.id) ? ui.locked : archive.caseProgressById[item.id].status === 'completed' ? ui.caseCompleted : archive.caseProgressById[item.id].status === 'in_progress' ? ui.caseInProgress : ui.caseNotStarted }}</em>
          <i>{{ archive.progress.completedCases.includes(item.id) ? '✓' : archive.progress.unlockedCases.includes(item.id) ? `${archive.caseProgressById[item.id].percentage}%` : '×' }}</i>
        </button>
        <div class="archive-case-progress"><span>{{ ui.recordsStudied }}</span><strong>{{ archive.studiedCount }} / 09</strong></div>
      </aside>

      <main ref="mainElement" class="archive-main">
        <div class="archive-case-heading">
          <div><span>{{ archive.currentCase.code }} // {{ ui.classified }}</span><h1>{{ archiveText(archive.currentCase.title, experience.selectedLanguage) }}</h1></div>
          <p>{{ archiveText(archive.currentCase.briefing, experience.selectedLanguage) }}</p>
          <AtmosphereImage
            class="archive-case-cover"
            :src="caseCoverAssets[archive.currentCaseId].src"
            :alt="archiveText(archive.currentCase.title, experience.selectedLanguage)"
            :label="archive.currentCase.code"
            :fit="caseCoverAssets[archive.currentCaseId].fit"
            :position="caseCoverAssets[archive.currentCaseId].position"
            :mobile-position="caseCoverAssets[archive.currentCaseId].mobilePosition"
            :width="caseCoverAssets[archive.currentCaseId].width"
            :height="caseCoverAssets[archive.currentCaseId].height"
            :aspect-ratio="caseCoverAssets[archive.currentCaseId].aspectRatio"
            :overlay="caseCoverAssets[archive.currentCaseId].overlay"
            sizes="(max-width: 768px) calc(100vw - 68px), 210px"
          />
        </div>

        <nav class="archive-tabs" :aria-label="ui.system">
          <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" :disabled="tab.id === 'assessment' && !archive.assessmentUnlocked && !archive.progress.assessmentCompletedAt" @click="selectTab(tab.id)">{{ tab.label }}</button>
        </nav>

        <ProgressChecklist v-if="activeTab !== 'assessment' && activeTab !== 'level'" :progress="archive.currentCaseProgress" sticky />

        <AtmosphereImage
          v-if="atmosphereTab"
          :key="atmosphereAsset.fileName"
          class="archive-atmosphere-strip"
          :src="atmosphereAsset.src"
          alt=""
          decorative
          :label="`${archive.currentCase.code} // ${tabs.find((tab) => tab.id === activeTab)?.label ?? ''}`"
          :fit="atmosphereAsset.fit"
          :position="atmosphereAsset.position"
          :mobile-position="atmosphereAsset.mobilePosition"
          :width="atmosphereAsset.width"
          :height="atmosphereAsset.height"
          :aspect-ratio="atmosphereAsset.aspectRatio"
          :overlay="atmosphereAsset.overlay"
          sizes="(max-width: 768px) calc(100vw - 30px), calc(100vw - 340px)"
        />

        <section v-if="activeTab === 'documents'" class="archive-documents" data-testid="archive-documents">
          <div class="archive-document-list">
            <div class="archive-panel-heading"><span>{{ ui.documentRegister }}</span><small>{{ archive.currentCaseProgress.documents.completed }} / {{ archive.currentCaseProgress.documents.total }}</small></div>
            <button v-for="document in documents" :key="document.id" type="button" :class="{ active: activeDocumentId === document.id }" @click="inspect(document.id)">
              <span>{{ document.date }}</span><strong>{{ archiveText(document.title, experience.selectedLanguage) }}</strong><small>{{ archive.progress.studiedDocumentIds.includes(document.id) ? ui.discovered : ui.inspect }}</small>
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
          <DemaAlert v-if="archive.progress.completedCases.includes(archive.currentCaseId)" variant="success" :title="ui.caseCompleted" :message="caseMessage || ui.caseFiled" compact />
          <DemaAlert v-else-if="caseMessage" variant="success" :title="ui.systemNote" :message="caseMessage" compact />
          <DemaAlert v-else-if="!archive.currentCaseReady" variant="danger" :title="ui.cannotCloseCase" :message="`${ui.completeAllStages} ${ui.materialsPending}`" compact />
          <DemaAlert v-else variant="info" :title="ui.archiveAwaiting" :message="ui.caseReady" compact />
          <button type="button" :class="{ ready: archive.currentCaseReady }" :disabled="!archive.currentCaseReady || archive.progress.completedCases.includes(archive.currentCaseId)" @click="completeCase">{{ archive.progress.completedCases.includes(archive.currentCaseId) ? `✓ ${ui.completed}` : ui.fileCase }}</button>
          <small>{{ ui.unofficial }}</small>
        </footer>
        <p v-if="!archive.assessmentUnlocked && activeTab === 'passport'" class="assessment-lock-note">{{ ui.assessmentLocked }}</p>
        <button v-if="archive.progress.level01CompletedAt && activeTab === 'passport'" type="button" class="open-final-record" @click="showFinal">{{ ui.openFinal }}</button>
      </main>
    </div>
    <AchievementToast v-if="archive.earnedNoticeId" :id="archive.earnedNoticeId" @close="archive.clearEarnedNotice" />
  </div>
</template>
