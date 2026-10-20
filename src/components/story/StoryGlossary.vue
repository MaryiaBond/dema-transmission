<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';
import type { GlossaryId } from '@/types/content';

const props = defineProps<{ open: boolean; term: GlossaryId | null }>();
const emit = defineEmits<{ close: [] }>();
const store = useExperienceStore();
</script>

<template>
  <BaseModal :open="open" labelledby="termTitle" class-name="term-dialog" @close="emit('close')">
    <button type="button" class="dialog-close" :aria-label="getLocaleContent(store.selectedLanguage).ui.close" @click="emit('close')">✕</button>
    <div class="term-dialog-label">{{ getLocaleContent(store.selectedLanguage).glossaryUi.label }}</div>
    <h2 v-if="term" id="termTitle" :lang="store.selectedLanguage">{{ getLocaleContent(store.selectedLanguage).glossary[term].title }}</h2>
    <p v-if="term" :lang="store.selectedLanguage">{{ getLocaleContent(store.selectedLanguage).glossary[term].desc }}</p>
    <div v-if="term" class="term-source" :lang="store.selectedLanguage">{{ getLocaleContent(store.selectedLanguage).glossary[term].source }}</div>
    <div class="dialog-foot">{{ getLocaleContent(store.selectedLanguage).glossaryUi.end }}</div>
  </BaseModal>
</template>
