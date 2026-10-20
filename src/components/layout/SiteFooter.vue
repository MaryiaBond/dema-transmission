<script setup lang="ts">
import RichText from '@/components/common/RichText.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';

const store = useExperienceStore();
</script>

<template>
  <footer class="footer"><div class="wrap footer-inner"><div><a class="footer-brand" href="#top">|-/ THE OUTSIDE</a><p>{{ getLocaleContent(store.selectedLanguage).footer.about }}</p></div><div><span>{{ getLocaleContent(store.selectedLanguage).footer.media }}</span><a href="https://www.youtube.com/@twentyonepilots" target="_blank" rel="noopener noreferrer">{{ getLocaleContent(store.selectedLanguage).footer.youtube }}</a><a href="https://open.spotify.com/artist/3YQKmKGau1PzlVlkL1iodx" target="_blank" rel="noopener noreferrer">{{ getLocaleContent(store.selectedLanguage).footer.spotify }}</a></div><div><span>{{ getLocaleContent(store.selectedLanguage).footer.sources }}</span><p><RichText :content="getLocaleContent(store.selectedLanguage).footer.credits" /></p></div></div><div class="footer-base wrap"><span>{{ getLocaleContent(store.selectedLanguage).footer.experience }}</span><span>{{ getLocaleContent(store.selectedLanguage).footer.unofficial }}</span><span>STAY ALIVE /-/</span></div></footer>
</template>
