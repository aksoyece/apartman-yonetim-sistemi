<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items: dues, fetchAll: fetchDues, pending: duesPending } = useDues()
const { items: payments, fetchAll: fetchPayments, pending: paymentsPending } = usePayments()
const { items: expenses, fetchAll: fetchExpenses, pending: expensesPending } = useExpenses()
const { exportCsv, exportPdf } = useExport()

const exporting = ref(false)
const periodFrom = ref('')
const periodTo = ref('')
const category = ref('all')

const categoryItems = [
  { label: 'Tüm kategoriler', value: 'all' },
  ...expenseCategories.map(value => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value
  }))
]

const pending = computed(() => duesPending.value || paymentsPending.value || expensesPending.value)

const filteredPayments = computed(() =>
  payments.value.filter((p) => {
    if (periodFrom.value && p.payment_date < periodFrom.value) return false
    if (periodTo.value && p.payment_date > periodTo.value) return false
    return true
  })
)

const filteredExpenses = computed(() =>
  expenses.value.filter((e) => {
    if (periodFrom.value && e.expense_date < periodFrom.value) return false
    if (periodTo.value && e.expense_date > periodTo.value) return false
    if (category.value !== 'all' && e.category !== category.value) return false
    return true
  })
)

const filteredDues = computed(() =>
  dues.value.filter((d) => {
    if (periodFrom.value && d.due_date < periodFrom.value) return false
    if (periodTo.value && d.due_date > periodTo.value) return false
    return true
  })
)

const summary = computed(() => {
  const income = filteredPayments.value.reduce((sum, p) => sum + Number(p.amount), 0)
  const expenseTotal = filteredExpenses.value.reduce((sum, e) => sum + Number(e.amount), 0)
  const pendingDues = filteredDues.value
    .filter(d => d.status !== 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)
  const paidDues = filteredDues.value
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  return {
    income,
    expenseTotal,
    net: income - expenseTotal,
    pendingDues,
    paidDues,
    paymentCount: filteredPayments.value.length,
    expenseCount: filteredExpenses.value.length
  }
})

const byCategory = computed(() => {
  const map = new Map<string, number>()
  for (const expense of filteredExpenses.value) {
    map.set(expense.category, (map.get(expense.category) || 0) + Number(expense.amount))
  }
  return [...map.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
})

async function exportSummaryCsv() {
  exporting.value = true
  try {
    exportCsv(
      [
        { metrik: 'Toplam Gelir', deger: summary.value.income },
        { metrik: 'Toplam Gider', deger: summary.value.expenseTotal },
        { metrik: 'Net Bakiye', deger: summary.value.net },
        { metrik: 'Bekleyen Aidat', deger: summary.value.pendingDues },
        { metrik: 'Odenecek Aidat (odenen)', deger: summary.value.paidDues }
      ],
      [
        { key: 'metrik', label: 'Metrik' },
        { key: 'deger', label: 'Deger' }
      ],
      `rapor-ozet-${new Date().toISOString().slice(0, 10)}`
    )
  } finally {
    exporting.value = false
  }
}

async function exportSummaryPdf() {
  exporting.value = true
  try {
    await exportPdf(
      'Apartman Finans Raporu',
      [
        { header: 'Metrik', dataKey: 'metrik' },
        { header: 'Deger', dataKey: 'deger' }
      ],
      [
        { metrik: 'Toplam Gelir', deger: formatCurrencyPdf(summary.value.income) },
        { metrik: 'Toplam Gider', deger: formatCurrencyPdf(summary.value.expenseTotal) },
        { metrik: 'Net Bakiye', deger: formatCurrencyPdf(summary.value.net) },
        { metrik: 'Bekleyen Aidat', deger: formatCurrencyPdf(summary.value.pendingDues) },
        { metrik: 'Odenen Aidat', deger: formatCurrencyPdf(summary.value.paidDues) }
      ],
      `rapor-ozet-${new Date().toISOString().slice(0, 10)}`
    )
  } finally {
    exporting.value = false
  }
}

async function exportPayments() {
  exporting.value = true
  try {
    const rows = filteredPayments.value.map(p => ({
      daire: apartmentLabel(p.apartment),
      tutar: p.amount,
      tarih: p.payment_date,
      yontem: paymentMethodLabels[p.method],
      not: p.notes || ''
    }))
    exportCsv(rows, [
      { key: 'daire', label: 'Daire' },
      { key: 'tutar', label: 'Tutar' },
      { key: 'tarih', label: 'Tarih' },
      { key: 'yontem', label: 'Yontem' },
      { key: 'not', label: 'Not' }
    ], `odemeler-${new Date().toISOString().slice(0, 10)}`)
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchDues(), fetchPayments(), fetchExpenses()])
})
</script>

