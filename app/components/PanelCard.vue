<template>
  <div class="panel-card p-5">
    <div
      v-if="$slots.header || $slots.actions"
      class="mb-4 flex flex-wrap items-start justify-between gap-3"
    >
      <div>
        <slot name="header" />
      </div>
      <div
        v-if="$slots.actions"
        class="flex flex-wrap gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </div>
</template>
