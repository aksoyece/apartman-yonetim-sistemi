<script setup lang="ts">
defineProps<{
  title: string
  value: string
  icon: string
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info'
}>()

const toneClasses: Record<string, string> = {
  default: 'bg-elevated text-default',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info'
}
</script>

<template>
  <div class="rounded-2xl border border-default bg-default p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm text-muted">
          {{ title }}
        </p>
        <p class="mt-2 text-2xl font-semibold tracking-tight">
          {{ value }}
        </p>
        <p
          v-if="hint"
          class="mt-1 text-xs text-muted"
        >
          {{ hint }}
        </p>
      </div>
      <div
        class="flex size-11 items-center justify-center rounded-xl"
        :class="toneClasses[tone || 'default']"
      >
        <UIcon
          :name="icon"
          class="size-5"
        />
      </div>
    </div>
  </div>
</template>
