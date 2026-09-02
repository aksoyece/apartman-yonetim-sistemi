<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { profile } = useAuth()
const { items: apartments, fetchMine, pending: aptPending } = useApartments()
const { items: dues, fetchByApartmentIds, pending: duesPending } = useDues()
const { items: announcements, fetchAll: fetchAnnouncements } = useAnnouncements()
const { items: maintenance, fetchMine: fetchMaintenance } = useMaintenance()

const pending = computed(() => aptPending.value || duesPending.value)

const pendingDuesTotal = computed(() =>
  dues.value
    .filter(d => d.status !== 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)
)

const paidDuesTotal = computed(() =>
  dues.value
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)
)

const openMaintenanceCount = computed(() =>
  maintenance.value.filter(m => m.status === 'open' || m.status === 'in_progress').length
)

onMounted(async () => {
  await fetchMine()
  const ids = apartments.value.map(a => a.id)
  await Promise.all([
    fetchByApartmentIds(ids),
    fetchAnnouncements(false),
    fetchMaintenance()
  ])
})
</script>

<template>
  <div>
    <PageHeader
      title="Hoş geldiniz"
      :description="`${profile?.full_name || 'Kat maliki'}, dairenize ait özet bilgiler.`"
    />

    <LoadingState v-if="pending" />

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Dairelerim"
          :value="String(apartments.length)"
          icon="i-lucide-door-open"
          tone="info"
        />
        <StatCard
          title="Bekleyen Borç"
          :value="formatCurrency(pendingDuesTotal)"
          icon="i-lucide-clock-3"
          tone="warning"
        />
        <StatCard
          title="Ödenen Aidat"
          :value="formatCurrency(paidDuesTotal)"
          icon="i-lucide-circle-check"
          tone="success"
        />
        <StatCard
          title="Açık Arızalarım"
          :value="String(openMaintenanceCount)"
          icon="i-lucide-wrench"
          tone="error"
        />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-default bg-default p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">
            Son Duyurular
          </h2>
          <EmptyState
            v-if="!announcements.length"
            title="Duyuru yok"
            description="Yönetim duyuru yayınladığında burada görünecek."
            icon="i-lucide-megaphone"
          />
          <ul
            v-else
            class="space-y-3"
          >
            <li
              v-for="item in announcements.slice(0, 4)"
              :key="item.id"
              class="rounded-xl bg-elevated/60 px-3 py-3"
            >
              <div class="mb-1 flex items-center gap-2">
                <p class="font-medium">
                  {{ item.title }}
                </p>
                <UBadge
                  :color="priorityColors[item.priority]"
                  variant="subtle"
                  size="sm"
                >
                  {{ priorityLabels[item.priority] }}
                </UBadge>
              </div>
              <p class="line-clamp-2 text-sm text-muted">
                {{ item.content }}
              </p>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-default bg-default p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">
            Bekleyen Aidatlar
          </h2>
          <EmptyState
            v-if="!dues.filter(d => d.status !== 'paid').length"
            title="Borç bulunmuyor"
            description="Tüm aidatlarınız ödenmiş görünüyor."
            icon="i-lucide-badge-check"
          />
          <ul
            v-else
            class="space-y-3"
          >
            <li
              v-for="item in dues.filter(d => d.status !== 'paid').slice(0, 5)"
              :key="item.id"
              class="flex items-center justify-between gap-3 rounded-xl bg-elevated/60 px-3 py-3"
            >
              <div>
                <p class="text-sm font-medium">
                  {{ item.period }} · {{ apartmentLabel(item.apartment) }}
                </p>
                <p class="text-xs text-muted">
                  Vade: {{ formatDate(item.due_date) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold">
                  {{ formatCurrency(item.amount) }}
                </p>
                <UBadge
                  :color="dueStatusColors[item.status]"
                  variant="subtle"
                  size="sm"
                >
                  {{ dueStatusLabels[item.status] }}
                </UBadge>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
