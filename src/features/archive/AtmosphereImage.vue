<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import type { DemaAssetFit, DemaAssetOverlay } from './dema-assets';

const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  label?: string;
  eager?: boolean;
  fit?: DemaAssetFit;
  position?: string;
  mobilePosition?: string;
  sizes?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  overlay?: DemaAssetOverlay;
  decorative?: boolean;
}>(), {
  label: '',
  eager: false,
  fit: 'cover',
  position: 'center',
  mobilePosition: '',
  sizes: '100vw',
  aspectRatio: '16 / 9',
  overlay: 'soft',
  decorative: false
});

const loaded = ref(false);
const failed = ref(false);
const imageStyle = computed<CSSProperties>(() => ({
  '--atmosphere-fit': props.fit,
  '--atmosphere-position': props.position,
  '--atmosphere-position-mobile': props.mobilePosition || props.position,
  '--atmosphere-ratio': props.aspectRatio
} as CSSProperties));

watch(() => props.src, () => {
  loaded.value = false;
  failed.value = false;
});
</script>

<template>
  <figure class="atmosphere-image" :class="[`overlay-${overlay}`, { 'is-loaded': loaded, 'is-missing': failed }]" :style="imageStyle">
    <div class="atmosphere-fallback" :aria-hidden="!failed || decorative" :role="failed && !decorative ? 'img' : undefined" :aria-label="failed && !decorative ? alt : undefined"><span>∴</span><i></i><i></i><i></i></div>
    <img v-if="!failed" :src="src" :alt="decorative ? '' : alt" :aria-hidden="decorative" :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : 'auto'" :sizes="sizes" :width="width" :height="height" decoding="async" @load="loaded = true" @error="failed = true">
    <figcaption v-if="label"><span>{{ label }}</span><small>D//VISUAL RECORD</small></figcaption>
  </figure>
</template>
