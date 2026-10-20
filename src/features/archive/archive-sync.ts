import { getSupabaseClient } from '@/features/citizenship/supabase-client';
import type { PlayerProgress } from '@/types/archive';

export const archiveSyncConfigured = (): boolean => import.meta.env.VITE_ARCHIVE_SYNC_ENABLED === 'true';

export async function loadRemoteProgress(userId: string): Promise<PlayerProgress | null> {
  if (!archiveSyncConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) throw new Error('archive-sync-unavailable');
  const { data, error } = await client.from('archive_progress').select('progress').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data?.progress as PlayerProgress | undefined) ?? null;
}

export async function saveRemoteProgress(userId: string, progress: PlayerProgress): Promise<void> {
  if (!archiveSyncConfigured()) return;
  const client = getSupabaseClient();
  if (!client) throw new Error('archive-sync-unavailable');
  const { error } = await client.from('archive_progress').upsert({ user_id: userId, progress, updated_at: progress.updatedAt }, { onConflict: 'user_id' });
  if (error) throw error;
}
