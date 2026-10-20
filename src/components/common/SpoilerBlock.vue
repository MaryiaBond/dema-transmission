<script setup lang="ts">
import { ref } from 'vue';
import RichText from './RichText.vue';
import type { RichContent } from '@/types/content';

defineProps<{ cycle: number; head: RichContent; button: string; content: RichContent; language: string }>();
const expanded = ref(false);
</script>

<template>
  <div :id="`cycle-${cycle}-spoiler-box`" class="spoiler-box reveal">
    <div class="spoiler-head" :lang="language"><RichText :content="head" /></div>
    <button
      :id="`cycle-${cycle}-spoiler-button`"
      class="spoiler-button"
      type="button"
      :aria-expanded="expanded"
      :aria-controls="`cycle-${cycle}-spoiler-content`"
      @click="expanded = !expanded"
    ><span>{{ button }}</span><span>{{ expanded ? '−' : '+' }}</span></button>
    <div :id="`cycle-${cycle}-spoiler-content`" class="spoiler-content" :lang="language" :hidden="!expanded">
      <RichText :content="content" />
    </div>
  </div>
</template>
