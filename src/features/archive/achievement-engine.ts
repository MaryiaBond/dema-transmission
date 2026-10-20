import type { AchievementId, PlayerProgress } from '@/types/archive';

export const ACHIEVEMENT_IDS: readonly AchievementId[] = ['archive_corrected', 'invisible_color', 'perfect_broadcast', 'nine_frequencies', 'compliant_mind'];

export function studiedRecordCount(progress: PlayerProgress): number {
  return Object.values(progress.investigatedMusicRecords).filter((record) => record?.markedAsStudied).length;
}

export function achievementConditions(progress: PlayerProgress): Record<AchievementId, boolean> {
  return {
    archive_corrected: progress.completedCases.includes('case_001'),
    invisible_color: progress.completedCases.includes('case_002'),
    perfect_broadcast: progress.completedCases.includes('case_003'),
    nine_frequencies: studiedRecordCount(progress) >= 9,
    compliant_mind: Boolean(progress.assessmentCompletedAt)
  };
}

export function registerAchievements(progress: PlayerProgress, now: string): PlayerProgress {
  const conditions = achievementConditions(progress);
  const earned = new Set(progress.achievements.map((item) => item.id));
  const additions = ACHIEVEMENT_IDS.filter((id) => conditions[id] && !earned.has(id)).map((id) => ({ id, earnedAt: now }));
  return additions.length ? { ...progress, achievements: [...progress.achievements, ...additions], updatedAt: now } : progress;
}
