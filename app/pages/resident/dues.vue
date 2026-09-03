<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items: apartments, fetchMine } = useApartments()
const { items, pending, error, fetchByApartmentIds } = useDues()

const debtTotal = computed(() =>
  items.value.filter(d => d.status !== 'paid').reduce((sum, d) => sum + Number(d.amount), 0)
)

onMounted(async () => {
  await fetchMine()
  await fetchByApartmentIds(apartments.value.map(a => a.id))
})
</script>

<template>
  <div>
    <PageHeader
      title="Aidat ve Borç Durumu"
      description="Dairenize ait aidat kayıtları ve ödeme durumları."
    >
      <template #actions>
        <UBadge
          color="warning"
          variant="subtle"
          size="lg"
        >
          Toplam borç: {{ formatCurrency(debtTotal) }}
        </UBadge>
      </template>
    </PageHeader>

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="() => fetchByApartmentIds(apartments.map(a => a.id))"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Aidat kaydı yok"
      description="Yönetici aidat tanımladığında burada görünecek."
      icon="i-lucide-receipt"
    />

    <DataTableShell v-else>
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-muted dark:bg-white/5">
          <tr>
            <th class="px-4 py-3 font-medium">
              Daire
            </th>
            <th class="px-4 py-3 font-medium">
              Dönem
            </th>
            <th class="px-4 py-3 font-medium">
              Tutar
            </th>
            <th class="px-4 py-3 font-medium">
              Vade
            </th>
            <th class="px-4 py-3 font-medium">
              Durum
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
            <td class="px-4 py-3">
              {{ item.period }}
            </td>
            <td class="px-4 py-3">
              {{ formatCurrency(item.amount) }}
            </td>
            <td class="px-4 py-3">
              {{ formatDate(item.due_date) }}
            </td>
            <td class="px-4 py-3">
              <UBadge
                :color="dueStatusColors[item.status]"
                variant="subtle"
              >
                {{ dueStatusLabels[item.status] }}
              </UBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </DataTableShell>
  </div>
</template>
