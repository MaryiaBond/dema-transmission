<script setup lang="ts">
import { computed, ref } from 'vue';
import AtmosphereImage from './AtmosphereImage.vue';
import { demaAssets } from './dema-assets';
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
    <AtmosphereImage
      class="level-complete-image"
      :src="demaAssets.level01Complete.src"
      alt=""
      decorative
      :fit="demaAssets.level01Complete.fit"
      :position="demaAssets.level01Complete.position"
      :mobile-position="demaAssets.level01Complete.mobilePosition"
      :width="demaAssets.level01Complete.width"
      :height="demaAssets.level01Complete.height"
      :aspect-ratio="demaAssets.level01Complete.aspectRatio"
      :overlay="demaAssets.level01Complete.overlay"
      sizes="(max-width: 768px) calc(100vw - 30px), 52vw"
    />
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
