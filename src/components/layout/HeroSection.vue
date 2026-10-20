<script setup lang="ts">
import RichText from '@/components/common/RichText.vue';
import { getLocaleContent } from '@/content/locales';
import { useExperienceStore } from '@/stores/experience';

const store = useExperienceStore();
</script>

<template>
  <section class="hero" aria-labelledby="heroTitle" data-scroll-anchor>
    <div class="hero-image"><div class="hero-image-art"></div><img src="https://images.kerrangcdn.com/images/twenty-one-pilots-Clancy-era-promo-2024-2025-credit-Ashley-Osborn.jpg?auto=compress&amp;fit=max&amp;w=2048" :alt="getLocaleContent(store.selectedLanguage).hero.alt" class="loadable" fetchpriority="high" /><span class="photo-credit">{{ getLocaleContent(store.selectedLanguage).hero.photoCredit }}</span></div>
    <div class="hero-inner wrap">
      <div class="hero-meta reveal"><RichText :content="getLocaleContent(store.selectedLanguage).hero.meta" /></div>
      <p class="hero-before reveal">T W E N T Y &nbsp; O N E &nbsp; P I L O T S</p>
      <h1 id="heroTitle" class="hero-title reveal"><RichText :content="getLocaleContent(store.selectedLanguage).hero.title" /></h1>
      <p class="hero-copy reveal">{{ getLocaleContent(store.selectedLanguage).hero.copy }}</p>
      <div class="hero-actions reveal"><a href="#chapter-0" class="action-primary"><RichText :content="getLocaleContent(store.selectedLanguage).hero.enter" /></a><a href="https://www.youtube.com/watch?v=ozlHHR_eSxc" target="_blank" rel="noopener noreferrer" class="action-quiet"><RichText :content="getLocaleContent(store.selectedLanguage).hero.prologue" /></a></div>
    </div>
    <div class="hero-bottom"><span>{{ getLocaleContent(store.selectedLanguage).hero.scroll }}</span><div class="scroll-mark" aria-hidden="true"><span></span></div><span class="hero-coordinate">40°06'15.0"N — OUTSIDE</span></div>
    <div class="hero-number" aria-hidden="true">21</div>
  </section>
</template>
