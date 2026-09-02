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
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border border-default bg-default p-5 shadow-sm"
      >
        <div class="mb-4 flex items-center gap-3">
          <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UIcon
              name="i-lucide-door-open"
              class="size-5"
            />
          </div>
          <div>
            <h2 class="text-lg font-semibold">
              {{ apartmentLabel(item) }}
            </h2>
            <p class="text-sm text-muted">
              Kat {{ item.floor }}
            </p>
          </div>
        </div>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">
              Alan
            </dt>
            <dd>{{ item.area_m2 ? `${item.area_m2} m²` : '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">
              Blok
            </dt>
            <dd>{{ item.block || '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">
              Not
            </dt>
            <dd class="text-right">
              {{ item.notes || '—' }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
