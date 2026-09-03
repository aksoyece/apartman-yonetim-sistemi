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
    tone: 'info' as const
  },
  {
    title: 'Toplanan Aidat',
    value: formatCurrency(stats.value.collectedDues),
    icon: 'i-lucide-circle-check',
    tone: 'success' as const
  },
  {
    title: 'Bekleyen Aidat',
    value: formatCurrency(stats.value.pendingDues),
    icon: 'i-lucide-clock-3',
    tone: 'warning' as const
  },
  {
    title: 'Toplam Gider',
    value: formatCurrency(stats.value.totalExpenses),
    icon: 'i-lucide-trending-down',
    tone: 'error' as const
  },
  {
    title: 'Net Bakiye',
    value: formatCurrency(stats.value.netBalance),
    icon: 'i-lucide-wallet',
    tone: 'default' as const
  },
  {
    title: 'Açık Arıza',
    value: String(stats.value.openMaintenance),
    icon: 'i-lucide-wrench',
    tone: 'warning' as const
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
          variant="soft"
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
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          v-for="card in statCards"
          :key="card.title"
          v-bind="card"
        />
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-5">
        <div class="rounded-2xl border border-default bg-default p-5 shadow-sm xl:col-span-3">
          <div class="mb-4">
            <h2 class="text-lg font-semibold">
              Aylık Gelir - Gider
            </h2>
            <p class="text-sm text-muted">
              Son dönem karşılaştırması
            </p>
          </div>
          <IncomeExpenseChart :data="chartData" />
        </div>

        <div class="rounded-2xl border border-default bg-default p-5 shadow-sm xl:col-span-2">
          <div class="mb-4">
            <h2 class="text-lg font-semibold">
              Son Ödemeler
            </h2>
            <p class="text-sm text-muted">
              En güncel tahsilatlar
            </p>
          </div>

          <EmptyState
            v-if="!recentPayments.length"
            title="Ödeme yok"
            description="Henüz kayıtlı ödeme bulunmuyor."
            icon="i-lucide-wallet"
          />

          <ul
            v-else
            class="space-y-3"
          >
            <li
              v-for="payment in recentPayments"
              :key="payment.id"
              class="flex items-center justify-between gap-3 rounded-xl bg-elevated/60 px-3 py-3"
            >
              <div>
                <p class="text-sm font-medium">
                  {{ apartmentLabel(payment.apartment) }}
                </p>
                <p class="text-xs text-muted">
                  {{ formatDate(payment.payment_date) }} · {{ paymentMethodLabels[payment.method] }}
                </p>
              </div>
              <p class="text-sm font-semibold text-success">
                {{ formatCurrency(payment.amount) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