<template>
  <div>
    <PageHeader
      title="Gelişmiş Raporlama"
      description="Tarih ve kategori filtreleriyle finansal özet alın, CSV/PDF dışa aktarın."
    >
      <template #actions>
        <ExportButtons
          :loading="exporting"
          :disabled="pending"
          @csv="exportSummaryCsv"
          @pdf="exportSummaryPdf"
        />
      </template>
    </PageHeader>

    <div class="panel-card mb-6 grid gap-4 p-4 sm:grid-cols-3">
      <UFormField label="Başlangıç">
        <UInput
          v-model="periodFrom"
          type="date"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Bitiş">
        <UInput
          v-model="periodTo"
          type="date"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Gider kategorisi">
        <USelect
          v-model="category"
          :items="categoryItems"
          class="w-full"
        />
      </UFormField>
    </div>

    <LoadingState v-if="pending && !payments.length && !expenses.length && !dues.length" />

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Gelir"
          :value="formatCurrency(summary.income)"
          icon="i-lucide-trending-up"
          :hint="`${summary.paymentCount} ödeme`"
        />
        <StatCard
          title="Gider"
          :value="formatCurrency(summary.expenseTotal)"
          icon="i-lucide-trending-down"
          :hint="`${summary.expenseCount} kayıt`"
        />
        <StatCard
          title="Net"
          :value="formatCurrency(summary.net)"
          icon="i-lucide-wallet"
          :critical="summary.net < 0"
        />
        <StatCard
          title="Bekleyen Aidat"
          :value="formatCurrency(summary.pendingDues)"
          icon="i-lucide-clock-3"
          :critical="summary.pendingDues > 0"
        />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <PanelCard>
          <template #header>
            <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Kategori Bazlı Giderler
            </h2>
          </template>
          <EmptyState
            v-if="!byCategory.length"
            title="Gider yok"
            description="Seçili filtrede gider bulunamadı."
            icon="i-lucide-pie-chart"
          />
          <ul
            v-else
            class="space-y-2"
          >
            <li
              v-for="item in byCategory"
              :key="item.name"
              class="flex items-center justify-between rounded-xl bg-elevated/60 px-3 py-2.5 text-sm"
            >
              <span class="capitalize">{{ item.name }}</span>
              <span class="font-semibold">{{ formatCurrency(item.amount) }}</span>
            </li>
          </ul>
        </PanelCard>

        <PanelCard>
          <template #header>
            <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Ödeme Dışa Aktarma
            </h2>
          </template>
          <template #actions>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-download"
              :disabled="!filteredPayments.length"
              @click="exportPayments"
            >
              Ödemeleri CSV
            </UButton>
          </template>
          <p class="text-sm text-muted">
            Filtrelenmiş {{ filteredPayments.length }} ödeme kaydı dışa aktarılabilir. Aidat ve gider listeleri ilgili sayfalardan da PDF/CSV olarak alınabilir.
          </p>
        </PanelCard>
      </div>
    </template>
  </div>
</template>
