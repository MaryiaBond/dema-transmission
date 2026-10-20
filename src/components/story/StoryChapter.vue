<script setup lang="ts">
import { computed } from 'vue';
import RichText from '@/components/common/RichText.vue';
import SpoilerBlock from '@/components/common/SpoilerBlock.vue';
import MusicLinks from './MusicLinks.vue';
import StoryMedia from './StoryMedia.vue';
import { getLocaleContent } from '@/content/locales';
import { storyVideos } from '@/content/music';
import { useExperienceStore } from '@/stores/experience';
import type { LanguageCode, LocalizedText, RichContent, RichNode, StoryChapterDefinition } from '@/types/content';

const props = defineProps<{ chapter: StoryChapterDefinition }>();
const emit = defineEmits<{ term: [term: string] }>();
const store = useExperienceStore();

interface Fragment { language: LanguageCode; content: LocalizedText | RichNode }

function pick(id: string, priority: number, getter: (language: LanguageCode) => LocalizedText | RichNode): Fragment {
  void id;
  void priority;
  const language = store.selectedLanguage;
  return { language, content: getter(language) };
}
function languageFor(_id: string, _priority = 3): LanguageCode { return store.selectedLanguage; }
function node(content: RichContent, index: number): RichNode {
  return content[index] ?? { type: 'text', value: '' };
}
function children(content: LocalizedText | RichNode): RichContent {
  if (typeof content === 'string' || Array.isArray(content) || content.type === 'text') return [];
  return content.children;
}

const meta = computed(() => [0, 1, 2].map((index) => props.chapter.number === 0
  ? pick(`origin.meta.${index}`, 1, (language) => node(getLocaleContent(language).origin.meta, index))
  : pick(`chapter.${props.chapter.number}.meta.${index}`, 1, (language) => node(getLocaleContent(language).chapters[props.chapter.number]!.meta, index))));

const title = computed(() => props.chapter.number === 0
  ? pick('origin.prose.1', 5, (language) => node(getLocaleContent(language).origin.prose, 1))
  : pick(`chapter.${props.chapter.number}.title`, 5, (language) => getLocaleContent(language).chapters[props.chapter.number]!.title));

const overline = computed(() => pick(`chapter.${props.chapter.number}.overline`, 2, (language) => getLocaleContent(language).chapters[props.chapter.number]!.overline));

const narrative = computed(() => {
  if (props.chapter.number === 0) return [0, 2, 3, 4].map((index) => pick(`origin.prose.${index}`, [1, 3, 3, 4][index === 0 ? 0 : index - 1] ?? 3, (language) => node(getLocaleContent(language).origin.prose, index)));
  return props.chapter.narrativeBlockIds.map((id, index) => pick(id, index === 0 ? 4 : index === 4 ? 2 : 3, (language) => node(getLocaleContent(language).chapters[props.chapter.number]!.narrative, index)));
});

const tail = computed(() => [0, 1].map((index) => props.chapter.number === 0
  ? pick(`origin.tail.${index}`, 2, (language) => node(getLocaleContent(language).origin.tail, index))
  : pick(`chapter.${props.chapter.number}.tail.${index}`, 2, (language) => node(getLocaleContent(language).chapters[props.chapter.number]!.tail, index))));

const featureHead = computed(() => [0, 1].map((index) => pick(`chapter.${props.chapter.number}.featureHead.${index}`, 1, (language) => node(getLocaleContent(language).chapters[props.chapter.number]!.featureHead ?? [], index))));
const featureAlt = computed(() => pick(`chapter.${props.chapter.number}.alt`, 2, (language) => getLocaleContent(language).chapters[props.chapter.number]!.alt ?? ''));
const featureDescription = computed(() => pick(`chapter.${props.chapter.number}.desc`, 2, (language) => getLocaleContent(language).chapters[props.chapter.number]!.desc ?? ''));
const featureFallback = computed(() => pick(`chapter.${props.chapter.number}.fallback`, 4, (language) => getLocaleContent(language).chapters[props.chapter.number]!.fallback ?? ''));

function onRichClick(event: MouseEvent): void {
  const term = (event.target as Element).closest<HTMLElement>('[data-term]')?.dataset.term;
  if (term) emit('term', term);
}

function nextTarget(): string {
  return props.chapter.number < 6 ? `#chapter-${props.chapter.number + 1}` : '#watchlist';
}
</script>

