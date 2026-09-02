<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-default bg-default px-6 py-16">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-8 animate-spin text-primary"
    />
    <p class="mt-3 text-sm text-muted">
      {{ label || 'Yükleniyor...' }}
    </p>
  </div>
</template>
