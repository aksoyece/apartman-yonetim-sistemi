<script setup lang="ts">
defineProps<{
  title: string
  value: string
  icon: string
  hint?: string
  /** Sadece gerçekten kritik/olumsuz değerde true — sayı kiremit kırmızısı olur */
  critical?: boolean
}>()
</script>

<template>
  <div class="panel-card panel-card-interactive p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-ink">
          {{ title }}
        </p>
        <p
          class="mt-2 font-display text-2xl font-semibold tracking-tight"
          :class="critical ? 'text-danger' : 'text-ink'"
        >
          {{ value }}
        </p>
        <p
          v-if="hint"
          class="mt-1 text-xs text-muted-ink"
        >
          {{ hint }}
        </p>
      </div>
      <div class="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-soft text-muted-ink">
        <UIcon
          :name="icon"
          class="size-4"
        />
      </div>
    </div>
  </div>
</template>
