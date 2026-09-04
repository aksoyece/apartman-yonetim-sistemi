<script setup lang="ts">
defineProps<{
  subtitle: string
  icon?: string
}>()
</script>

<template>
  <div class="mb-8 flex items-center gap-3 px-2">
    <img
      src="/yonetix-logo.svg"
      alt="YönetiX"
      class="size-10 shrink-0 object-contain"
    >
    <div>
      <p class="font-display text-base font-semibold tracking-tight text-ink">
        Yöneti<span class="text-accent">X</span>
      </p>
      <p class="text-xs text-muted-ink">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
