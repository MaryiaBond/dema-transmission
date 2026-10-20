<script setup lang="ts">
import { computed } from 'vue';
import type { RichNode } from '@/types/content';

defineOptions({ name: 'RichNode' });
const props = defineProps<{ node: RichNode; language?: string }>();

const safeAttributes = computed(() => {
  if (props.node.type !== 'element') return {};
  const allowed = new Set(['aria-hidden', 'class', 'data-term', 'href', 'rel', 'target']);
  const attributes = Object.fromEntries(Object.entries(props.node.attrs).filter(([name]) => allowed.has(name)));
  return props.language ? { ...attributes, lang: props.language } : attributes;
});
</script>

<template>
  <template v-if="node.type === 'text'">{{ node.value }}</template>
  <component :is="node.tag" v-else v-bind="safeAttributes">
    <RichNode v-for="(child, index) in node.children" :key="index" :node="child" />
  </component>
</template>
