<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import { archiveAchievements, archiveText } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useExperienceStore } from '@/stores/experience';
import type { AchievementId } from '@/types/archive';

const props = defineProps<{ id: AchievementId }>();
const emit = defineEmits<{ close: [] }>();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const achievement = computed(() => archiveAchievements.find((item) => item.id === props.id)!);
let timer = 0;
watch(() => props.id, () => { window.clearTimeout(timer); timer = window.setTimeout(() => emit('close'), 3600); }, { immediate: true });
onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <aside class="achievement-toast" role="status" aria-live="polite">
    <span>{{ ui.achievementUnlocked }}</span><strong>{{ archiveText(achievement.title, experience.selectedLanguage) }}</strong><i aria-hidden="true">D//✓</i>
  </aside>
</template>
