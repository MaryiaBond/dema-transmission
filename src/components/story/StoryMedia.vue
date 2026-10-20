<script setup lang="ts">
import { ref } from 'vue';
import type { StoryMedia } from '@/types/content';

defineProps<{ media: StoryMedia; alt: string; fallbackClass: string }>();
const failed = ref(false);
</script>

<template>
  <a class="feature-frame" :href="media.youtube" target="_blank" rel="noopener noreferrer">
    <div :class="['feature-fallback', fallbackClass]"><slot /></div>
    <img v-if="!failed" class="loadable is-loaded" :src="media.image" :alt="alt" loading="lazy" @error="failed = true" />
    <div class="video-play">▶</div>
  </a>
</template>
