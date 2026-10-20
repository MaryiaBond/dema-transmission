<script setup lang="ts">
import RichText from '@/components/common/RichText.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';

const store = useExperienceStore();
</script>

<template>
  <aside class="chapter-rail" :aria-label="getLocaleContent(store.selectedLanguage).ui.railAria">
    <div class="rail-title"><RichText :content="getLocaleContent(store.selectedLanguage).ui.railTitle" /></div>
    <a
      v-for="(chapter, index) in getLocaleContent(store.selectedLanguage).ui.chapters"
      :key="index"
      class="rail-link"
      :class="{ active: store.currentChapter === index }"
      :href="`#chapter-${index}`"
      :data-chapter="index"
      :aria-current="store.currentChapter === index ? 'location' : undefined"
    ><span>{{ String(index).padStart(2, '0') }}</span> {{ chapter }} <i></i></a>
    <div class="rail-bottom"><span class="rail-indicator"></span><span>{{ getLocaleContent(store.selectedLanguage).ui.railStatus }}</span></div>
  </aside>
</template>
