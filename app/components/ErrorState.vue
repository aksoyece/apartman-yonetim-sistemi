<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <UAlert
    color="error"
    variant="subtle"
    :title="title || 'Bir hata oluştu'"
    :description="message || 'Veriler yüklenirken sorun oluştu.'"
    icon="i-lucide-alert-triangle"
  >
    <template
      v-if="$slots.default || true"
      #actions
    >
      <UButton
        size="sm"
        color="error"
        variant="soft"
        @click="emit('retry')"
      >
        Tekrar Dene
      </UButton>
      <slot />
    </template>
  </UAlert>
</template>
