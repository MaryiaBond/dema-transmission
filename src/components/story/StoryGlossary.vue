<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue';
import { computed } from 'vue';
import { getLocaleContent } from '@/content/locales';
import { useLanguageDrift } from '@/features/language-drift/useLanguageDrift';
import { useExperienceStore } from '@/stores/experience';
import type { GlossaryId } from '@/types/content';

const props = defineProps<{ open: boolean; term: GlossaryId | null }>();
const emit = defineEmits<{ close: [] }>();
const store = useExperienceStore();
const { languageFor } = useLanguageDrift();
const titleLanguage = computed(() => languageFor(`glossary.${props.term}.title`, store.currentCycle, 4));
const descLanguage = computed(() => languageFor(`glossary.${props.term}.desc`, store.currentCycle, 3));
const sourceLanguage = computed(() => languageFor(`glossary.${props.term}.source`, store.currentCycle, 1));
</script>

<template>
  <BaseModal :open="open" labelledby="termTitle" class-name="term-dialog" @close="emit('close')">
    <button type="button" class="dialog-close" :aria-label="getLocaleContent(store.selectedLanguage).ui.close" @click="emit('close')">✕</button>
    <div class="term-dialog-label">{{ getLocaleContent(store.selectedLanguage).glossaryUi.label }}</div>
    <h2 v-if="term" id="termTitle" :lang="titleLanguage">{{ getLocaleContent(titleLanguage).glossary[term].title }}</h2>
    <p v-if="term" :lang="descLanguage">{{ getLocaleContent(descLanguage).glossary[term].desc }}</p>
    <div v-if="term" class="term-source" :lang="sourceLanguage">{{ getLocaleContent(sourceLanguage).glossary[term].source }}</div>
    <div class="dialog-foot">{{ getLocaleContent(store.selectedLanguage).glossaryUi.end }}</div>
  </BaseModal>
</template>
