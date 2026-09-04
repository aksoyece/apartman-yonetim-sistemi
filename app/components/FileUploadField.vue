<script setup lang="ts">
defineProps<{
  modelValue?: File | null
  label?: string
  accept?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const input = ref<HTMLInputElement | null>(null)

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  emit('update:modelValue', file)
}

function clear() {
  emit('update:modelValue', null)
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div class="space-y-2">
    <p
      v-if="label"
      class="text-sm font-medium"
    >
      {{ label }}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <input
        ref="input"
        type="file"
        class="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-inverted"
        :accept="accept || 'image/jpeg,image/png,image/webp,application/pdf'"
        @change="onChange"
      >
      <UButton
        v-if="modelValue"
        size="xs"
        color="neutral"
        variant="soft"
        icon="i-lucide-x"
        @click="clear"
      >
        Kaldır
      </UButton>
    </div>
    <p
      v-if="hint || modelValue"
      class="text-xs text-muted"
    >
      {{ modelValue ? modelValue.name : hint }}
    </p>
  </div>
</template>
