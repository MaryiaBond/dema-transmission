<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import ChapterNavigation from '@/components/layout/ChapterNavigation.vue';
import StoryChapter from './StoryChapter.vue';
import { chapters } from '@/content/chapters';
import { useExperienceStore } from '@/stores/experience';

const emit = defineEmits<{ term: [term: string] }>();
const store = useExperienceStore();
const stream = ref<HTMLElement | null>(null);
let chapterObserver: IntersectionObserver | null = null;

onMounted(async () => {
  await nextTick();
  if ('IntersectionObserver' in window && stream.value) {
    chapterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) store.currentChapter = Number((entry.target as HTMLElement).dataset.chapter ?? 0);
    }), { rootMargin: '-20% 0px -58% 0px' });
    stream.value.querySelectorAll<HTMLElement>('.chapter').forEach((element) => chapterObserver?.observe(element));
  }
  const legacyHash = window.location.hash.match(/^#(?:cycle-\d+-)?chapter-([0-6])$/);
  if (legacyHash) requestAnimationFrame(() => document.querySelector(`#chapter-${legacyHash[1]}`)?.scrollIntoView());
});

onBeforeUnmount(() => chapterObserver?.disconnect());
</script>

<template>
  <div class="story-layout">
    <ChapterNavigation />
    <div id="storyStream" ref="stream" class="story-stream">
      <div class="chapters story-sequence">
        <StoryChapter v-for="chapter in chapters" :key="chapter.id" :chapter="chapter" @term="emit('term', $event)" />
      </div>
    </div>
  </div>
</template>
