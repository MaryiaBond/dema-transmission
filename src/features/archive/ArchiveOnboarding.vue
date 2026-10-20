<script setup lang="ts">
import { computed, ref } from 'vue';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';

defineProps<{ firstEnteredAt: string }>();
const emit = defineEmits<{ complete: [] }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const step = ref(0);
</script>

<template>
  <section class="archive-onboarding" data-testid="archive-onboarding">
    <div class="onboarding-seal" aria-hidden="true">021</div>
    <div class="onboarding-terminal">
      <span>D//CENTRAL ARCHIVE // INTAKE</span>
      <template v-if="step === 0">
        <h1>{{ ui.welcome }}</h1>
        <p>{{ ui.candidacyApproved }}</p><p>{{ ui.reasonsClassified }}</p>
      </template>
      <template v-else-if="step === 1">
        <small>{{ ui.employeeSince }} // {{ new Date(firstEnteredAt).toLocaleDateString(experience.selectedLanguage) }}</small>
        <h1>EMPLOYEE 021</h1><p>{{ ui.assignedId }}</p>
      </template>
      <template v-else>
        <h1>{{ ui.archivist }}</h1><p>{{ ui.contradictionsRule }}</p><p>{{ ui.unofficial }}</p>
      </template>
      <div class="onboarding-progress" aria-hidden="true"><i v-for="index in 3" :key="index" :class="{ active: index - 1 <= step }"></i></div>
      <button v-if="step < 2" type="button" @click="step += 1">{{ ui.onboardingNext }}</button>
      <button v-else type="button" @click="emit('complete')">{{ ui.beginWork }}</button>
    </div>
  </section>
</template>
