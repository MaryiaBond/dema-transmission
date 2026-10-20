import { beforeEach, describe, expect, it, vi } from 'vitest';
import { archiveCases, archiveConnections, archiveDocuments, archiveMusicRecords, assessmentQuestions, assessmentResult } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { achievementConditions } from '@/features/archive/achievement-engine';
import { ARCHIVE_STORAGE_KEY, completeAssessment, completeCase, completeLevel01, completeOnboarding, createPlayerProgress, discoverDocument, getCaseProgress, isAssessmentUnlocked, markMusicStudied, mergeProgress, moveTimelineItem, recordAssessmentAnswer, recordCaseSolution, reorderTimelineItem, testConnection, visitMusicLink } from '@/features/archive/archive-engine';
import { loadLocalProgress, saveLocalProgress } from '@/features/archive/archive-persistence';
import type { CaseId, PlayerProgress } from '@/types/archive';

const now = '2026-10-19T12:00:00.000Z';

function solveCase(progress: PlayerProgress, caseId: CaseId): PlayerProgress {
  const definition = archiveCases.find((item) => item.id === caseId)!;
  for (const documentId of definition.documentIds) progress = discoverDocument(progress, documentId, now);
  for (const connectionId of definition.requiredConnectionIds) {
    const connection = archiveConnections.find((item) => item.id === connectionId)!;
    progress = testConnection(progress, caseId, connection.evidence[0], connection.evidence[1], now).progress;
  }
  for (const recordId of definition.musicRecordIds) progress = markMusicStudied(progress, recordId, now);
  if (definition.correctSequence) progress = { ...progress, caseSequences: { ...progress.caseSequences, [caseId]: [...definition.correctSequence] } };
  if (caseId === 'case_003') progress = recordCaseSolution(progress, caseId, 'CLANCY IS DEAD', now);
  return completeCase(progress, caseId, now).progress;
}

function unlockAssessment(progress = createPlayerProgress('guest-test', now)): PlayerProgress {
  for (const item of archiveCases) progress = solveCase(progress, item.id);
  for (const record of archiveMusicRecords) progress = markMusicStudied(progress, record.id, now);
  return progress;
}

