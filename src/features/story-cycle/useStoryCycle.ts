import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { CYCLE_LIMIT } from './cycle-engine';
import { useExperienceStore } from '@/stores/experience';

interface ReadingState { started: boolean; expectedChapter: number }

export function useStoryCycle(root: Ref<HTMLElement | null>) {
  const store = useExperienceStore();
  const readingStates = new Map<number, ReadingState>();
  const renderedCycles = computed(() => {
    const cycle = store.currentCycle;
    const values: number[] = [];
    if (cycle > 1) values.push(cycle - 1);
    values.push(cycle);
    if (cycle < CYCLE_LIMIT && !store.endingUnlocked) values.push(cycle + 1);
    return values;
  });
  let chapterObserver: IntersectionObserver | null = null;
  let completionObserver: IntersectionObserver | null = null;
  let revealObserver: IntersectionObserver | null = null;
  let lastIntent = 0;
  let lastScrollY = 0;
  let direction = 1;
  let compensating = false;
  let dayTimer = 0;

  function hasReadingIntent(): boolean {
    return !compensating && direction >= 0 && Date.now() - lastIntent < 2600;
  }
  function noteIntent(event: Event): void {
    if (!event.isTrusted) return;
    lastIntent = Date.now();
    const state = readingStates.get(store.currentCycle);
    if (store.currentChapter === 0 && state) { state.started = true; state.expectedChapter = 1; }
  }
  function onScroll(): void {
    const y = window.scrollY;
    if (!compensating && Math.abs(y - lastScrollY) > 1) direction = y >= lastScrollY ? 1 : -1;
    lastScrollY = y;
  }
  function stateFor(cycle: number): ReadingState {
    const existing = readingStates.get(cycle);
    if (existing) return existing;
    const state = { started: false, expectedChapter: 1 };
    readingStates.set(cycle, state);
    return state;
  }
  function visitChapter(section: HTMLElement): void {
    const cycle = Number(section.dataset.cycle);
    const chapter = Number(section.dataset.chapter);
    if (cycle !== store.currentCycle) return;
    store.currentChapter = chapter;
    if (!hasReadingIntent()) return;
    const state = stateFor(cycle);
    if (chapter === 0) { state.started = true; state.expectedChapter = 1; }
    else if (state.started && chapter === state.expectedChapter) state.expectedChapter = chapter + 1;
  }
  function complete(sentinel: HTMLElement): void {
    const cycle = Number(sentinel.dataset.cycle);
    const state = stateFor(cycle);
    if (cycle !== store.currentCycle || !hasReadingIntent() || !state.started || state.expectedChapter !== 7) return;
    store.finishCycle(cycle);
  }
  function observe(): void {
    chapterObserver?.disconnect();
    completionObserver?.disconnect();
    revealObserver?.disconnect();
    if (!root.value || !('IntersectionObserver' in window)) return;
    chapterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && visitChapter(entry.target as HTMLElement)), { rootMargin: '-20% 0px -58% 0px' });
    completionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && complete(entry.target as HTMLElement)), { rootMargin: '0px 0px 8% 0px' });
    root.value.querySelectorAll<HTMLElement>('.chapter').forEach((element) => chapterObserver?.observe(element));
    root.value.querySelectorAll<HTMLElement>('[data-cycle-complete-sentinel]').forEach((element) => completionObserver?.observe(element));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      }), { threshold: 0.06, rootMargin: '0px 0px 30px 0px' });
      root.value.querySelectorAll('.reveal:not(.visible)').forEach((element) => revealObserver?.observe(element));
    } else root.value.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  }

  watch(() => store.currentCycle, async (cycle) => {
    const anchor = root.value?.querySelector<HTMLElement>(`.story-cycle[data-cycle="${cycle}"]`);
    const before = anchor?.getBoundingClientRect().top;
    await nextTick();
    if (anchor && before != null) {
      const delta = anchor.getBoundingClientRect().top - before;
      if (Math.abs(delta) > 0.5) {
        compensating = true;
        window.scrollBy({ top: delta, behavior: 'auto' });
        requestAnimationFrame(() => { compensating = false; lastScrollY = window.scrollY; });
      }
    }
    stateFor(cycle);
    observe();
  });
  watch(renderedCycles, async () => { await nextTick(); observe(); });

  onMounted(async () => {
    lastScrollY = window.scrollY;
    stateFor(store.currentCycle);
    window.addEventListener('scroll', onScroll, { passive: true });
    for (const type of ['wheel', 'touchmove', 'pointerdown']) window.addEventListener(type, noteIntent, { passive: true });
    window.addEventListener('keydown', noteIntent);
    dayTimer = window.setInterval(() => store.resetForNewDay(), 30000);
    await nextTick();
    observe();
    const legacyHash = window.location.hash.match(/^#chapter-([0-6])$/);
    if (legacyHash) requestAnimationFrame(() => root.value?.querySelector(`#cycle-${store.currentCycle}-chapter-${legacyHash[1]}`)?.scrollIntoView());
  });
  onBeforeUnmount(() => {
    chapterObserver?.disconnect(); completionObserver?.disconnect(); revealObserver?.disconnect();
    window.removeEventListener('scroll', onScroll);
    for (const type of ['wheel', 'touchmove', 'pointerdown']) window.removeEventListener(type, noteIntent);
    window.removeEventListener('keydown', noteIntent);
    window.clearInterval(dayTimer);
  });

  return { renderedCycles };
}
