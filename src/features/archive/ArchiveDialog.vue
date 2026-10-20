<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue';
import ArchiveWorkspace from './ArchiveWorkspace.vue';
import './archive.css';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <BaseModal :open="open" labelledby="archiveWorkspaceTitle" class-name="archive-dialog archive-game-dialog" @close="emit('close')">
    <h2 id="archiveWorkspaceTitle" class="visually-hidden">THE ARCHIVE</h2>
    <ArchiveWorkspace @close="emit('close')" />
  </BaseModal>
</template>