describe('DEMA Archive engine', () => {
  beforeEach(() => localStorage.clear());

  it.each(archiveCases.map((item) => item.id))('completes %s only after every verification stage', (caseId) => {
    let empty = createPlayerProgress('archivist', now);
    expect(completeCase(empty, caseId, now).completed).toBe(false);
    for (const item of archiveCases) {
      if (item.id === caseId) break;
      empty = solveCase(empty, item.id);
    }
    const solved = solveCase(empty, caseId);
    expect(solved.completedCases).toContain(caseId);
  });

  it('reports explicit document, connection, record, timeline, and cipher progress', () => {
    let progress = createPlayerProgress('progress-check', now);
    expect(getCaseProgress(progress, 'case_001')).toMatchObject({
      documents: { completed: 0, total: 3, done: false },
      connections: { completed: 0, total: 1, done: false },
      records: { completed: 0, total: 3, done: false },
      timeline: false,
      cipher: null,
      ready: false,
      status: 'not_started'
    });
    for (const documentId of archiveCases[0]!.documentIds.slice(0, 2)) progress = discoverDocument(progress, documentId, now);
    const connection = archiveConnections.find((item) => item.id === 'lineup_transition')!;
    progress = testConnection(progress, 'case_001', connection.evidence[0], connection.evidence[1], now).progress;
    progress = { ...progress, caseSequences: { case_001: [...archiveCases[0]!.correctSequence!] } };
    expect(getCaseProgress(progress, 'case_001')).toMatchObject({ documents: { completed: 2, done: false }, connections: { done: true }, records: { done: false }, timeline: true, ready: false });
    progress = discoverDocument(progress, archiveCases[0]!.documentIds[2]!, now);
    for (const recordId of archiveCases[0]!.musicRecordIds) progress = markMusicStudied(progress, recordId, now);
    expect(getCaseProgress(progress, 'case_001')).toMatchObject({ documents: { done: true }, records: { done: true }, percentage: 100, ready: true, status: 'in_progress' });
  });

  it('reorders timeline items to any index while preserving the adjacent-move API', () => {
    const fresh = createPlayerProgress('timeline-test', now);
    const initial = [...fresh.caseSequences.case_001!];
    const movedToEnd = reorderTimelineItem(fresh, 'case_001', initial[0]!, 3, now);
    expect(movedToEnd.caseSequences.case_001).toEqual([initial[1], initial[2], initial[3], initial[0]]);
    const movedAdjacent = moveTimelineItem(movedToEnd, 'case_001', initial[0]!, -1, now);
    expect(movedAdjacent.caseSequences.case_001).toEqual([initial[1], initial[2], initial[0], initial[3]]);
    expect(reorderTimelineItem(movedAdjacent, 'case_001', initial[0]!, 2, now)).toBe(movedAdjacent);
  });

  it('creates EMPLOYEE 021 once and records the first orientation', () => {
    const fresh = createPlayerProgress('private-player-id', now);
    expect(fresh.employeeId).toBe('EMPLOYEE 021');
    expect(fresh.firstEnteredAt).toBe(now);
    expect(fresh.unlockedCases).toEqual(['case_001']);
    const oriented = completeOnboarding(fresh, now);
    expect(oriented.employeeStatus).toBe('active');
    expect(completeOnboarding(oriented, 'later')).toEqual(oriented);
  });

  it('accepts correct links, rejects wrong ones, and never destroys progress', () => {
    let progress = createPlayerProgress('archivist', now);
    progress = discoverDocument(progress, 'doc_002_visual', now);
    progress = discoverDocument(progress, 'doc_002_field', now);
    const wrong = testConnection(progress, 'case_002', 'yellow_petals', 'bishop_vision', now);
    expect(wrong.result).toBe('wrong');
    expect(wrong.progress).toEqual(progress);
    const correct = testConnection(progress, 'case_002', 'yellow_tape', 'bishop_vision', now);
    expect(correct.result).toBe('correct');
    expect(correct.progress.confirmedConnections).toContain('yellow_blindspot');
    expect(testConnection(correct.progress, 'case_002', 'bishop_vision', 'yellow_tape', now).result).toBe('known');
  });

  it('persists discovered evidence and separate music visit/study signals', () => {
    let progress = discoverDocument(createPlayerProgress('persistent', now), 'doc_001_changes', now);
    progress = visitMusicLink(progress, 'jumpsuit', now);
    expect(progress.investigatedMusicRecords.jumpsuit).toMatchObject({ visitedExternalLink: true, markedAsStudied: false, studiedAt: null });
    progress = markMusicStudied(progress, 'jumpsuit', now);
    saveLocalProgress(ARCHIVE_STORAGE_KEY, progress);
    const restored = loadLocalProgress(ARCHIVE_STORAGE_KEY);
    expect(restored.discoveredEvidence).toEqual(expect.arrayContaining(['salih_departure', 'dun_arrival', 'thomas_departure']));
    expect(restored.investigatedMusicRecords.jumpsuit).toMatchObject({ visitedExternalLink: true, markedAsStudied: true, studiedAt: now });
  });

  it('does not award duplicate achievements', () => {
    const once = solveCase(createPlayerProgress('achiever', now), 'case_001');
    const twice = completeCase(once, 'case_001', '2026-10-19T13:00:00.000Z').progress;
    expect(twice.achievements.filter((item) => item.id === 'archive_corrected')).toHaveLength(1);
  });

  it('unlocks assessment after three cases because each case requires its three study marks', () => {
    let progress = createPlayerProgress('candidate', now);
    for (const item of archiveCases) progress = solveCase(progress, item.id);
    expect(isAssessmentUnlocked(progress)).toBe(true);
    expect(Object.values(progress.investigatedMusicRecords).filter((record) => record?.markedAsStudied)).toHaveLength(9);
    expect(achievementConditions(progress).nine_frequencies).toBe(true);
  });

  it('preserves every answer while producing the same fictional assessment result', () => {
    const completeWith = (choice: 0 | 3) => {
      let progress = unlockAssessment();
      for (const question of assessmentQuestions) progress = recordAssessmentAnswer(progress, question.id, question.answers[choice]!.id, now);
      return completeAssessment(progress, now);
    };
    const first = completeWith(0);
    const third = completeWith(3);
    expect(Object.values(first.assessmentAnswers)).not.toEqual(Object.values(third.assessmentAnswers));
    expect(first.assessmentCompletedAt).toBe(now);
    expect(third.assessmentCompletedAt).toBe(now);
    expect(first.achievements.some((item) => item.id === 'compliant_mind')).toBe(true);
    expect(assessmentResult.code).toBe('D//OBSERVATION-CONTINUES');
  });

  it('completes LEVEL 01 idempotently and assigns the new clearance', () => {
    let progress = unlockAssessment();
    for (const question of assessmentQuestions) progress = recordAssessmentAnswer(progress, question.id, question.answers[0]!.id, now);
    progress = completeAssessment(progress, now);
    const completed = completeLevel01(progress, now);
    expect(completed.level01CompletedAt).toBe(now);
    expect(completed.clearanceLevel).toBe('UNDER OBSERVATION');
    expect(completeLevel01(completed, 'later')).toEqual(completed);
  });

  it('merges guest progress into a citizen copy without losing the local achievements', () => {
    const local = solveCase(createPlayerProgress('guest', now), 'case_001');
    const remoteAfterFirst = solveCase(createPlayerProgress('citizen-id', '2026-10-18T12:00:00.000Z'), 'case_001');
    const remote = solveCase(remoteAfterFirst, 'case_002');
    const merged = mergeProgress(local, remote);
    expect(merged.playerId).toBe('citizen-id');
    expect(merged.completedCases).toEqual(expect.arrayContaining(['case_001', 'case_002']));
    expect(merged.achievements.map((item) => item.id)).toEqual(expect.arrayContaining(['archive_corrected', 'invisible_color']));
    expect(loadLocalProgress(ARCHIVE_STORAGE_KEY).playerId).not.toBe('citizen-id');
  });

  it('uses static external links and never calls Spotify or any playback API', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    let progress = createPlayerProgress('offline', now);
    for (const record of archiveMusicRecords) {
      expect(record.spotify).toMatch(/^https:\/\/open\.spotify\.com\//);
      progress = visitMusicLink(progress, record.id, now);
      progress = markMusicStudied(progress, record.id, now);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('contains complete structured content in all four languages', () => {
    for (const language of ['ru', 'be', 'en', 'es'] as const) {
      expect(Object.values(archiveLocales[language]).every(Boolean)).toBe(true);
      for (const item of [...archiveCases, ...archiveDocuments]) expect(item.title[language]).not.toBe('');
      for (const question of assessmentQuestions) {
        expect(question.prompt[language]).not.toBe('');
        expect(question.answers.every((answer) => Boolean(answer.text[language]))).toBe(true);
      }
    }
  });
});
