<script setup lang="ts">
import { computed } from 'vue';
import { archiveAchievements, archiveText } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useArchiveStore } from '@/stores/archive';
import { useExperienceStore } from '@/stores/experience';

const archive = useArchiveStore();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
</script>

<template>
  <section class="achievement-passport" data-testid="achievement-passport">
    <header><div><span>D//21</span><strong>{{ ui.archivist }}</strong></div><code>{{ archive.progress.employeeId }} // {{ archive.progress.clearanceLevel }}</code></header>
    <div class="passport-grid">
      <article v-for="achievement in archiveAchievements" :key="achievement.id" :class="{ earned: archive.progress.achievements.some((item) => item.id === achievement.id) }">
        <i aria-hidden="true">{{ archive.progress.achievements.some((item) => item.id === achievement.id) ? '●' : '○' }}</i>
        <div><small>{{ archive.progress.achievements.some((item) => item.id === achievement.id) ? ui.earned : ui.notEarned }}</small><h3>{{ archiveText(achievement.title, experience.selectedLanguage) }}</h3><p>{{ archiveText(achievement.description, experience.selectedLanguage) }}</p></div>
      </article>
    </div>
  </section>
</template>
