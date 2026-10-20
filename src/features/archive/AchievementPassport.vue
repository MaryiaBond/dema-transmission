<script setup lang="ts">
import { computed } from 'vue';
import { archiveAchievements, archiveText } from '@/content/archive-content';
import { archiveLocales } from '@/content/archive-locales';
import { useArchiveStore } from '@/stores/archive';
import { useExperienceStore } from '@/stores/experience';

const archive = useArchiveStore();
const experience = useExperienceStore();
const ui = computed(() => archiveLocales[experience.selectedLanguage]);
const classifiedDate = computed(() => archive.progress.level01CompletedAt
  ? new Intl.DateTimeFormat(experience.selectedLanguage, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(archive.progress.level01CompletedAt))
  : '');
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
    <aside v-if="archive.progress.level01CompletedAt" class="classified-personnel-note" data-testid="classified-personnel-note">
      <header><span>{{ ui.classifiedRecord }}</span><time :datetime="archive.progress.level01CompletedAt">{{ classifiedDate }}</time></header>
      <small>{{ ui.classifiedDocument }}</small>
      <p>{{ ui.classifiedNote }}</p>
      <strong :aria-label="ui.classifiedRecord">CLASSIFIED</strong>
    </aside>
  </section>
</template>
