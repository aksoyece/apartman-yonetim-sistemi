<script setup lang="ts">
defineProps<{
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  csv: []
  pdf: []
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      icon="i-lucide-file-spreadsheet"
      color="neutral"
      variant="soft"
      :loading="loading"
      :disabled="disabled"
      @click="emit('csv')"
    >
      CSV
    </UButton>
    <UButton
      icon="i-lucide-file-text"
      color="neutral"
      variant="soft"
      :loading="loading"
      :disabled="disabled"
      @click="emit('pdf')"
    >
      PDF
    </UButton>
  </div>
</template>
