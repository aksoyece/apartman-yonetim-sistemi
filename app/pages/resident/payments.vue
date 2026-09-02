<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items: apartments, fetchMine } = useApartments()
const { items, pending, error, fetchByApartmentIds } = usePayments()

onMounted(async () => {
  await fetchMine()
  await fetchByApartmentIds(apartments.value.map(a => a.id))
})
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
      @retry="() => fetchByApartmentIds(apartments.map(a => a.id))"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Ödeme geçmişi boş"
      description="Yönetici ödeme kaydettiğinde burada listelenir."
      icon="i-lucide-wallet"
    />

    <div
      v-else
      class="overflow-hidden rounded-2xl border border-default bg-default"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-elevated/70 text-left text-muted">
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
              <td class="px-4 py-3 font-medium text-success">
                {{ formatCurrency(item.amount) }}
              </td>
              <td class="px-4 py-3">
                {{ formatDate(item.payment_date) }}
              </td>
              <td class="px-4 py-3">
                {{ paymentMethodLabels[item.method] }}
              </td>
              <td class="px-4 py-3">
                {{ item.notes || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
