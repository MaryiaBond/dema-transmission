<script setup lang="ts">
import { ref } from 'vue';
import RichText from '@/components/common/RichText.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';

defineProps<{ scrolled: boolean }>();
const emit = defineEmits<{ openArchive: [] }>();
const store = useExperienceStore();
const menuOpen = ref(false);

function closeMenu(): void {
  menuOpen.value = false;
  document.body.classList.remove('nav-open');
}
function toggleMenu(): void {
  menuOpen.value = !menuOpen.value;
  document.body.classList.toggle('nav-open', menuOpen.value);
}
function archive(): void { closeMenu(); emit('openArchive'); }
</script>

<template>
  <header id="header" class="header" :class="{ 'is-scrolled': scrolled }">
    <div class="header-inner">
      <a class="brand" href="#top" :aria-label="getLocaleContent(store.selectedLanguage).ui.brandAria"><span class="brand-sign">|-/</span><span class="brand-name">THE <b>OUTSIDE</b><small>{{ getLocaleContent(store.selectedLanguage).ui.brandTagline }}</small></span></a>
      <div class="header-chapter">{{ getLocaleContent(store.selectedLanguage).ui.here }}: {{ getLocaleContent(store.selectedLanguage).ui.chapters[store.currentChapter] }}</div>
      <nav class="mode-switch" :aria-label="getLocaleContent(store.selectedLanguage).ui.modeAria">
        <a :href="`#cycle-${store.currentCycle}-chapter-0`" class="mode active" aria-current="page"><RichText :content="getLocaleContent(store.selectedLanguage).ui.read" /></a>
        <button type="button" class="mode" @click="emit('openArchive')"><RichText :content="getLocaleContent(store.selectedLanguage).ui.explore" /></button>
      </nav>
      <button class="menu-button" type="button" :aria-label="getLocaleContent(store.selectedLanguage).ui[menuOpen ? 'menuClose' : 'menuOpen']" :aria-expanded="menuOpen" aria-controls="mobileMenu" @click="toggleMenu"><span></span><span></span></button>
    </div>
    <nav id="mobileMenu" class="mobile-menu" :class="{ open: menuOpen }" :aria-label="getLocaleContent(store.selectedLanguage).ui.mobileNav">
      <a v-for="(chapter, index) in getLocaleContent(store.selectedLanguage).ui.mobileChapters" :key="index" :href="`#cycle-${store.currentCycle}-chapter-${index}`" @click="closeMenu">{{ chapter }}</a>
      <button type="button" @click="archive">{{ getLocaleContent(store.selectedLanguage).ui.mobileArchive }}</button>
    </nav>
  </header>
</template>
