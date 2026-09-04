<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items: apartments, fetchMine: fetchApartments, pending: aptPending, mineReady } = useApartments()
const { items, pending, error, fetchMine } = usePayments()

const loading = computed(() =>
  ((aptPending.value || !mineReady.value) && !apartments.value.length)
  || (pending.value && !items.value.length)
)

function load() {
  void Promise.all([fetchApartments(), fetchMine()])
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Ödeme Geçmişi"
      description="Dairenize ait tahsilat kayıtları."
    />

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="load"
    />
    <LoadingState v-else-if="loading" />
    <EmptyState
      v-else-if="!apartments.length"
      title="Atanmış daire yok"
      description="Ödeme geçmişi için yöneticinin sizi bir daireye ataması gerekir."
      icon="i-lucide-door-open"
    />
    <EmptyState
      v-else-if="!items.length"
      title="Ödeme geçmişi boş"
      description="Yönetici veya siz ödeme kaydettiğinizde burada listelenir."
      icon="i-lucide-wallet"
    />

    <DataTableShell v-else>
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-muted dark:bg-white/5">
          <tr>
            <th class="px-4 py-3 font-medium">
              Daire
            </th>
            <th class="px-4 py-3 font-medium">
              Tutar
            </th>
            <th class="px-4 py-3 font-medium">
              Tarih
            </th>
            <th class="px-4 py-3 font-medium">
              Yöntem
            </th>
            <th class="px-4 py-3 font-medium">
              Not
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-t border-default"
          >
            <td class="px-4 py-3 font-medium">
              {{ apartmentLabel(item.apartment) }}
            </td>
            <td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(item.amount) }}
            </td>
            <td class="px-4 py-3">
              {{ formatDate(item.payment_date) }}
            </td>
            <td class="px-4 py-3">
              {{ paymentMethodLabels[item.method] }}
            </td>
            <td class="px-4 py-3 text-slate-500 dark:text-slate-400">
              {{ item.notes || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </DataTableShell>
  </div>
</template>
