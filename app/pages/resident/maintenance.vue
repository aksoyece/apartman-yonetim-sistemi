<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { PriorityLevel } from '~/types/database'

definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items: apartments, fetchMine } = useApartments()
const { items, pending, error, fetchMine: fetchMaintenance, create } = useMaintenance()

const open = ref(false)
const saving = ref(false)

const schema = z.object({
  apartment_id: z.string().min(1, 'Daire seçin'),
  title: z.string().min(3, 'Başlık gerekli'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
  priority: z.enum(['low', 'normal', 'high'])
})

type Schema = z.output<typeof schema>

const state = reactive({
  apartment_id: '',
  title: '',
  description: '',
  priority: 'normal' as PriorityLevel
})

const apartmentItems = computed(() =>
  apartments.value.map(a => ({ label: apartmentLabel(a), value: a.id }))
)

const priorityItems = Object.entries(priorityLabels).map(([value, label]) => ({ label, value }))

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const ok = await create(event.data)
  saving.value = false
  if (ok) {
    open.value = false
    state.title = ''
    state.description = ''
    state.priority = 'normal'
  }
}

onMounted(async () => {
  await fetchMine()
  if (apartments.value[0]) {
    state.apartment_id = apartments.value[0].id
  }
  await fetchMaintenance()
})
</script>

<template>
  <div>
    <PageHeader
      title="Arıza Bildirimi"
      description="Dairenizle ilgili arıza ve bakım taleplerini iletin."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          :disabled="!apartments.length"
          @click="open = true"
        >
          Yeni Bildirim
        </UButton>
      </template>
    </PageHeader>

    <UAlert
      v-if="!apartments.length && !pending"
      class="mb-6"
      color="warning"
      variant="subtle"
      title="Daire atanmamış"
      description="Arıza bildirimi oluşturmak için yöneticinin sizi bir daireye ataması gerekir."
      icon="i-lucide-info"
    />

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="fetchMaintenance"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Bildirim yok"
      description="İlk arıza bildiriminizi oluşturabilirsiniz."
      icon="i-lucide-wrench"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          :disabled="!apartments.length"
          @click="open = true"
        >
          Bildirim Oluştur
        </UButton>
      </template>
    </EmptyState>

    <div
      v-else
      class="space-y-4"
    >
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border border-default bg-default p-5 shadow-sm"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <h2 class="text-lg font-semibold">
            {{ item.title }}
          </h2>
          <UBadge
            :color="maintenanceStatusColors[item.status]"
            variant="subtle"
          >
            {{ maintenanceStatusLabels[item.status] }}
          </UBadge>
          <UBadge
            :color="priorityColors[item.priority]"
            variant="subtle"
          >
            {{ priorityLabels[item.priority] }}
          </UBadge>
        </div>
        <p class="whitespace-pre-wrap text-sm text-muted">
          {{ item.description }}
        </p>
        <div class="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          <span>{{ apartmentLabel(item.apartment) }}</span>
          <span>{{ formatDateTime(item.created_at) }}</span>
        </div>
        <p
          v-if="item.admin_notes"
          class="mt-3 rounded-xl bg-elevated px-3 py-2 text-sm"
        >
          <span class="font-medium">Yönetici notu:</span> {{ item.admin_notes }}
        </p>
      </article>
    </div>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">
            Yeni Arıza Bildirimi
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
              label="Başlık"
              name="title"
              required
            >
              <UInput
                v-model="state.title"
                placeholder="Örn. Su kaçağı"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Açıklama"
              name="description"
              required
            >
              <UTextarea
                v-model="state.description"
                :rows="4"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Öncelik"
              name="priority"
            >
              <USelect
                v-model="state.priority"
                :items="priorityItems"
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
                Gönder
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
