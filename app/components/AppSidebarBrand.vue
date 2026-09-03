<script setup lang="ts">
defineProps<{
  subtitle: string
  icon?: string
}>()
</script>

<template>
  <div class="mb-8 flex items-center gap-3 px-2">
    <div class="flex h-10 w-10 items-center justify-center rounded-[5px] border border-line bg-soft text-ink">
      <UIcon
        :name="icon || 'i-lucide-building-2'"
        class="size-5"
      />
    </div>
    <div>
      <p class="font-display text-base font-semibold tracking-tight text-ink">
        Apartman YS
      </p>
      <p class="text-xs text-muted-ink">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
