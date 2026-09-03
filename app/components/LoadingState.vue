<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="panel-card flex flex-col items-center justify-center px-6 py-14">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-6 animate-spin text-accent"
    />
    <p class="mt-3 text-sm text-muted-ink">
      {{ label || 'Yükleniyor...' }}
    </p>
  </div>
</template>
