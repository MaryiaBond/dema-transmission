<script setup lang="ts">
import RichText from '@/components/common/RichText.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';

const emit = defineEmits<{ open: [] }>();
const store = useExperienceStore();
</script>

<template>
  <section id="archiveInvite" class="archive-invite" aria-labelledby="archiveTitle" :data-denied="getLocaleContent(store.selectedLanguage).archive.denied" data-scroll-anchor>
    <div class="wrap archive-invite-inner"><div class="archive-icon" aria-hidden="true">∴</div><div><span class="pretitle">{{ getLocaleContent(store.selectedLanguage).archive.pretitle }}</span><h2 id="archiveTitle"><RichText :content="getLocaleContent(store.selectedLanguage).archive.title" /></h2><p>{{ getLocaleContent(store.selectedLanguage).archive.copy }}</p><button type="button" class="action-primary" @click="emit('open')">{{ getLocaleContent(store.selectedLanguage).archive.button }}</button></div></div>
  </section>
</template>
