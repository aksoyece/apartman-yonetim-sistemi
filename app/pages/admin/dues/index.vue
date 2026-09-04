<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Due, DueStatus } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, create, update, remove } = useDues()
const { items: apartments, fetchAll: fetchApartments } = useApartments()
const { exportCsv, exportPdf } = useExport()

const open = ref(false)
const editing = ref<Due | null>(null)
const saving = ref(false)
const exporting = ref(false)

const schema = z.object({
  apartment_id: z.string().min(1, 'Daire seçin'),
  amount: z.coerce.number().positive('Tutar 0 dan büyük olmalı'),
  due_date: z.string().min(1, 'Vade tarihi gerekli'),
  period: z.string().min(1, 'Dönem gerekli'),
  status: z.enum(['pending', 'paid', 'overdue', 'partial']),
  description: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  apartment_id: '',
  amount: 0,
  due_date: new Date().toISOString().slice(0, 10),
  period: currentPeriod(),
  status: 'pending' as DueStatus,
  description: ''
})

const apartmentItems = computed(() =>
  apartments.value.map(a => ({ label: apartmentLabel(a), value: a.id }))
)

const statusItems = Object.entries(dueStatusLabels).map(([value, label]) => ({ label, value }))

function resetForm() {
  editing.value = null
  state.apartment_id = ''
  state.amount = 0
  state.due_date = new Date().toISOString().slice(0, 10)
  state.period = currentPeriod()
  state.status = 'pending'
  state.description = ''
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(due: Due) {
  editing.value = due
  state.apartment_id = due.apartment_id
  state.amount = Number(due.amount)
  state.due_date = due.due_date
  state.period = due.period
  state.status = due.status
  state.description = due.description ?? ''
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const payload = {
    apartment_id: event.data.apartment_id,
    amount: event.data.amount,
    due_date: event.data.due_date,
    period: event.data.period,
    status: event.data.status,
    description: event.data.description || null
  }
  const ok = editing.value
    ? await update(editing.value.id, payload)
    : await create(payload)
  saving.value = false
  if (ok) {
    open.value = false
    resetForm()
  }
}

async function onDelete(id: string) {
  if (!confirm('Bu aidatı silmek istediğinize emin misiniz?')) return
  await remove(id)
}

async function onExportCsv() {
  exporting.value = true
  exportCsv(
    items.value.map(i => ({
      daire: apartmentLabel(i.apartment),
      donem: i.period,
      tutar: i.amount,
      vade: i.due_date,
      durum: dueStatusLabels[i.status]
    })),
    [
      { key: 'daire', label: 'Daire' },
      { key: 'donem', label: 'Donem' },
      { key: 'tutar', label: 'Tutar' },
      { key: 'vade', label: 'Vade' },
      { key: 'durum', label: 'Durum' }
    ],
    `aidatlar-${new Date().toISOString().slice(0, 10)}`
  )
  exporting.value = false
}

async function onExportPdf() {
  exporting.value = true
  await exportPdf(
    'Aidat Listesi',
    [
      { header: 'Daire', dataKey: 'daire' },
      { header: 'Donem', dataKey: 'donem' },
      { header: 'Tutar', dataKey: 'tutar' },
      { header: 'Vade', dataKey: 'vade' },
      { header: 'Durum', dataKey: 'durum' }
    ],
    items.value.map(i => ({
      daire: apartmentLabel(i.apartment),
      donem: i.period,
      tutar: formatCurrencyPdf(i.amount),
      vade: formatDate(i.due_date),
      durum: dueStatusLabels[i.status]
    })),
    `aidatlar-${new Date().toISOString().slice(0, 10)}`
  )
  exporting.value = false
}

onMounted(async () => {
  await Promise.all([fetchAll(), fetchApartments()])
})
</script>

<template>
  <div>
    <PageHeader
      title="Aidatlar"
      description="Daire bazlı aidat borçlarını oluşturun ve takip edin."
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
          @click="openCreate"
        >
          Yeni Aidat
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
      title="Aidat kaydı yok"
      description="Aylık aidatları dairelere tanımlayın."
      icon="i-lucide-receipt"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Aidat Ekle
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
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="openEdit(item)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="onDelete(item.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </DataTableShell>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">
            {{ editing ? 'Aidat Düzenle' : 'Yeni Aidat' }}
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
                label="Dönem"
                name="period"
                required
              >
                <UInput
                  v-model="state.period"
                  placeholder="2026-09"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Vade"
                name="due_date"
                required
              >
                <UInput
                  v-model="state.due_date"
                  type="date"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Durum"
                name="status"
                required
              >
                <USelect
                  v-model="state.status"
                  :items="statusItems"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField
              label="Açıklama"
              name="description"
            >
              <UTextarea
                v-model="state.description"
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
