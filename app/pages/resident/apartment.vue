<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items, pending, error, fetchMine } = useApartments()

onMounted(fetchMine)
</script>

<template>
  <div>
    <PageHeader
      title="Daire Bilgilerim"
      description="Size atanmış dairelerin detayları."
    />

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="fetchMine"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Atanmış daire yok"
      description="Yöneticinin sizi bir daireye atamasını bekleyin."
      icon="i-lucide-door-open"
    />

    <div
      v-else
      class="grid gap-4 md:grid-cols-2"
    >
      <PanelCard
        v-for="item in items"
        :key="item.id"
      >
        <div class="mb-4 flex items-center gap-3">
          <div class="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <UIcon
              name="i-lucide-door-open"
              class="size-5"
            />
          </div>
          <div>
            <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
              {{ apartmentLabel(item) }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Kat {{ item.floor }}
            </p>
          </div>
        </div>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500 dark:text-slate-400">
              Alan
            </dt>
            <dd>{{ item.area_m2 ? `${item.area_m2} m²` : '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500 dark:text-slate-400">
              Blok
            </dt>
            <dd>{{ item.block || '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500 dark:text-slate-400">
              Not
            </dt>
            <dd class="text-right">
              {{ item.notes || '—' }}
            </dd>
          </div>
        </dl>
      </PanelCard>
    </div>
  </div>
</template>
