<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-1 text-sm text-muted"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-wrap items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
