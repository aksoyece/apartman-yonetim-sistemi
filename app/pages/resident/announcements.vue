<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items, pending, error, fetchAll } = useAnnouncements()

onMounted(() => fetchAll(false))
</script>

<template>
  <div>
    <PageHeader
      title="Duyurular"
      description="Yönetim tarafından yayınlanan aktif duyurular."
    />

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="() => fetchAll(false)"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Aktif duyuru yok"
      description="Yeni duyurular yayınlandığında burada görünecek."
      icon="i-lucide-megaphone"
    />

    <div
      v-else
      class="space-y-4"
    >
      <PanelCard
        v-for="item in items"
        :key="item.id"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
            {{ item.title }}
          </h2>
          <UBadge
            :color="priorityColors[item.priority]"
            variant="subtle"
          >
            {{ priorityLabels[item.priority] }}
          </UBadge>
        </div>
        <p class="whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">
          {{ item.content }}
        </p>
        <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {{ formatDateTime(item.published_at) }}
        </p>
      </PanelCard>
    </div>
  </div>
</template>
