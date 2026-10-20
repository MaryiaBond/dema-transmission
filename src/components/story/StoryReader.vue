<script setup lang="ts">
import { ref } from 'vue';
import ChapterNavigation from '@/components/layout/ChapterNavigation.vue';
import StoryCycle from './StoryCycle.vue';
import { useStoryCycle } from '@/features/story-cycle/useStoryCycle';
import { useExperienceStore } from '@/stores/experience';

const emit = defineEmits<{ term: [term: string] }>();
const store = useExperienceStore();
const stream = ref<HTMLElement | null>(null);
const { renderedCycles } = useStoryCycle(stream);
</script>

<template>
  <div class="story-layout">
    <ChapterNavigation />
    <div id="cycleStream" ref="stream" class="cycle-stream">
      <StoryCycle
        v-for="cycle in renderedCycles"
        :key="cycle"
        :cycle="cycle"
        :current="cycle === store.currentCycle"
        :terminal="cycle === 21 && store.endingUnlocked"
        @term="emit('term', $event)"
      />
    </div>
  </div>
</template>
