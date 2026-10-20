<script setup lang="ts">
import { computed, ref } from 'vue';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';

const emit = defineEmits<{ archive: []; achievements: []; story: [] }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const stage = ref<'complete' | 'future'>('complete');
</script>

<template>
  <section class="level-complete-scene" data-testid="level-complete-scene">
    <div class="level-static" aria-hidden="true"></div>
    <div v-if="stage === 'complete'" class="level-complete-record">
      <span>D//LEVEL-CLEARANCE-01</span><h1>{{ ui.levelComplete }}</h1><p>{{ ui.levelCompleteCopy }}</p>
      <div><small>{{ ui.newClearance }}</small><strong>UNDER OBSERVATION</strong></div>
      <button type="button" @click="stage = 'future'">{{ ui.registerClearance }}</button>
    </div>
    <div v-else class="future-planning">
      <span>{{ ui.level02 }}</span><h1>{{ ui.futureTitle }}</h1><div class="future-emoji" aria-label="poop and unicorn">💩 🦄</div><p>{{ ui.futureCopy }}</p><strong>{{ ui.remainEmployed }}</strong>
      <div class="future-actions"><button type="button" @click="emit('archive')">{{ ui.returnToArchive }}</button><button type="button" @click="emit('achievements')">{{ ui.reviewAchievements }}</button><button type="button" @click="emit('story')">{{ ui.returnStory }}</button></div>
    </div>
  </section>
</template>
