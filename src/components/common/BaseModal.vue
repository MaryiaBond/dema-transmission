<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{ open: boolean; labelledby: string; className: string }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement | null>(null);

function sync(open: boolean): void {
  const element = dialog.value;
  if (!element) return;
  if (open && !element.open) element.showModal();
  if (!open && element.open) element.close();
}

onMounted(() => sync(props.open));
watch(() => props.open, sync);
</script>

<template>
  <dialog ref="dialog" :class="className" :aria-labelledby="labelledby" @close="emit('close')" @click.self="emit('close')">
    <slot />
  </dialog>
</template>
