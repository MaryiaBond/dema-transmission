<script setup lang="ts">
import RichText from '@/components/common/RichText.vue';
import MusicLinks from './MusicLinks.vue';
import { getLocaleContent } from '@/content/locales';
import { playlistMedia } from '@/content/music';
import { useExperienceStore } from '@/stores/experience';

const store = useExperienceStore();
function format(template: string, name: string): string { return template.replace('{name}', name); }
</script>

<template>
  <section id="watchlist" class="watchlist" aria-labelledby="watchTitle" data-scroll-anchor>
    <div class="wrap">
      <div class="watch-intro reveal"><div><div class="pretitle">{{ getLocaleContent(store.selectedLanguage).watchlist.pretitle }}</div><h2 id="watchTitle"><RichText :content="getLocaleContent(store.selectedLanguage).watchlist.title" /></h2></div><p>{{ getLocaleContent(store.selectedLanguage).watchlist.copy }}</p></div>
      <div class="watch-list">
        <article v-for="({ media, album }, index) in playlistMedia" :key="media.id" class="watch-row">
          <span class="watch-n">{{ String(index + 1).padStart(2, '0') }}</span>
          <a :href="media.youtube" target="_blank" rel="noopener noreferrer" class="watch-img" :aria-label="format(getLocaleContent(store.selectedLanguage).ui.youtubeWatch, media.title)"><div class="watch-img-fallback">|-/</div><img class="loadable is-loaded" :src="media.image" :alt="format(getLocaleContent(store.selectedLanguage).ui.preview, media.title)" loading="lazy"></a>
          <div class="watch-name"><span>{{ getLocaleContent(store.selectedLanguage).playlist[index]?.[2] }}</span><strong>{{ getLocaleContent(store.selectedLanguage).playlist[index]?.[0] }}</strong><small>{{ getLocaleContent(store.selectedLanguage).playlist[index]?.[1] }}</small></div>
          <div class="watch-buttons"><a data-service="youtube" :href="media.youtube" target="_blank" rel="noopener noreferrer" :aria-label="format(getLocaleContent(store.selectedLanguage).ui.youtubeLabel, media.title)">YT <span>↗</span></a><MusicLinks v-if="album" :album="album" compact /></div>
        </article>
      </div>
      <div class="watch-outro"><span>{{ getLocaleContent(store.selectedLanguage).watchlist.note }}</span><a href="#top">{{ getLocaleContent(store.selectedLanguage).watchlist.top }}</a></div>
    </div>
  </section>
</template>
