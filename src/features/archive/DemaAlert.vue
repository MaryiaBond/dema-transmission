<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'danger' | 'info' | 'success';
  title: string;
  message?: string;
  compact?: boolean;
}>(), { variant: 'info', message: '', compact: false });
</script>

<template>
  <div class="dema-alert" :class="[`dema-alert-${variant}`, { 'is-compact': compact }]" :role="variant === 'danger' ? 'alert' : 'status'" aria-live="polite">
    <i aria-hidden="true">{{ variant === 'danger' ? '!' : variant === 'success' ? '✓' : '∴' }}</i>
    <div><strong>{{ title }}</strong><p v-if="message">{{ message }}</p></div>
  </div>
</template>
