import { archiveCases, archiveConnections, assessmentQuestions, caseById, documentById } from '@/content/archive-content';
import { registerAchievements, studiedRecordCount } from './achievement-engine';
import type { AssessmentAnswerId, AssessmentQuestionId, CaseId, DocumentId, EvidenceId, MusicRecordId, PlayerProgress } from '@/types/archive';

export const ARCHIVE_STORAGE_KEY = 'the-outside-archive-progress-v1';

const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];
const stamp = (progress: PlayerProgress, now: string): PlayerProgress => registerAchievements({ ...progress, updatedAt: now }, now);

export function createPlayerProgress(playerId: string, now = new Date().toISOString()): PlayerProgress {
  return {
    version: 1, playerId, employeeId: 'EMPLOYEE 021', employeeStatus: 'appointed', firstEnteredAt: now, onboardingCompletedAt: null,
    currentPhase: 'phase_a', unlockedCases: ['case_001'], completedCases: [], discoveredEvidence: [], confirmedConnections: [],
    investigatedMusicRecords: {}, achievements: [], assessmentAnswers: {}, assessmentCompletedAt: null,
    level01CompletedAt: null, clearanceLevel: 'ARCHIVE ENTRY', caseSolutions: {},
    caseSequences: Object.fromEntries(archiveCases.filter((item) => item.initialSequence).map((item) => [item.id, [...item.initialSequence!]])), updatedAt: now
  };
}

export function completeOnboarding(progress: PlayerProgress, now = new Date().toISOString()): PlayerProgress {
  if (progress.onboardingCompletedAt) return progress;
  return stamp({ ...progress, onboardingCompletedAt: now, employeeStatus: 'active' }, now);
}

export function discoverDocument(progress: PlayerProgress, documentId: DocumentId, now = new Date().toISOString()): PlayerProgress {
  const document = documentById[documentId];
  return stamp({ ...progress, discoveredEvidence: unique([...progress.discoveredEvidence, ...document.evidenceIds]) }, now);
}

export function testConnection(progress: PlayerProgress, caseId: CaseId, first: EvidenceId, second: EvidenceId, now = new Date().toISOString()): { progress: PlayerProgress; result: 'correct' | 'known' | 'wrong' } {
  const match = archiveConnections.find((connection) => connection.caseId === caseId && connection.evidence.includes(first) && connection.evidence.includes(second) && first !== second);
  if (!match) return { progress, result: 'wrong' };
  if (progress.confirmedConnections.includes(match.id)) return { progress, result: 'known' };
  return { progress: stamp({ ...progress, confirmedConnections: [...progress.confirmedConnections, match.id] }, now), result: 'correct' };
}

export function moveTimelineItem(progress: PlayerProgress, caseId: CaseId, evidenceId: EvidenceId, direction: -1 | 1, now = new Date().toISOString()): PlayerProgress {
  const sequence = [...(progress.caseSequences[caseId] ?? caseById[caseId].initialSequence ?? [])];
  const from = sequence.indexOf(evidenceId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= sequence.length) return progress;
  [sequence[from], sequence[to]] = [sequence[to]!, sequence[from]!];
  return stamp({ ...progress, caseSequences: { ...progress.caseSequences, [caseId]: sequence } }, now);
}

export function isCaseReady(progress: PlayerProgress, caseId: CaseId): boolean {
  const current = caseById[caseId];
  const evidenceReady = current.evidenceIds.every((id) => progress.discoveredEvidence.includes(id));
  const connectionsReady = current.requiredConnectionIds.every((id) => progress.confirmedConnections.includes(id));
  const sequenceReady = !current.correctSequence || current.correctSequence.every((id, index) => progress.caseSequences[caseId]?.[index] === id);
  const solutionReady = caseId !== 'case_003' || progress.caseSolutions.case_003?.replace(/[^a-z]/gi, '').toLowerCase() === 'clancyisdead';
  return evidenceReady && connectionsReady && sequenceReady && solutionReady;
}

export function recordCaseSolution(progress: PlayerProgress, caseId: CaseId, solution: string, now = new Date().toISOString()): PlayerProgress {
  return stamp({ ...progress, caseSolutions: { ...progress.caseSolutions, [caseId]: solution.slice(0, 80) } }, now);
}

export function completeCase(progress: PlayerProgress, caseId: CaseId, now = new Date().toISOString()): { progress: PlayerProgress; completed: boolean } {
  if (!progress.unlockedCases.includes(caseId)) return { progress, completed: false };
  if (!isCaseReady(progress, caseId)) return { progress, completed: false };
  if (progress.completedCases.includes(caseId)) return { progress, completed: true };
  const index = archiveCases.findIndex((item) => item.id === caseId);
  const nextCase = archiveCases[index + 1]?.id;
  return {
    progress: stamp({
      ...progress,
      completedCases: [...progress.completedCases, caseId],
      unlockedCases: nextCase ? unique([...progress.unlockedCases, nextCase]) : progress.unlockedCases
    }, now),
    completed: true
  };
}

