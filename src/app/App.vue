<script setup lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import HeroSection from '@/components/layout/HeroSection.vue';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue';
import SiteFooter from '@/components/layout/SiteFooter.vue';
import SiteHeader from '@/components/layout/SiteHeader.vue';
import StoryGlossary from '@/components/story/StoryGlossary.vue';
import StoryReader from '@/components/story/StoryReader.vue';
import WatchlistSection from '@/components/story/WatchlistSection.vue';
import ArchiveView from '@/features/archive/ArchiveView.vue';
import CitizenInvitation from '@/components/citizenship/CitizenInvitation.vue';
import PwaPrompts from '@/features/pwa/PwaPrompts.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';
import { useCitizenshipStore } from '@/stores/citizenship';
import type { GlossaryId } from '@/types/content';

const store = useExperienceStore();
const citizenship = useCitizenshipStore();
const ArchiveDialog = defineAsyncComponent(() => import('@/features/archive/ArchiveDialog.vue'));
const { locale, t } = useI18n();
const progress = ref(0);
const scrolled = ref(false);
const archiveOpen = ref(false);
const glossaryOpen = ref(false);
const currentTerm = ref<GlossaryId | null>(null);
let revealObserver: IntersectionObserver | null = null;

function syncScroll(): void {
  const y = window.scrollY;
  const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.value = Math.min(1, y / height);
  scrolled.value = y > 30;
}
function openTerm(term: string): void {
  if (!['blurryface', 'dema', 'bishops', 'clancy', 'banditos', 'ned', 'seizing', 'torchbearer'].includes(term)) return;
  currentTerm.value = term as GlossaryId;
  glossaryOpen.value = true;
}
function setupRevealObserver(): void {
  revealObserver?.disconnect();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
    return;
  }
  revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.06, rootMargin: '0px 0px 30px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach((element) => revealObserver?.observe(element));
}

watch(() => store.selectedLanguage, async (language) => {
  locale.value = language;
  const content = getLocaleContent(language);
  document.documentElement.lang = content.locale;
  document.title = content.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', content.description);
  await nextTick();
  setupRevealObserver();
}, { immediate: true });

onMounted(() => {
  void citizenship.initialize();
  window.addEventListener('scroll', syncScroll, { passive: true });
  syncScroll();
  setupRevealObserver();
});
onBeforeUnmount(() => {
  citizenship.dispose();
  window.removeEventListener('scroll', syncScroll);
  revealObserver?.disconnect();
});
</script>

<template>
  <div class="read-progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>
  <div class="grain" aria-hidden="true"></div>
  <a class="skip-link" href="#chapter-0">{{ t('ui.skip') }}</a>
  <SiteHeader :scrolled="scrolled" @open-archive="archiveOpen = true" />
  <LanguageSwitcher />
  <main id="top">
    <HeroSection />
    <StoryReader @term="openTerm" />
    <WatchlistSection />
    <ArchiveView @open="archiveOpen = true" />
    <CitizenInvitation />
    <PwaPrompts />
  </main>
  <SiteFooter />
  <StoryGlossary :open="glossaryOpen" :term="currentTerm" @close="glossaryOpen = false" />
  <ArchiveDialog v-if="archiveOpen" :open="archiveOpen" @close="archiveOpen = false" />
</template>
