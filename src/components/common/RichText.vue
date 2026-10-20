<script setup lang="ts">
import RichNode from './RichNode.vue';
import type { LocalizedText, RichContent, RichNode as StoryRichNode } from '@/types/content';

const props = defineProps<{ content: LocalizedText | StoryRichNode; language?: string }>();
function nodes(): RichContent {
  if (typeof props.content === 'string') return [{ type: 'text', value: props.content }];
  return Array.isArray(props.content) ? props.content : [props.content];
}
</script>

<template>
  <template v-for="(node, index) in nodes()" :key="index">
    <RichNode v-if="language" :node="node" :language="language" />
    <RichNode v-else :node="node" />
  </template>
</template>
