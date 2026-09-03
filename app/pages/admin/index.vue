<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { stats, chartData, recentPayments, pending, error, fetchDashboard } = useDashboard()

onMounted(fetchDashboard)
useRealtimeChannel('admin-dashboard-payments', 'payments', fetchDashboard)
useRealtimeChannel('admin-dashboard-maintenance', 'maintenance_requests', fetchDashboard)

const statCards = computed(() => [
  {
    title: 'Toplam Daire',
    value: String(stats.value.totalApartments),
    icon: 'i-lucide-building-2',
    critical: false
  },
  {
    title: 'Toplanan Aidat',
    value: formatCurrency(stats.value.collectedDues),
    icon: 'i-lucide-circle-check',
    critical: false
  },
  {
    title: 'Bekleyen Aidat',
    value: formatCurrency(stats.value.pendingDues),
    icon: 'i-lucide-clock-3',
    critical: stats.value.pendingDues > 0
  },
  {
    title: 'Toplam Gider',
    value: formatCurrency(stats.value.totalExpenses),
    icon: 'i-lucide-trending-down',
    critical: false
  },
  {
    title: 'Net Bakiye',
    value: formatCurrency(stats.value.netBalance),
    icon: 'i-lucide-wallet',
    critical: stats.value.netBalance < 0
  },
  {
    title: 'Açık Arıza',
    value: String(stats.value.openMaintenance),
    icon: 'i-lucide-wrench',
    critical: stats.value.openMaintenance > 0
  }
])
</script>

<template>
  <div>
    <PageHeader
      title="Dashboard"
      description="Apartman finans ve operasyon özeti."
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          class="border-line"
          :loading="pending"
          @click="fetchDashboard"
        >
          Yenile
        </UButton>
      </template>
    </PageHeader>

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="fetchDashboard"
    />

    <LoadingState v-else-if="pending && !recentPayments.length" />

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          v-for="card in statCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :icon="card.icon"
          :critical="card.critical"
        />
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-5">
        <PanelCard class="xl:col-span-3">
          <template #header>
            <h2 class="font-display text-lg font-semibold text-ink">
              Aylık Gelir - Gider
            </h2>
            <p class="text-sm text-muted-ink">
              Son dönem karşılaştırması
            </p>
          </template>
          <IncomeExpenseChart :data="chartData" />
        </PanelCard>

        <PanelCard class="xl:col-span-2">
          <template #header>
            <h2 class="font-display text-lg font-semibold text-ink">
              Son Ödemeler
            </h2>
            <p class="text-sm text-muted-ink">
              En güncel tahsilatlar
            </p>
          </template>

          <EmptyState
            v-if="!recentPayments.length"
            quiet
            message="Henüz veri yok — ilk kaydı ekleyin."
          />

          <ul
            v-else
            class="space-y-0"
          >
            <li
              v-for="(payment, index) in recentPayments"
              :key="payment.id"
              class="flex items-center justify-between gap-3 py-3"
              :class="index < recentPayments.length - 1 ? 'border-b border-line' : ''"
            >
              <div>
                <p class="text-sm font-medium text-ink">
                  {{ apartmentLabel(payment.apartment) }}
                </p>
                <p class="text-xs text-muted-ink">
                  {{ formatDate(payment.payment_date) }} · {{ paymentMethodLabels[payment.method] }}
                </p>
              </div>
              <p class="text-sm font-semibold text-ink">
                {{ formatCurrency(payment.amount) }}
              </p>
            </li>
          </ul>
        </PanelCard>
      </div>
    </template>
  </div>
</template>