<template>
  <section
    :id="`chapter-${chapter.number}`"
    :class="['chapter', chapter.className]"
    :data-chapter="chapter.number"
    data-scroll-anchor
    :aria-labelledby="`chapter-title-${chapter.number}`"
    @click="onRichClick"
  >
    <div v-if="chapter.number === 1" class="scenic-bg blurry-mark" aria-hidden="true"><span>BLURRY<br>FACE.</span><div class="nine-circles"><i v-for="n in 9" :key="n"></i></div></div>
    <div v-if="chapter.number === 2" class="trench-city" aria-hidden="true"></div>
    <div v-if="chapter.number === 3" class="scaled-waves" aria-hidden="true"><span>S.A.I.</span></div>
    <div v-if="chapter.number === 4" class="outside-rune" aria-hidden="true"><div class="horn horn-left"></div><div class="horn horn-right"></div><div class="rune-dot"></div></div>
    <div v-if="chapter.number === 5" class="red-tape" aria-hidden="true"><span></span><span></span><span></span></div>
    <div v-if="chapter.number === 6" class="breach-sigil" aria-hidden="true">◯</div>

    <div class="section-inner">
      <div class="chapter-meta reveal"><RichText v-for="(fragment, index) in meta" :key="index" :content="fragment.content" :language="fragment.language" /></div>

      <template v-if="chapter.number === 0">
        <div class="origin-heading reveal">
          <template v-for="(fragment, index) in [0, 1].map((i) => pick(`origin.heading.${i}`, 5, (language) => node(getLocaleContent(language).origin.heading, i)))" :key="index"><RichText :content="fragment.content" /></template>
        </div>
        <div class="origin-grid">
          <div class="origin-prose reveal">
            <RichText :content="narrative[0]!.content" />
            <h2 id="chapter-title-0" :lang="title.language"><RichText :content="children(title.content)" /></h2>
            <template v-for="fragment in narrative.slice(1)" :key="fragment.language + JSON.stringify(fragment.content)"><RichText :content="fragment.content" /></template>
          </div>
          <div class="origin-portraits reveal">
            <div class="portrait portrait-tyler"><div class="portrait-fallback">T</div><img class="loadable is-loaded" src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Tyler_Joseph_on_Clancy_Tour.jpg?width=780" :alt="getLocaleContent(languageFor('origin.tylerAlt', 2)).origin.tylerAlt" loading="lazy"><div class="portrait-caption"><strong>TYLER JOSEPH</strong><small>{{ getLocaleContent(languageFor('origin.tylerRole', 2)).origin.tylerRole }}</small></div></div>
            <div class="portrait portrait-josh"><div class="portrait-fallback">J</div><img class="loadable is-loaded" src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Josh_Dun_Twenty_One_Pilots-0872_%2822797992529%29.jpg?width=780" :alt="getLocaleContent(languageFor('origin.joshAlt', 2)).origin.joshAlt" loading="lazy"><div class="portrait-caption"><strong>JOSH DUN</strong><small>{{ getLocaleContent(languageFor('origin.joshRole', 2)).origin.joshRole }}</small></div></div>
          </div>
        </div>
        <div class="story-quote reveal"><span>“</span><p :lang="languageFor('origin.quote', 4)">{{ getLocaleContent(languageFor('origin.quote', 4)).origin.quote }}</p></div>
      </template>

      <template v-else>
        <div v-if="chapter.number === 2" class="trench-top reveal"><span class="trench-symbol">⦿</span><div><p class="chapter-overline" :lang="overline.language">{{ overline.content }}</p><h2 :id="`chapter-title-${chapter.number}`" class="chapter-title" :lang="title.language"><RichText :content="title.content" /></h2></div></div>
        <template v-else><p class="chapter-overline reveal" :lang="overline.language">{{ overline.content }}</p><h2 :id="`chapter-title-${chapter.number}`" class="chapter-title reveal" :lang="title.language"><RichText :content="title.content" /></h2></template>

        <div :class="['scene-grid', { 'trench-grid': chapter.number === 2 }]">
          <div class="scene-narrative reveal"><RichText v-for="(fragment, index) in narrative" :key="index" :content="fragment.content" :language="fragment.language" /></div>

          <div v-if="chapter.number === 2" class="scene-feature reveal">
            <div class="map-art" role="img" :aria-label="getLocaleContent(languageFor('chapter.2.mapAria', 2)).chapters[2]!.mapAria"><div class="map-outer"><div class="map-city"><div class="map-towers"><i v-for="n in 9" :key="n"></i></div><div class="map-label">DEMA</div></div><div class="map-arrow">↗</div><div class="map-outside">TRENCH<br><small>THE OUTSIDE</small></div></div><span class="map-coord">{{ getLocaleContent(languageFor('chapter.2.mapCoord', 1)).chapters[2]!.mapCoord }}</span></div>
            <div class="map-legend">{{ getLocaleContent(languageFor('chapter.2.mapLegend', 2)).chapters[2]!.mapLegend }}</div>
          </div>

          <div v-else-if="chapter.number === 6" class="final-dossier reveal">
            <div class="dossier-top"><span>{{ getLocaleContent(languageFor('chapter.6.dossier.top', 1)).chapters[6]!.dossier!.top }}</span><span>{{ getLocaleContent(languageFor('chapter.6.dossier.rec', 1)).chapters[6]!.dossier!.rec }}</span></div>
            <div class="dossier-graphic"><div class="dossier-ring ring-one"></div><div class="dossier-ring ring-two"></div><div class="dossier-ring ring-three"></div><span><RichText :content="getLocaleContent(languageFor('chapter.6.dossier.graphic', 4)).chapters[6]!.dossier!.graphic" /></span></div>
            <div class="dossier-end">{{ getLocaleContent(languageFor('chapter.6.dossier.end', 2)).chapters[6]!.dossier!.end }}</div>
          </div>

          <div v-else-if="chapter.feature" class="scene-feature reveal">
            <div class="feature-head"><template v-for="(fragment, index) in featureHead" :key="index"><RichText :content="fragment.content" /></template></div>
            <StoryMedia :media="chapter.feature" :alt="String(featureAlt.content)" :fallback-class="chapter.number === 1 ? 'dark' : chapter.number === 3 ? 'pink' : chapter.number === 4 ? 'green' : 'red'">
              <span v-if="chapter.number === 1">HEAVY<br>DIRTY<br>SOUL</span><span v-else-if="chapter.number === 4">THE<br>OUTSIDE</span><span v-else><RichText :content="featureFallback.content" /></span>
            </StoryMedia>
            <div class="feature-foot"><div><strong>{{ chapter.feature.title }}</strong><span :lang="featureDescription.language">{{ featureDescription.content }}</span></div><a class="link-youtube" :href="chapter.feature.youtube" target="_blank" rel="noopener noreferrer">YOUTUBE ↗</a></div>
            <div v-if="chapter.musicAlbum" class="music-platforms music-platforms-wide"><MusicLinks :album="chapter.musicAlbum" /></div>
          </div>
        </div>

        <div v-if="chapter.number === 2" class="scene-videos reveal">
          <a v-for="(media, index) in chapter.videos" :key="media.id" class="video-strip" :href="media.youtube" target="_blank" rel="noopener noreferrer"><span class="video-strip-n">{{ String(index + 1).padStart(2, '0') }}</span><span class="video-strip-title">{{ media.title.toUpperCase() }}</span><span class="video-strip-desc">{{ getLocaleContent(languageFor(`chapter.2.video.${index}`, 2)).chapters[2]!.videos![index] }}</span><span class="video-strip-play">▶ YOUTUBE ↗</span></a>
          <div class="list-link"><span>{{ getLocaleContent(languageFor('chapter.2.list', 2)).chapters[2]!.list }}</span><div class="music-platforms"><MusicLinks album="trench" /></div></div>
        </div>

        <div v-if="chapter.number === 5" class="two-videos reveal"><a v-for="(media, index) in chapter.videos" :key="media.id" :href="media.youtube" target="_blank" rel="noopener noreferrer"><span>{{ getLocaleContent(languageFor(`chapter.5.video.${index}`, 1)).chapters[5]!.videos![index] }}</span><strong>{{ media.title.toUpperCase() }}</strong><em>{{ getLocaleContent(languageFor('chapter.5.watch', 2)).chapters[5]!.watch }}</em></a></div>

        <SpoilerBlock
          v-if="chapter.number === 6"
          :head="getLocaleContent(languageFor('chapter.6.spoilerHead', 1)).chapters[6]!.spoilerHead!"
          :button="getLocaleContent(languageFor('chapter.6.spoilerButton', 2)).chapters[6]!.spoilerButton!"
          :content="getLocaleContent(languageFor('chapter.6.spoiler', 3)).chapters[6]!.spoiler!"
          :language="languageFor('chapter.6.spoiler', 3)"
        />
        <div v-if="chapter.number === 6" class="story-end reveal"><span>STAY ALIVE.</span><strong>EAST IS UP.</strong></div>
      </template>

      <div class="chapter-tail reveal"><span :lang="tail[0]!.language"><RichText :content="tail[0]!.content" /></span><a :href="nextTarget()" :lang="tail[1]!.language"><RichText :content="children(tail[1]!.content)" /></a></div>
    </div>
  </section>
</template>
