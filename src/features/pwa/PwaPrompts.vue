<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { pwaLocales } from '@/content/pwa-locales';
import { useExperienceStore } from '@/stores/experience';
import { installPromptDismissed, isIosSafari, isStandaloneDisplay, rememberInstallDismissal } from './pwa-utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const experience = useExperienceStore();
const copy = computed(() => pwaLocales[experience.selectedLanguage]);
const installEvent = ref<BeforeInstallPromptEvent | null>(null);
const installVisible = ref(false);
const ios = ref(false);
let revealTimer: number | undefined;

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({ immediate: true });

function revealInstall(): void {
  if (!isStandaloneDisplay() && !installPromptDismissed() && (installEvent.value || ios.value)) installVisible.value = true;
}

function captureInstall(event: Event): void {
  event.preventDefault();
  installEvent.value = event as BeforeInstallPromptEvent;
  revealInstall();
}

async function install(): Promise<void> {
  if (!installEvent.value) return;
  const prompt = installEvent.value;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  installVisible.value = false;
  installEvent.value = null;
  if (choice.outcome === 'dismissed') rememberInstallDismissal();
}

function dismissInstall(): void {
  installVisible.value = false;
  rememberInstallDismissal();
}

function installed(): void {
  installVisible.value = false;
  installEvent.value = null;
}

onMounted(() => {
  ios.value = isIosSafari();
  window.addEventListener('beforeinstallprompt', captureInstall);
  window.addEventListener('appinstalled', installed);
  revealTimer = window.setTimeout(revealInstall, 9000);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', captureInstall);
  window.removeEventListener('appinstalled', installed);
  if (revealTimer) window.clearTimeout(revealTimer);
});
</script>

<template>
  <aside v-if="needRefresh" class="pwa-prompt pwa-update" role="status" aria-live="polite">
    <div><small>THE OUTSIDE // PWA</small><strong>{{ copy.updateTitle }}</strong><p>{{ copy.updateCopy }}</p></div>
    <div class="pwa-prompt-actions"><button type="button" @click="updateServiceWorker(true)">{{ copy.updateAction }}</button><button type="button" class="pwa-dismiss" :aria-label="copy.dismiss" @click="needRefresh = false">×</button></div>
  </aside>

  <aside v-else-if="installVisible" class="pwa-prompt" role="region" :aria-label="copy.installTitle">
    <div><small>THE OUTSIDE // PWA</small><strong>{{ copy.installTitle }}</strong><p>{{ ios && !installEvent ? copy.iosInstruction : copy.installCopy }}</p></div>
    <div class="pwa-prompt-actions"><button v-if="installEvent" type="button" @click="install">{{ copy.installAction }}</button><button type="button" class="pwa-dismiss" :aria-label="copy.dismiss" @click="dismissInstall">×</button></div>
  </aside>

  <button v-else-if="offlineReady" type="button" class="pwa-offline-ready" @click="offlineReady = false">{{ copy.offlineReady }} <span aria-hidden="true">×</span></button>
</template>
