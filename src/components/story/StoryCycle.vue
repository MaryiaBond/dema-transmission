<script setup lang="ts">
import CycleEnding from '@/components/cycle/CycleEnding.vue';
import CycleTransition from '@/components/cycle/CycleTransition.vue';
import StoryChapter from './StoryChapter.vue';
import { chapters } from '@/content/chapters';

defineProps<{ cycle: number; current: boolean; terminal: boolean }>();
const emit = defineEmits<{ term: [term: string] }>();
</script>

<template>
  <div class="chapters story-cycle" :class="{ 'is-current': current }" :data-cycle="cycle">
    <StoryChapter v-for="chapter in chapters" :key="chapter.id" :chapter="chapter" :cycle="cycle" @term="emit('term', $event)" />
    <CycleTransition :cycle="cycle" />
    <CycleEnding v-if="terminal" :cycle="cycle" />
  </div>
</template>
