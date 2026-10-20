import { createPlayerProgress, getDiscoveredEvidenceIds } from './archive-engine';
import { archiveDocuments } from '@/content/archive-content';
import type { PlayerProgress } from '@/types/archive';

function playerId(): string {
  try { return crypto.randomUUID(); } catch { return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}

export function normalizePlayerProgress(parsed: PlayerProgress): PlayerProgress {
  const fresh = createPlayerProgress(parsed.playerId, parsed.updatedAt || new Date().toISOString());
  const discoveredEvidence = parsed.discoveredEvidence ?? [];
  const inferredDocuments = archiveDocuments
    .filter((document) => document.evidenceIds.every((id) => discoveredEvidence.includes(id)))
    .map((document) => document.id);
  const studiedDocumentIds = parsed.studiedDocumentIds ?? inferredDocuments;
  const normalized: PlayerProgress = {
    ...fresh,
    ...parsed,
    employeeId: 'EMPLOYEE 021',
    employeeStatus: parsed.employeeStatus ?? (parsed.level01CompletedAt ? 'under_observation' : parsed.onboardingCompletedAt ? 'active' : 'appointed'),
    firstEnteredAt: parsed.firstEnteredAt ?? fresh.firstEnteredAt,
    onboardingCompletedAt: parsed.onboardingCompletedAt ?? null,
    level01CompletedAt: parsed.level01CompletedAt ?? null,
    clearanceLevel: parsed.clearanceLevel ?? (parsed.level01CompletedAt ? 'UNDER OBSERVATION' : 'ARCHIVE ENTRY'),
    studiedDocumentIds,
    discoveredEvidence,
    caseSolutions: parsed.caseSolutions ?? {},
    caseSequences: { ...fresh.caseSequences, ...(parsed.caseSequences ?? {}) }
  };
  return { ...normalized, discoveredEvidence: getDiscoveredEvidenceIds(normalized) };
}

export function loadLocalProgress(key: string): PlayerProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null') as PlayerProgress | null;
    if (parsed?.version === 1 && typeof parsed.playerId === 'string') return normalizePlayerProgress(parsed);
  } catch { /* Corrupt or unavailable storage falls back to a fresh in-memory archive. */ }
  return createPlayerProgress(playerId());
}

export function saveLocalProgress(key: string, progress: PlayerProgress): void {
  try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* The playable in-memory state remains available. */ }
}
