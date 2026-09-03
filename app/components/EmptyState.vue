<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
  quiet?: boolean
  message?: string
}>(), {
  quiet: false
})
</script>

<template>
  <p
    v-if="quiet"
    class="py-6 text-sm text-muted-ink"
  >
    {{ message || description || 'Henüz veri yok — ilk kaydı ekleyin.' }}
  </p>
  <div
    v-else
    class="flex flex-col items-center justify-center rounded-[5px] border border-dashed border-line bg-surface px-6 py-14 text-center"
  >
    <div class="mb-3 flex size-10 items-center justify-center rounded-[5px] bg-soft text-muted-ink">
      <UIcon
        :name="icon || 'i-lucide-inbox'"
        class="size-5"
      />
    </div>
    <h3 class="font-display text-lg font-semibold text-ink">
      {{ title || 'Kayıt bulunamadı' }}
    </h3>
    <p class="mt-1 max-w-sm text-sm text-muted-ink">
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
