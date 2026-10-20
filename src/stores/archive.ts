import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { archiveCases, archiveMusicRecords, caseById } from '@/content/archive-content';
import { ARCHIVE_STORAGE_KEY, completeAssessment as finishAssessment, completeCase as fileCase, completeLevel01 as finishLevel01, completeOnboarding as finishOnboarding, createPlayerProgress, discoverDocument as inspectDocument, hasMeaningfulProgress, isAssessmentUnlocked, isCaseReady, markMusicStudied as studyMusic, mergeProgress, moveTimelineItem, recordAssessmentAnswer, recordCaseSolution, testConnection, visitMusicLink } from '@/features/archive/archive-engine';
import { loadLocalProgress, saveLocalProgress } from '@/features/archive/archive-persistence';
import { archiveSyncConfigured, loadRemoteProgress, saveRemoteProgress } from '@/features/archive/archive-sync';
import { studiedRecordCount } from '@/features/archive/achievement-engine';
import type { AchievementId, AssessmentAnswerId, AssessmentQuestionId, CaseId, DocumentId, EvidenceId, MusicRecordId, PlayerProgress } from '@/types/archive';

export const useArchiveStore = defineStore('archive', () => {
  const progress = ref<PlayerProgress>(createPlayerProgress('pending'));
  const currentCaseId = ref<CaseId>('case_001');
  const initialized = ref(false);
  const citizenId = ref<string | null>(null);
  const migrationPending = ref(false);
  const syncState = ref<'local' | 'working' | 'synced' | 'error'>('local');
  const earnedNoticeId = ref<AchievementId | null>(null);
  let remoteProgress: PlayerProgress | null = null;
  let remoteReady = false;
  let syncQueue: Promise<void> = Promise.resolve();

  const currentCase = computed(() => caseById[currentCaseId.value]);
  const studiedCount = computed(() => studiedRecordCount(progress.value));
  const assessmentUnlocked = computed(() => isAssessmentUnlocked(progress.value));
  const currentCaseReady = computed(() => isCaseReady(progress.value, currentCaseId.value));
  const caseMusic = computed(() => archiveMusicRecords.filter((record) => record.caseId === currentCaseId.value));

  function initialize(): void {
    if (initialized.value) return;
    progress.value = loadLocalProgress(ARCHIVE_STORAGE_KEY);
    initialized.value = true;
  }

  function persist(): void {
    saveLocalProgress(ARCHIVE_STORAGE_KEY, progress.value);
    if (citizenId.value && remoteReady && archiveSyncConfigured()) {
      const userId = citizenId.value;
      const snapshot = JSON.parse(JSON.stringify(progress.value)) as PlayerProgress;
      syncState.value = 'working';
      syncQueue = syncQueue.catch(() => undefined).then(() => saveRemoteProgress(userId, snapshot));
      void syncQueue.then(() => { syncState.value = 'synced'; }).catch(() => { syncState.value = 'error'; });
    }
  }

  function update(next: PlayerProgress): void {
    const previous = new Set(progress.value.achievements.map((item) => item.id));
    const newlyEarned = next.achievements.find((item) => !previous.has(item.id));
    progress.value = next;
    if (newlyEarned) earnedNoticeId.value = newlyEarned.id;
    persist();
  }

  async function connectCitizen(userId: string | null): Promise<void> {
    if (citizenId.value === userId && (remoteReady || migrationPending.value)) return;
    citizenId.value = userId;
    migrationPending.value = false;
    remoteReady = false;
    remoteProgress = null;
    if (!userId || !archiveSyncConfigured()) { syncState.value = 'local'; return; }
    syncState.value = 'working';
    try {
      remoteProgress = await loadRemoteProgress(userId);
      if (progress.value.playerId === userId) {
        if (remoteProgress) progress.value = mergeProgress(progress.value, remoteProgress);
        remoteReady = true;
        persist();
        return;
      }
      if (hasMeaningfulProgress(progress.value)) {
        migrationPending.value = true;
        syncState.value = 'local';
        return;
      }
      if (remoteProgress) progress.value = remoteProgress;
      else progress.value = { ...progress.value, playerId: userId };
      remoteReady = true;
      persist();
    } catch { syncState.value = 'error'; }
  }

  async function confirmMigration(): Promise<void> {
    if (!citizenId.value || !archiveSyncConfigured()) return;
    syncState.value = 'working';
    const merged = remoteProgress ? mergeProgress(progress.value, remoteProgress) : { ...progress.value, playerId: citizenId.value };
    try {
      await saveRemoteProgress(citizenId.value, merged);
      progress.value = merged;
      saveLocalProgress(ARCHIVE_STORAGE_KEY, progress.value);
      migrationPending.value = false;
      remoteReady = true;
      syncState.value = 'synced';
    } catch { syncState.value = 'error'; }
  }

  function setCurrentCase(caseId: CaseId): void { if (progress.value.unlockedCases.includes(caseId)) currentCaseId.value = caseId; }
  function completeOnboarding(): void { update(finishOnboarding(progress.value)); }
  function discoverDocument(documentId: DocumentId): void { update(inspectDocument(progress.value, documentId)); }
  function connectEvidence(first: EvidenceId, second: EvidenceId) {
    const outcome = testConnection(progress.value, currentCaseId.value, first, second);
    if (outcome.progress !== progress.value) update(outcome.progress);
    return outcome.result;
  }
  function moveEvidence(evidenceId: EvidenceId, direction: -1 | 1): void { update(moveTimelineItem(progress.value, currentCaseId.value, evidenceId, direction)); }
  function setCaseSolution(solution: string): void { update(recordCaseSolution(progress.value, currentCaseId.value, solution)); }
  function completeCase(): boolean {
    const outcome = fileCase(progress.value, currentCaseId.value);
    if (outcome.progress !== progress.value) update(outcome.progress);
    return outcome.completed;
  }
  function visitExternalLink(recordId: MusicRecordId): void { update(visitMusicLink(progress.value, recordId)); }
  function markMusicStudied(recordId: MusicRecordId): void { update(studyMusic(progress.value, recordId)); }
  function answerAssessment(questionId: AssessmentQuestionId, answerId: AssessmentAnswerId): void { update(recordAssessmentAnswer(progress.value, questionId, answerId)); }
  function completeAssessment(): void { update(finishAssessment(progress.value)); }
  function completeLevel01(): void { update(finishLevel01(progress.value)); }
  function clearEarnedNotice(): void { earnedNoticeId.value = null; }

  return {
    progress, currentCaseId, currentCase, currentCaseReady, caseMusic, studiedCount, assessmentUnlocked, migrationPending, syncState, earnedNoticeId,
    initialize, connectCitizen, confirmMigration, setCurrentCase, completeOnboarding, discoverDocument, connectEvidence, moveEvidence, setCaseSolution, completeCase,
    visitExternalLink, markMusicStudied, answerAssessment, completeAssessment, completeLevel01, clearEarnedNotice, archiveCases
  };
});
