import { createPlayerProgress } from './archive-engine';
import type { PlayerProgress } from '@/types/archive';

function playerId(): string {
  try { return crypto.randomUUID(); } catch { return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}

export function loadLocalProgress(key: string): PlayerProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null') as PlayerProgress | null;
    if (parsed?.version === 1 && typeof parsed.playerId === 'string') {
      const fresh = createPlayerProgress(parsed.playerId, parsed.updatedAt || new Date().toISOString());
      return {
        ...fresh,
        ...parsed,
        employeeId: 'EMPLOYEE 021',
        employeeStatus: parsed.employeeStatus ?? (parsed.level01CompletedAt ? 'under_observation' : parsed.onboardingCompletedAt ? 'active' : 'appointed'),
        firstEnteredAt: parsed.firstEnteredAt ?? fresh.firstEnteredAt,
        onboardingCompletedAt: parsed.onboardingCompletedAt ?? null,
        level01CompletedAt: parsed.level01CompletedAt ?? null,
        clearanceLevel: parsed.clearanceLevel ?? (parsed.level01CompletedAt ? 'UNDER OBSERVATION' : 'ARCHIVE ENTRY'),
        caseSolutions: parsed.caseSolutions ?? {}
      };
    }
  } catch { /* Corrupt or unavailable storage falls back to a fresh in-memory archive. */ }
  return createPlayerProgress(playerId());
}

export function saveLocalProgress(key: string, progress: PlayerProgress): void {
  try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* The playable in-memory state remains available. */ }
}
