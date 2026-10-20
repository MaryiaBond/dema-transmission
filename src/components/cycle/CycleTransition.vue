<script setup lang="ts">
import { computed } from 'vue';
import RichText from '@/components/common/RichText.vue';
import { getLocaleContent } from '@/content/locales';
import { storyVideos } from '@/content/music';
import { useLanguageDrift } from '@/features/language-drift/useLanguageDrift';
import type { LanguageCode, LocalizedText, RichNode } from '@/types/content';

const props = defineProps<{ cycle: number }>();
const { languageFor } = useLanguageDrift();
interface Fragment { language: LanguageCode; content: LocalizedText | RichNode }
function pick(id: string, priority: number, getter: (language: LanguageCode) => LocalizedText | RichNode): Fragment {
  const language = languageFor(id, props.cycle, priority);
  return { language, content: getter(language) };
}
const signal = computed(() => pick('cycle.signal', 1, (language) => getLocaleContent(language).cycle.signal));
const title = computed(() => pick('cycle.title', 5, (language) => getLocaleContent(language).cycle.title));
const copy = computed(() => [0, 1].map((index) => pick(`cycle.copy.${index}`, 3, (language) => getLocaleContent(language).cycle.copy[index] ?? { type: 'text', value: '' })));
const video = computed(() => pick('cycle.video', 2, (language) => getLocaleContent(language).cycle.video));
const continues = computed(() => pick('cycle.continues', 4, (language) => getLocaleContent(language).cycle.continues));
const beginning = computed(() => pick('cycle.beginning', 5, (language) => getLocaleContent(language).cycle.beginning));
</script>

<template>
  <section :id="`cycle-${cycle}-finale`" class="cycle-finale" data-cycle-final tabindex="-1" :aria-labelledby="`cycle-${cycle}-finale-title`" data-scroll-anchor>
    <div class="cycle-static" aria-hidden="true"></div>
    <div class="cycle-finale-inner">
      <span class="cycle-signal reveal" :lang="signal.language">{{ signal.content }}</span>
      <h2 :id="`cycle-${cycle}-finale-title`" class="cycle-finale-title reveal" :lang="title.language"><RichText :content="title.content" /></h2>
      <div class="cycle-finale-copy reveal"><RichText v-for="(fragment, index) in copy" :key="index" :content="fragment.content" :language="fragment.language" /></div>
      <a class="cycle-video-link reveal" :href="storyVideos.heavydirtysoul.youtube" target="_blank" rel="noopener noreferrer" :aria-label="getLocaleContent(video.language).cycle.videoAria" :lang="video.language"><RichText :content="video.content" /></a>
      <div class="cycle-return reveal"><span :lang="continues.language">{{ continues.content }}</span><strong :lang="beginning.language">{{ beginning.content }}</strong><i aria-hidden="true">↓</i></div>
    </div>
    <span class="cycle-complete-sentinel" data-cycle-complete-sentinel :data-cycle="cycle" aria-hidden="true"></span>
  </section>
</template>
