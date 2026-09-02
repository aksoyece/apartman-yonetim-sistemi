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
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border border-default bg-default p-5 shadow-sm"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <h2 class="text-lg font-semibold">
            {{ item.title }}
          </h2>
          <UBadge
            :color="priorityColors[item.priority]"
            variant="subtle"
          >
            {{ priorityLabels[item.priority] }}
          </UBadge>
        </div>
        <p class="whitespace-pre-wrap text-sm text-muted">
          {{ item.content }}
        </p>
        <p class="mt-3 text-xs text-muted">
          {{ formatDateTime(item.published_at) }}
        </p>
      </article>
    </div>
  </div>
</template>
