<script setup lang="ts">
import { computed, ref } from 'vue';
import { archiveText, assessmentQuestions, assessmentResult } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useArchiveStore } from '@/stores/archive';
import { useExperienceStore } from '@/stores/experience';
import type { AssessmentAnswerId } from '@/types/archive';

const emit = defineEmits<{ complete: [] }>();
const archive = useArchiveStore();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const firstUnanswered = assessmentQuestions.findIndex((question) => !archive.progress.assessmentAnswers[question.id]);
const index = ref(firstUnanswered < 0 ? 0 : firstUnanswered);
const current = computed(() => assessmentQuestions[index.value]!);
const chosen = computed({
  get: () => archive.progress.assessmentAnswers[current.value.id] ?? '',
  set: (value: string) => archive.answerAssessment(current.value.id, value as AssessmentAnswerId)
});
function advance(): void {
  if (!chosen.value) return;
  if (index.value < assessmentQuestions.length - 1) index.value += 1;
  else archive.completeAssessment();
}
</script>

<template>
  <section class="compliance-scene" data-testid="compliance-assessment">
    <div class="compliance-scan" aria-hidden="true"></div>
    <div v-if="archive.progress.assessmentCompletedAt" class="compliance-result">
      <span>{{ assessmentResult.code }}</span><h2>{{ archiveText(assessmentResult.title, experience.selectedLanguage) }}</h2><p>{{ archiveText(assessmentResult.detail, experience.selectedLanguage) }}</p>
      <details class="assessment-review"><summary>{{ ui.recordedAnswers }}</summary><ol><li v-for="question in assessmentQuestions" :key="question.id"><strong>{{ archiveText(question.prompt, experience.selectedLanguage) }}</strong><span>{{ archiveText(question.answers.find((answer) => answer.id === archive.progress.assessmentAnswers[question.id])!.text, experience.selectedLanguage) }}</span></li></ol></details>
      <button type="button" @click="emit('complete')">{{ ui.continue }}</button>
    </div>
    <div v-else class="compliance-question">
      <header><span>{{ ui.assessment }}</span><strong>{{ String(index + 1).padStart(2, '0') }} / 09</strong></header>
      <p class="compliance-intro">{{ ui.assessmentIntro }}</p>
      <div class="compliance-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</div>
      <h2>{{ archiveText(current.prompt, experience.selectedLanguage) }}</h2>
      <div class="compliance-options">
        <label v-for="answer in current.answers" :key="answer.id"><input v-model="chosen" type="radio" :name="current.id" :value="answer.id"><span>{{ archiveText(answer.text, experience.selectedLanguage) }}</span></label>
      </div>
      <button type="button" :disabled="!chosen" @click="advance">{{ index === 8 ? ui.submit : ui.next }}</button>
    </div>
  </section>
</template>
