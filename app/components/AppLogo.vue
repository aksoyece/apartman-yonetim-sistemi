<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
}>(), {
  size: 'md',
  showWordmark: true
})
</script>

<template>
  <div class="flex items-center gap-3">
    <img
      src="/yonetix-logo.svg"
      alt="YönetiX"
      class="shrink-0 object-contain"
      :class="{
        'size-8': size === 'sm',
        'size-10': size === 'md',
        'size-14': size === 'lg',
        'size-20 sm:size-24': size === 'xl'
      }"
    >
    <p
      v-if="showWordmark"
      class="font-display font-semibold tracking-tight text-ink"
      :class="{
        'text-base': size === 'sm' || size === 'md',
        'text-2xl': size === 'lg',
        'text-3xl sm:text-4xl': size === 'xl'
      }"
    >
      Yöneti<span class="text-accent">X</span>
    </p>
  </div>
</template>
