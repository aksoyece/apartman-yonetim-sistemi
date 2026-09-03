<script setup lang="ts">
import type { Due, PaymentMethod } from '~/types/database'

definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items: apartments, fetchMine, pending: aptPending, mineReady } = useApartments()
const { items, pending: duesPending, error, fetchByApartmentIds } = useDues()
const { payDue } = usePayments()

const pending = computed(() => aptPending.value || duesPending.value || !mineReady.value)

const debtTotal = computed(() =>
  items.value.filter(d => d.status !== 'paid').reduce((sum, d) => sum + Number(d.amount), 0)
)

const open = ref(false)
const paying = ref(false)
const selected = ref<Due | null>(null)
const method = ref<PaymentMethod>('transfer')

const methodItems = Object.entries(paymentMethodLabels).map(([value, label]) => ({
  label,
  value: value as PaymentMethod
}))

function openPay(due: Due) {
  selected.value = due
  method.value = 'transfer'
  open.value = true
}

async function confirmPay() {
  if (!selected.value) return
  paying.value = true
  const ok = await payDue(selected.value.id, method.value)
  paying.value = false
  if (ok) {
    open.value = false
    selected.value = null
    await fetchByApartmentIds(apartments.value.map(a => a.id))
  }
}

async function load() {
  await fetchMine()
  if (apartments.value.length) {
    await fetchByApartmentIds(apartments.value.map(a => a.id))
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Aidat ve Borç Durumu"
      description="Dairenize ait aidat kayıtları. Bekleyen aidatı Öde ile kapatabilirsiniz."
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
      @retry="load"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!apartments.length"
      title="Atanmış daire yok"
      description="Aidatları görmek için yöneticinin sizi bir daireye ataması gerekir."
      icon="i-lucide-door-open"
    />
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
            <td class="px-4 py-3 text-right">
              <UButton
                v-if="item.status !== 'paid'"
                size="sm"
                icon="i-lucide-wallet"
                @click="openPay(item)"
              >
                Öde
              </UButton>
              <span
                v-else
                class="text-xs text-muted"
              >Ödendi</span>
            </td>
          </tr>
        </tbody>
      </table>
    </DataTableShell>

    <UModal v-model:open="open">
      <template #content>
        <div
          v-if="selected"
          class="space-y-4 p-6"
        >
          <h2 class="text-lg font-semibold">
            Aidat Öde
          </h2>
          <p class="text-sm text-muted">
            {{ apartmentLabel(selected.apartment) }} · {{ selected.period }} ·
            <span class="font-medium text-highlighted">{{ formatCurrency(selected.amount) }}</span>
          </p>
          <p class="text-xs text-muted">
            Bu demo ödeme: gerçek banka/kart entegrasyonu yok. Onaylayınca aidat ödenmiş sayılır ve ödeme geçmişine düşer.
          </p>
          <UFormField label="Ödeme yöntemi">
            <USelect
              v-model="method"
              :items="methodItems"
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
              icon="i-lucide-check"
              :loading="paying"
              @click="confirmPay"
            >
              Ödemeyi Onayla
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
