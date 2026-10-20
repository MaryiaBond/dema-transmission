<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { pwaLocales } from '@/content/pwa-locales';
import { useExperienceStore } from '@/stores/experience';
import { installGuide, isStandaloneDisplay, type InstallGuide } from './pwa-utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const experience = useExperienceStore();
const copy = computed(() => pwaLocales[experience.selectedLanguage]);
const installEvent = ref<BeforeInstallPromptEvent | null>(null);
const installed = ref(false);
const guideOpen = ref(false);
const guide = ref<InstallGuide>('generic');
const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({ immediate: true });

const fallbackInstruction = computed(() => guide.value === 'safari'
  ? copy.value.safariInstruction
  : guide.value === 'firefox' ? copy.value.firefoxInstruction : copy.value.genericInstruction);

function captureInstall(event: Event): void {
  event.preventDefault();
  installEvent.value = event as BeforeInstallPromptEvent;
}

async function requestInstall(): Promise<void> {
  if (!installEvent.value) {
    guide.value = installGuide();
    guideOpen.value = true;
    return;
  }
  const prompt = installEvent.value;
  installEvent.value = null;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === 'accepted') installed.value = true;
}

function markInstalled(): void {
  installed.value = true;
  installEvent.value = null;
  guideOpen.value = false;
}

onMounted(() => {
  installed.value = isStandaloneDisplay();
  guide.value = installGuide();
  window.addEventListener('beforeinstallprompt', captureInstall);
  window.addEventListener('appinstalled', markInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', captureInstall);
  window.removeEventListener('appinstalled', markInstalled);
});
</script>

<template>
  <section v-if="!installed" id="install-game" class="pwa-install-footer" data-testid="pwa-install-cta" aria-labelledby="install-game-title">
    <div class="wrap pwa-install-inner">
      <div><small>THE OUTSIDE // PORTABLE ARCHIVE</small><h2 id="install-game-title">{{ copy.footerTitle }}</h2><p>{{ copy.installCopy }}</p></div>
      <button type="button" @click="requestInstall"><span aria-hidden="true">⇩</span>{{ copy.installAction }}</button>
    </div>
  </section>

  <BaseModal :open="guideOpen" labelledby="install-guide-title" class-name="pwa-install-dialog" @close="guideOpen = false">
    <button type="button" class="dialog-close" :aria-label="copy.close" @click="guideOpen = false">✕</button>
    <small>THE OUTSIDE // INSTALLATION</small>
    <h2 id="install-guide-title">{{ copy.guideTitle }}</h2>
    <ol v-if="guide === 'ios-safari'"><li v-for="step in copy.iosSteps" :key="step">{{ step }}</li></ol>
    <p v-else>{{ fallbackInstruction }}</p>
  </BaseModal>

  <aside v-if="needRefresh" class="pwa-prompt pwa-update" role="status" aria-live="polite">
    <div><small>THE OUTSIDE // PWA</small><strong>{{ copy.updateTitle }}</strong><p>{{ copy.updateCopy }}</p></div>
    <div class="pwa-prompt-actions"><button type="button" @click="updateServiceWorker(true)">{{ copy.updateAction }}</button><button type="button" class="pwa-dismiss" :aria-label="copy.close" @click="needRefresh = false">×</button></div>
  </aside>

  <button v-else-if="offlineReady" type="button" class="pwa-offline-ready" @click="offlineReady = false">{{ copy.offlineReady }} <span aria-hidden="true">×</span></button>
</template>
