<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-default/50 px-6 py-16 text-center">
    <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-elevated text-muted">
      <UIcon
        :name="icon || 'i-lucide-inbox'"
        class="size-6"
      />
    </div>
    <h3 class="text-base font-medium">
      {{ title || 'Kayıt bulunamadı' }}
    </h3>
    <p class="mt-1 max-w-sm text-sm text-muted">
      {{ description || 'Henüz buraya eklenecek bir veri yok.' }}
    </p>
    <div
      v-if="$slots.actions"
      class="mt-4"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
