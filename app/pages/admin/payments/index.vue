<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { PaymentMethod } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, create, remove } = usePayments()
const { items: apartments, fetchAll: fetchApartments } = useApartments()
const { items: dues, fetchAll: fetchDues } = useDues()
const { exportCsv, exportPdf } = useExport()

const open = ref(false)
const saving = ref(false)
const exporting = ref(false)

const schema = z.object({
  apartment_id: z.string().min(1, 'Daire seçin'),
  due_id: z.string().nullable().optional(),
  amount: z.coerce.number().positive('Tutar gerekli'),
  payment_date: z.string().min(1, 'Tarih gerekli'),
  method: z.enum(['cash', 'transfer', 'credit_card', 'other']),
  notes: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  apartment_id: '',
  due_id: null as string | null,
  amount: 0,
  payment_date: new Date().toISOString().slice(0, 10),
  method: 'transfer' as PaymentMethod,
  notes: ''
})

const apartmentItems = computed(() =>
  apartments.value.map(a => ({ label: apartmentLabel(a), value: a.id }))
)

const dueItems = computed(() => [
  { label: 'Aidata bağlama', value: null },
  ...dues.value
    .filter(d => !state.apartment_id || d.apartment_id === state.apartment_id)
    .filter(d => d.status !== 'paid')
    .map(d => ({
      label: `${apartmentLabel(d.apartment)} · ${d.period} · ${formatCurrency(d.amount)}`,
      value: d.id
    }))
])

const methodItems = Object.entries(paymentMethodLabels).map(([value, label]) => ({ label, value }))

watch(() => state.due_id, (dueId) => {
  const due = dues.value.find(d => d.id === dueId)
  if (due) {
    state.apartment_id = due.apartment_id
    state.amount = Number(due.amount)
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const ok = await create({
    apartment_id: event.data.apartment_id,
    due_id: event.data.due_id || null,
    amount: event.data.amount,
    payment_date: event.data.payment_date,
    method: event.data.method,
    notes: event.data.notes || null
  })
  saving.value = false
  if (ok) {
    open.value = false
    await fetchDues()
  }
}

async function onDelete(id: string) {
  if (!confirm('Bu ödemeyi silmek istediğinize emin misiniz?')) return
  await remove(id)
}

async function onExportCsv() {
  exporting.value = true
  exportCsv(
    items.value.map(i => ({
      daire: apartmentLabel(i.apartment),
      tutar: i.amount,
      tarih: i.payment_date,
      yontem: paymentMethodLabels[i.method],
      not: i.notes || ''
    })),
    [
      { key: 'daire', label: 'Daire' },
      { key: 'tutar', label: 'Tutar' },
      { key: 'tarih', label: 'Tarih' },
      { key: 'yontem', label: 'Yontem' },
      { key: 'not', label: 'Not' }
    ],
    `odemeler-${new Date().toISOString().slice(0, 10)}`
  )
  exporting.value = false
}

async function onExportPdf() {
  exporting.value = true
  await exportPdf(
    'Odeme Listesi',
    [
      { header: 'Daire', dataKey: 'daire' },
      { header: 'Tutar', dataKey: 'tutar' },
      { header: 'Tarih', dataKey: 'tarih' },
      { header: 'Yontem', dataKey: 'yontem' }
    ],
    items.value.map(i => ({
      daire: apartmentLabel(i.apartment),
      tutar: formatCurrencyPdf(i.amount),
      tarih: formatDate(i.payment_date),
      yontem: paymentMethodLabels[i.method]
    })),
    `odemeler-${new Date().toISOString().slice(0, 10)}`
  )
  exporting.value = false
}

onMounted(async () => {
  await Promise.all([fetchAll(), fetchApartments(), fetchDues()])
})
</script>

<template>
  <div>
    <PageHeader
      title="Ödemeler"
      description="Tahsilatları kaydedin ve aidat durumunu güncelleyin."
    >
      <template #actions>
        <ExportButtons
          :loading="exporting"
          :disabled="!items.length"
          @csv="onExportCsv"
          @pdf="onExportPdf"
        />
        <UButton
          icon="i-lucide-plus"
          @click="open = true"
        >
          Ödeme Kaydet
        </UButton>
      </template>
    </PageHeader>

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="fetchAll"
    />
    <LoadingState v-else-if="pending && !items.length" />
    <EmptyState
      v-else-if="!items.length"
      title="Ödeme kaydı yok"
      description="İlk tahsilatı buradan ekleyin."
      icon="i-lucide-wallet"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="open = true"
        >
          Ödeme Kaydet
        </UButton>
      </template>
    </EmptyState>

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
            <th class="px-4 py-3 font-medium text-right">
              İşlem
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
            <td class="px-4 py-3 text-success font-medium">
              {{ formatCurrency(item.amount) }}
            </td>
            <td class="px-4 py-3">
              {{ formatDate(item.payment_date) }}
            </td>
            <td class="px-4 py-3">
              {{ paymentMethodLabels[item.method] }}
            </td>
            <td class="px-4 py-3 max-w-48 truncate">
              {{ item.notes || '—' }}
            </td>
            <td class="px-4 py-3 text-right">
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                @click="onDelete(item.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </DataTableShell>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">
            Ödeme Kaydet
          </h2>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="Daire"
              name="apartment_id"
              required
            >
              <USelect
                v-model="state.apartment_id"
                :items="apartmentItems"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="İlgili Aidat"
              name="due_id"
            >
              <USelect
                v-model="state.due_id"
                :items="dueItems"
                class="w-full"
              />
            </UFormField>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField
                label="Tutar"
                name="amount"
                required
              >
                <UInput
                  v-model.number="state.amount"
                  type="number"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Tarih"
                name="payment_date"
                required
              >
                <UInput
                  v-model="state.payment_date"
                  type="date"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField
              label="Ödeme Yöntemi"
              name="method"
              required
            >
              <USelect
                v-model="state.method"
                :items="methodItems"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Not"
              name="notes"
            >
              <UTextarea
                v-model="state.notes"
                class="w-full"
              />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="soft"
                @click="open = false"
              >
                İptal
              </UButton>
              <UButton
                type="submit"
                :loading="saving"
              >
                Kaydet
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
