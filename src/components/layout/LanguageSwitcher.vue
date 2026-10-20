<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useExperienceStore } from '@/stores/experience';
import { getLocaleContent, supportedLanguages } from '@/content/locales';
import type { LanguageCode } from '@/types/content';

const store = useExperienceStore();
const root = ref<HTMLElement | null>(null);
const button = ref<HTMLButtonElement | null>(null);
const optionElements = ref<HTMLButtonElement[]>([]);
const open = ref(false);

function rememberOption(element: unknown): void {
  if (element instanceof HTMLButtonElement && !optionElements.value.includes(element)) optionElements.value.push(element);
}

function close(restoreFocus = false): void {
  open.value = false;
  if (restoreFocus) nextTick(() => button.value?.focus({ preventScroll: true }));
}

function toggle(): void {
  open.value = !open.value;
  if (open.value) nextTick(() => optionElements.value.find((item) => item.dataset.language === store.selectedLanguage)?.focus({ preventScroll: true }));
}

async function selectLanguage(language: LanguageCode): Promise<void> {
  const scrollPosition = window.scrollY;
  document.documentElement.classList.add('is-localizing');
  store.selectLanguage(language, true);
  close(true);
  await nextTick();
  const restorePosition = () => window.scrollTo({ top: scrollPosition, behavior: 'auto' });
  requestAnimationFrame(() => {
    restorePosition();
    requestAnimationFrame(() => {
      restorePosition();
      window.setTimeout(() => {
        restorePosition();
        document.documentElement.classList.remove('is-localizing');
      }, 40);
    });
  });
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) { event.preventDefault(); close(true); return; }
  if (!open.value || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const options = optionElements.value;
  const index = Math.max(0, options.indexOf(document.activeElement as HTMLButtonElement));
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : event.key === 'ArrowDown' ? (index + 1) % options.length : (index - 1 + options.length) % options.length;
  options[next]?.focus({ preventScroll: true });
}

function onPointerDown(event: PointerEvent): void {
  if (open.value && !root.value?.contains(event.target as Node)) close();
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointerDown);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('pointerdown', onPointerDown);
});
</script>

<template>
  <div ref="root" class="language-switcher">
    <button ref="button" class="language-button" type="button" :aria-expanded="open" aria-controls="languageMenu" aria-haspopup="listbox" :aria-label="getLocaleContent(store.selectedLanguage).ui.language" @click="toggle">
      <span>{{ getLocaleContent(store.selectedLanguage).code }}</span><span class="language-chevron" aria-hidden="true"></span>
    </button>
    <div id="languageMenu" class="language-menu" role="listbox" :aria-label="getLocaleContent(store.selectedLanguage).ui.languageMenu" :hidden="!open">
      <button
        v-for="language in supportedLanguages"
        :key="language"
        :ref="rememberOption"
        type="button"
        role="option"
        :data-language="language"
        :aria-selected="store.selectedLanguage === language"
        :tabindex="store.selectedLanguage === language ? 0 : -1"
        @click="selectLanguage(language)"
      >{{ getLocaleContent(language).name }}</button>
    </div>
  </div>
</template>