export function visitMusicLink(progress: PlayerProgress, musicRecordId: MusicRecordId, now = new Date().toISOString()): PlayerProgress {
  const existing = progress.investigatedMusicRecords[musicRecordId];
  return stamp({ ...progress, investigatedMusicRecords: { ...progress.investigatedMusicRecords, [musicRecordId]: { musicRecordId, visitedExternalLink: true, markedAsStudied: existing?.markedAsStudied ?? false, studiedAt: existing?.studiedAt ?? null } } }, now);
}

export function markMusicStudied(progress: PlayerProgress, musicRecordId: MusicRecordId, now = new Date().toISOString()): PlayerProgress {
  const existing = progress.investigatedMusicRecords[musicRecordId];
  if (existing?.markedAsStudied) return progress;
  return stamp({ ...progress, investigatedMusicRecords: { ...progress.investigatedMusicRecords, [musicRecordId]: { musicRecordId, visitedExternalLink: existing?.visitedExternalLink ?? false, markedAsStudied: true, studiedAt: now } } }, now);
}

export function isAssessmentUnlocked(progress: PlayerProgress): boolean {
  return archiveCases.every((item) => progress.completedCases.includes(item.id)) && studiedRecordCount(progress) >= 9;
}

export function recordAssessmentAnswer(progress: PlayerProgress, questionId: AssessmentQuestionId, answerId: AssessmentAnswerId, now = new Date().toISOString()): PlayerProgress {
  if (!isAssessmentUnlocked(progress) || !answerId.startsWith(`${questionId}_`)) return progress;
  return stamp({ ...progress, assessmentAnswers: { ...progress.assessmentAnswers, [questionId]: answerId } }, now);
}

export function completeAssessment(progress: PlayerProgress, now = new Date().toISOString()): PlayerProgress {
  if (!isAssessmentUnlocked(progress) || !assessmentQuestions.every((question) => progress.assessmentAnswers[question.id])) return progress;
  if (progress.assessmentCompletedAt) return progress;
  return stamp({ ...progress, assessmentCompletedAt: now }, now);
}

export function completeLevel01(progress: PlayerProgress, now = new Date().toISOString()): PlayerProgress {
  if (!progress.assessmentCompletedAt) return progress;
  if (progress.level01CompletedAt) return progress;
  return stamp({ ...progress, level01CompletedAt: now, clearanceLevel: 'UNDER OBSERVATION', employeeStatus: 'under_observation' }, now);
}

export function mergeProgress(local: PlayerProgress, remote: PlayerProgress): PlayerProgress {
  const newer = Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt) ? local : remote;
  const music = { ...remote.investigatedMusicRecords };
  for (const [id, record] of Object.entries(local.investigatedMusicRecords)) {
    if (!record) continue;
    const previous = music[id as MusicRecordId];
    music[id as MusicRecordId] = {
      ...record,
      visitedExternalLink: Boolean(previous?.visitedExternalLink || record.visitedExternalLink),
      markedAsStudied: Boolean(previous?.markedAsStudied || record.markedAsStudied),
      studiedAt: previous?.studiedAt && record.studiedAt ? (previous.studiedAt < record.studiedAt ? previous.studiedAt : record.studiedAt) : previous?.studiedAt ?? record.studiedAt
    };
  }
  const merged: PlayerProgress = {
    ...newer,
    playerId: remote.playerId,
    unlockedCases: unique([...remote.unlockedCases, ...local.unlockedCases]), completedCases: unique([...remote.completedCases, ...local.completedCases]),
    discoveredEvidence: unique([...remote.discoveredEvidence, ...local.discoveredEvidence]), confirmedConnections: unique([...remote.confirmedConnections, ...local.confirmedConnections]),
    investigatedMusicRecords: music,
    achievements: Object.values(Object.fromEntries([...remote.achievements, ...local.achievements].map((item) => [item.id, item]))),
    assessmentAnswers: { ...remote.assessmentAnswers, ...local.assessmentAnswers },
    assessmentCompletedAt: remote.assessmentCompletedAt ?? local.assessmentCompletedAt,
    level01CompletedAt: remote.level01CompletedAt ?? local.level01CompletedAt,
    clearanceLevel: remote.level01CompletedAt || local.level01CompletedAt ? 'UNDER OBSERVATION' : newer.clearanceLevel,
    employeeId: 'EMPLOYEE 021',
    employeeStatus: remote.level01CompletedAt || local.level01CompletedAt ? 'under_observation' : newer.employeeStatus,
    firstEnteredAt: local.firstEnteredAt < remote.firstEnteredAt ? local.firstEnteredAt : remote.firstEnteredAt,
    onboardingCompletedAt: remote.onboardingCompletedAt ?? local.onboardingCompletedAt,
    caseSolutions: { ...remote.caseSolutions, ...local.caseSolutions },
    caseSequences: { ...remote.caseSequences, ...local.caseSequences }, updatedAt: newer.updatedAt
  };
  return registerAchievements(merged, merged.updatedAt);
}

export function hasMeaningfulProgress(progress: PlayerProgress): boolean {
  return Boolean(progress.completedCases.length || progress.discoveredEvidence.length || progress.confirmedConnections.length || studiedRecordCount(progress) || Object.keys(progress.assessmentAnswers).length);
}
