<script setup lang="ts">
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';

defineProps<{ cycle: number }>();
const store = useExperienceStore();
</script>

<template>
  <section :id="`cycle-${cycle}-terminal`" class="cycle-terminal" tabindex="-1" :aria-labelledby="`cycle-${cycle}-terminal-title`" data-scroll-anchor :lang="store.initialLanguage">
    <div class="cycle-terminal-inner">
      <span class="cycle-terminal-code">{{ getLocaleContent(store.initialLanguage).cycle.terminalCode }}</span>
      <p class="cycle-terminal-before">{{ getLocaleContent(store.initialLanguage).cycle.terminalBefore }}</p>
      <h2 :id="`cycle-${cycle}-terminal-title`">{{ getLocaleContent(store.initialLanguage).cycle.terminalTitle }}</h2>
      <p class="cycle-terminal-count">{{ getLocaleContent(store.initialLanguage).cycle.terminalCount }}</p>
      <p class="cycle-terminal-copy">{{ getLocaleContent(store.initialLanguage).cycle.terminalCopy }}</p>
      <strong class="cycle-terminal-signoff">{{ getLocaleContent(store.initialLanguage).cycle.terminalSignoff }}</strong>
    </div>
  </section>
</template>
