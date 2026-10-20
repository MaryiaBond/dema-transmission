import type { LanguageCode } from './content';

export type ArchivePhase = 'phase_a' | 'phase_b' | 'phase_a_plus';
export type CaseId = 'case_001' | 'case_002' | 'case_003';
export type EvidenceId =
  | 'founding_lineup' | 'salih_departure' | 'dun_arrival' | 'thomas_departure'
  | 'yellow_petals' | 'yellow_tape' | 'bishop_vision'
  | 'sai_broadcast' | 'scaled_anagram' | 'clancy_captive';
export type ConnectionId = 'lineup_transition' | 'yellow_signal' | 'yellow_blindspot' | 'broadcast_contradiction' | 'anagram_confirmation';
export type DocumentId =
  | 'doc_001_roster' | 'doc_001_changes' | 'doc_001_photo'
  | 'doc_002_visual' | 'doc_002_field' | 'doc_002_directive'
  | 'doc_003_program' | 'doc_003_cipher' | 'doc_003_testimony';
export type MusicRecordId = 'heavydirtysoul' | 'jumpsuit' | 'nico' | 'levitate' | 'saturday' | 'outside' | 'iamclancy' | 'overcompensate' | 'navigating';
export type AchievementId = 'archive_corrected' | 'invisible_color' | 'perfect_broadcast' | 'nine_frequencies' | 'compliant_mind';
export type AssessmentQuestionId = 'q01' | 'q02' | 'q03' | 'q04' | 'q05' | 'q06' | 'q07' | 'q08' | 'q09';
export type AssessmentAnswerId = `${AssessmentQuestionId}_${'a' | 'b' | 'c' | 'd'}`;
export type EmployeeStatus = 'appointed' | 'active' | 'under_observation';
export type ClearanceLevel = 'ARCHIVE ENTRY' | 'UNDER OBSERVATION';
export type SourceCategory = 'historical_fact' | 'confirmed_canon' | 'game_fiction';
export type LocalizedArchiveText = Record<LanguageCode, string>;
export type CaseProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface SourceReference { label: string; url: string }
export interface Evidence {
  id: EvidenceId;
  caseId: CaseId;
  documentId: DocumentId;
  category: SourceCategory;
  title: LocalizedArchiveText;
  summary: LocalizedArchiveText;
}
export interface EvidenceConnection {
  id: ConnectionId;
  caseId: CaseId;
  evidence: readonly [EvidenceId, EvidenceId];
  finding: LocalizedArchiveText;
}
export interface ArchiveDocument {
  id: DocumentId;
  caseId: CaseId;
  category: SourceCategory;
  date: string;
  title: LocalizedArchiveText;
  body: LocalizedArchiveText;
  evidenceIds: readonly EvidenceId[];
  source?: SourceReference;
}
export interface InvestigationCase {
  id: CaseId;
  code: string;
  phase: 'phase_a';
  title: LocalizedArchiveText;
  briefing: LocalizedArchiveText;
  documentIds: readonly DocumentId[];
  evidenceIds: readonly EvidenceId[];
  requiredConnectionIds: readonly ConnectionId[];
  correctSequence?: readonly EvidenceId[];
  initialSequence?: readonly EvidenceId[];
  musicRecordIds: readonly MusicRecordId[];
}
export interface MusicRecord {
  id: MusicRecordId;
  caseId: CaseId;
  title: string;
  album: string;
  significance: LocalizedArchiveText;
  youtube: string;
  spotify: string | undefined;
  yandex: string | undefined;
}
export interface Achievement {
  id: AchievementId;
  title: LocalizedArchiveText;
  description: LocalizedArchiveText;
}
export interface AssessmentQuestion {
  id: AssessmentQuestionId;
  prompt: LocalizedArchiveText;
  answers: readonly { id: AssessmentAnswerId; text: LocalizedArchiveText }[];
}
export interface AssessmentResult { code: string; title: LocalizedArchiveText; detail: LocalizedArchiveText }
export interface MusicInvestigation {
  musicRecordId: MusicRecordId;
  visitedExternalLink: boolean;
  markedAsStudied: boolean;
  studiedAt: string | null;
}
export interface EarnedAchievement { id: AchievementId; earnedAt: string }
export interface CaseProgressMetric {
  completed: number;
  total: number;
  done: boolean;
}
export interface CaseProgressState {
  caseId: CaseId;
  documents: CaseProgressMetric;
  connections: CaseProgressMetric;
  records: CaseProgressMetric;
  timeline: boolean | null;
  cipher: boolean | null;
  evidenceReady: boolean;
  completedUnits: number;
  totalUnits: number;
  percentage: number;
  ready: boolean;
  status: CaseProgressStatus;
}
export interface PlayerProgress {
  version: 1;
  playerId: string;
  employeeId: 'EMPLOYEE 021';
  employeeStatus: EmployeeStatus;
  firstEnteredAt: string;
  onboardingCompletedAt: string | null;
  currentPhase: ArchivePhase;
  unlockedCases: CaseId[];
  completedCases: CaseId[];
  studiedDocumentIds: DocumentId[];
  discoveredEvidence: EvidenceId[];
  confirmedConnections: ConnectionId[];
  investigatedMusicRecords: Partial<Record<MusicRecordId, MusicInvestigation>>;
  achievements: EarnedAchievement[];
  assessmentAnswers: Partial<Record<AssessmentQuestionId, AssessmentAnswerId>>;
  assessmentCompletedAt: string | null;
  level01CompletedAt: string | null;
  clearanceLevel: ClearanceLevel;
  caseSolutions: Partial<Record<CaseId, string>>;
  caseSequences: Partial<Record<CaseId, EvidenceId[]>>;
  updatedAt: string;
}
