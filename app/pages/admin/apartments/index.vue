<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Apartment } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, create, update, remove } = useApartments()
const { items: residents, fetchAll: fetchResidents } = useResidents()

const open = ref(false)
const editing = ref<Apartment | null>(null)
const saving = ref(false)

const schema = z.object({
  number: z.string().min(1, 'Daire no gerekli'),
  floor: z.coerce.number().int(),
  block: z.string().optional(),
  owner_id: z.string().nullable().optional(),
  area_m2: z.coerce.number().positive().nullable().optional(),
  notes: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  number: '',
  floor: 0,
  block: '',
  owner_id: null as string | null,
  area_m2: null as number | null,
  notes: ''
})

const ownerItems = computed(() => [
  { label: 'Atanmamış', value: null },
  ...residents.value.map(r => ({ label: r.full_name, value: r.id }))
])

function resetForm() {
  editing.value = null
  state.number = ''
  state.floor = 0
  state.block = ''
  state.owner_id = null
  state.area_m2 = null
  state.notes = ''
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(apartment: Apartment) {
  editing.value = apartment
  state.number = apartment.number
  state.floor = apartment.floor
  state.block = apartment.block ?? ''
  state.owner_id = apartment.owner_id
  state.area_m2 = apartment.area_m2
  state.notes = apartment.notes ?? ''
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const payload = {
    number: event.data.number,
    floor: event.data.floor,
    block: event.data.block || null,
    owner_id: event.data.owner_id || null,
    area_m2: event.data.area_m2 ?? null,
    notes: event.data.notes || null
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
  if (!confirm('Bu daireyi silmek istediğinize emin misiniz?')) return
  await remove(id)
}

onMounted(async () => {
  await Promise.all([fetchAll(), fetchResidents()])
})
</script>

<template>
  <div>
    <PageHeader
      title="Daireler"
      description="Apartman dairelerini ve malik atamalarını yönetin."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Yeni Daire
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
      title="Henüz daire yok"
      description="İlk daire kaydını oluşturarak başlayın."
      icon="i-lucide-building-2"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Daire Ekle
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
                Daire
              </th>
              <th class="px-4 py-3 font-medium">
                Kat
              </th>
              <th class="px-4 py-3 font-medium">
                Malik
              </th>
              <th class="px-4 py-3 font-medium">
                m²
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
                {{ apartmentLabel(item) }}
              </td>
              <td class="px-4 py-3">
                {{ item.floor }}
              </td>
              <td class="px-4 py-3">
                {{ item.owner?.full_name || '—' }}
              </td>
              <td class="px-4 py-3">
                {{ item.area_m2 ?? '—' }}
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
            {{ editing ? 'Daire Düzenle' : 'Yeni Daire' }}
          </h2>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField
                label="Blok"
                name="block"
              >
                <UInput
                  v-model="state.block"
                  placeholder="A"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Daire No"
                name="number"
                required
              >
                <UInput
                  v-model="state.number"
                  placeholder="12"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Kat"
                name="floor"
                required
              >
                <UInput
                  v-model.number="state.floor"
                  type="number"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Alan (m²)"
                name="area_m2"
              >
                <UInput
                  v-model.number="state.area_m2"
                  type="number"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField
              label="Kat Maliki"
              name="owner_id"
            >
              <USelect
                v-model="state.owner_id"
                :items="ownerItems"
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
            <div class="flex justify-end gap-2 pt-2">
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
