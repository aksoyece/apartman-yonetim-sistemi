<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Expense } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, create, update, remove } = useExpenses()
const open = ref(false)
const editing = ref<Expense | null>(null)
const saving = ref(false)

const schema = z.object({
  title: z.string().min(2, 'Başlık gerekli'),
  amount: z.coerce.number().positive('Tutar gerekli'),
  category: z.string().min(1, 'Kategori gerekli'),
  expense_date: z.string().min(1, 'Tarih gerekli'),
  description: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  title: '',
  amount: 0,
  category: 'genel' as string,
  expense_date: new Date().toISOString().slice(0, 10),
  description: ''
})

const categoryItems = expenseCategories.map(value => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value: value as string
}))

function resetForm() {
  editing.value = null
  state.title = ''
  state.amount = 0
  state.category = 'genel'
  state.expense_date = new Date().toISOString().slice(0, 10)
  state.description = ''
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(expense: Expense) {
  editing.value = expense
  state.title = expense.title
  state.amount = Number(expense.amount)
  state.category = expense.category
  state.expense_date = expense.expense_date
  state.description = expense.description ?? ''
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const payload = {
    title: event.data.title,
    amount: event.data.amount,
    category: event.data.category,
    expense_date: event.data.expense_date,
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
  if (!confirm('Bu gideri silmek istediğinize emin misiniz?')) return
  await remove(id)
}

onMounted(fetchAll)
</script>

<template>
  <div>
    <PageHeader
      title="Giderler"
      description="Apartman ortak giderlerini kaydedin ve takip edin."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Yeni Gider
        </UButton>
      </template>
    </PageHeader>

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="fetchAll"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Gider kaydı yok"
      description="Temizlik, elektrik, bakım gibi giderleri ekleyin."
      icon="i-lucide-pie-chart"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Gider Ekle
        </UButton>
      </template>
    </EmptyState>

    <div
      v-else
      class="overflow-hidden rounded-2xl border border-default bg-default"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-elevated/70 text-left text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">
                Başlık
              </th>
              <th class="px-4 py-3 font-medium">
                Kategori
              </th>
              <th class="px-4 py-3 font-medium">
                Tutar
              </th>
              <th class="px-4 py-3 font-medium">
                Tarih
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
              <td class="px-4 py-3">
                <p class="font-medium">
                  {{ item.title }}
                </p>
                <p
                  v-if="item.description"
                  class="text-xs text-muted"
                >
                  {{ item.description }}
                </p>
              </td>
              <td class="px-4 py-3 capitalize">
                {{ item.category }}
              </td>
              <td class="px-4 py-3 font-medium text-error">
                {{ formatCurrency(item.amount) }}
              </td>
              <td class="px-4 py-3">
                {{ formatDate(item.expense_date) }}
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
      </div>
    </div>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">
            {{ editing ? 'Gider Düzenle' : 'Yeni Gider' }}
          </h2>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="Başlık"
              name="title"
              required
            >
              <UInput
                v-model="state.title"
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
                label="Kategori"
                name="category"
                required
              >
                <USelect
                  v-model="state.category"
                  :items="categoryItems"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField
              label="Tarih"
              name="expense_date"
              required
            >
              <UInput
                v-model="state.expense_date"
                type="date"
                class="w-full"
              />
            </UFormField>
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
