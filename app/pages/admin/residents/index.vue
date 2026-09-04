<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Profile } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, updateProfile } = useResidents()
const open = ref(false)
const editing = ref<Profile | null>(null)
const saving = ref(false)

const schema = z.object({
  full_name: z.string().min(2, 'Ad soyad gerekli'),
  phone: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  full_name: '',
  phone: ''
})

function openEdit(profile: Profile) {
  editing.value = profile
  state.full_name = profile.full_name
  state.phone = profile.phone ?? ''
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!editing.value) return
  saving.value = true
  const ok = await updateProfile(editing.value.id, {
    full_name: event.data.full_name,
    phone: event.data.phone || null
  })
  saving.value = false
  if (ok) open.value = false
}

onMounted(fetchAll)
</script>

<template>
  <div>
    <PageHeader
      title="Kat Malikleri"
      description="Kayıtlı kat maliki profillerini görüntüleyin ve güncelleyin."
    />

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="fetchAll"
    />
    <LoadingState v-else-if="pending && !items.length" />
    <EmptyState
      v-else-if="!items.length"
      title="Kat maliki yok"
      description="Kat malikleri kayıt olduktan sonra burada listelenir. Daire ataması Daireler sayfasından yapılır."
      icon="i-lucide-users"
    />

    <DataTableShell v-else>
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-muted dark:bg-white/5">
          <tr>
            <th class="px-4 py-3 font-medium">
              Ad Soyad
            </th>
            <th class="px-4 py-3 font-medium">
              E-posta
            </th>
            <th class="px-4 py-3 font-medium">
              Telefon
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
              {{ item.full_name }}
            </td>
            <td class="px-4 py-3">
              {{ item.email || '—' }}
            </td>
            <td class="px-4 py-3">
              {{ item.phone || '—' }}
            </td>
            <td class="px-4 py-3 text-right">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="openEdit(item)"
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
            Kat Maliki Düzenle
          </h2>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="Ad Soyad"
              name="full_name"
              required
            >
              <UInput
                v-model="state.full_name"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Telefon"
              name="phone"
            >
              <UInput
                v-model="state.phone"
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
