/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ARCHIVE_SYNC_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
