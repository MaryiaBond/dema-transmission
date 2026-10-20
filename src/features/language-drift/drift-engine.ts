import type { LanguageCode } from '@/types/content';

export const LANGUAGE_ORDER: LanguageCode[] = ['ru', 'be', 'en', 'es'];

export interface DriftPhase {
  source: LanguageCode;
  target: LanguageCode;
  progress: number;
}

export interface BlockLanguageInput {
  initialLanguage: LanguageCode;
  cycle: number;
  blockId: string;
  manualOverride?: LanguageCode | null;
  priority?: number;
}

export function stableBlockHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getLanguagePhase(initialLanguage: LanguageCode, cycle: number, manualOverride: LanguageCode | null = null): DriftPhase {
  if (manualOverride) return { source: manualOverride, target: manualOverride, progress: 0 };
  if (cycle >= 21) return { source: initialLanguage, target: initialLanguage, progress: 0 };
  const normalizedCycle = Math.max(1, Math.min(21, Math.floor(cycle)));
  const initialIndex = LANGUAGE_ORDER.indexOf(initialLanguage);
  const phase = Math.floor((normalizedCycle - 1) / 5);
  const step = (normalizedCycle - 1) % 5;
  return {
    source: LANGUAGE_ORDER[(initialIndex + phase) % LANGUAGE_ORDER.length] ?? initialLanguage,
    target: LANGUAGE_ORDER[(initialIndex + phase + 1) % LANGUAGE_ORDER.length] ?? initialLanguage,
    progress: step / 5
  };
}

export function getBlockLanguage({ initialLanguage, cycle, blockId, manualOverride = null, priority = 3 }: BlockLanguageInput): LanguageCode {
  const phase = getLanguagePhase(initialLanguage, cycle, manualOverride);
  if (!phase.progress || phase.source === phase.target) return phase.source;
  const rank = ((Math.max(1, Math.min(5, priority)) - 1) + stableBlockHash(blockId) / 0xffffffff) / 5;
  return rank <= phase.progress ? phase.target : phase.source;
}
