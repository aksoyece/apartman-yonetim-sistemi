<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { SurveyStatus } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, create, updateStatus, remove } = useSurveys()
const open = ref(false)
const saving = ref(false)

const schema = z.object({
  title: z.string().min(3, 'Başlık gerekli'),
  description: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed']),
  ends_at: z.string().optional(),
  option1: z.string().min(1, '1. seçenek gerekli'),
  option2: z.string().min(1, '2. seçenek gerekli'),
  option3: z.string().optional(),
  option4: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
  title: '',
  description: '',
  status: 'open' as SurveyStatus,
  ends_at: '',
  option1: 'Evet',
  option2: 'Hayır',
  option3: '',
  option4: ''
})

const statusItems = Object.entries(surveyStatusLabels).map(([value, label]) => ({ label, value }))

function resetForm() {
  state.title = ''
  state.description = ''
  state.status = 'open'
  state.ends_at = ''
  state.option1 = 'Evet'
  state.option2 = 'Hayır'
  state.option3 = ''
  state.option4 = ''
}

function openCreate() {
  resetForm()
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const options = [
    event.data.option1,
    event.data.option2,
    event.data.option3,
    event.data.option4
  ].filter(Boolean) as string[]

  const ok = await create({
    title: event.data.title,
    description: event.data.description || null,
    status: event.data.status,
    ends_at: event.data.ends_at ? new Date(event.data.ends_at).toISOString() : null,
    options
  })
  saving.value = false
  if (ok) {
    open.value = false
    resetForm()
  }
}

async function onDelete(id: string) {
  if (!confirm('Bu anketi silmek istediğinize emin misiniz?')) return
  await remove(id)
}

function percent(optionCount: number, total: number) {
  if (!total) return 0
  return Math.round((optionCount / total) * 100)
}

onMounted(() => fetchAll(true))
</script>

<template>
  <div>
    <PageHeader
      title="Anketler"
      description="Blok / site kararları için hızlı anket oluşturun ve sonuçları görün."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Yeni Anket
        </UButton>
      </template>
    </PageHeader>

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="() => fetchAll(true)"
    />
    <LoadingState v-else-if="pending && !items.length" />
    <EmptyState
      v-else-if="!pending && !items.length"
      title="Anket yok"
      description="Örn. “Bahçeye çardak yapılsın mı?” gibi bir karar anketi ekleyin."
      icon="i-lucide-vote"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Anket Oluştur
        </UButton>
      </template>
    </EmptyState>

    <div
      v-else
      class="space-y-4"
    >
      <PanelCard
        v-for="item in items"
        :key="item.id"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <h2 class="font-display text-xl font-semibold text-ink">
                {{ item.title }}
              </h2>
              <UBadge
                :color="surveyStatusColors[item.status]"
                variant="subtle"
              >
                {{ surveyStatusLabels[item.status] }}
              </UBadge>
            </div>
            <p
              v-if="item.description"
              class="text-sm text-muted-ink"
            >
              {{ item.description }}
            </p>
            <p class="mt-2 text-xs text-muted-ink">
              {{ formatDateTime(item.created_at) }}
              <span v-if="item.ends_at"> · Bitiş: {{ formatDateTime(item.ends_at) }}</span>
              · {{ item.total_votes || 0 }} oy
            </p>
          </div>
          <div class="flex flex-wrap gap-1">
            <UButton
              v-if="item.status !== 'open'"
              size="sm"
              color="neutral"
              variant="soft"
              @click="updateStatus(item.id, 'open')"
            >
              Aç
            </UButton>
            <UButton
              v-if="item.status === 'open'"
              size="sm"
              color="neutral"
              variant="soft"
              @click="updateStatus(item.id, 'closed')"
            >
              Kapat
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              @click="onDelete(item.id)"
            />
          </div>
        </div>

        <ul class="mt-4 space-y-2">
          <li
            v-for="option in item.options"
            :key="option.id"
            class="rounded-md border border-line bg-soft/40 px-3 py-2"
          >
            <div class="mb-1 flex items-center justify-between gap-3 text-sm">
              <span class="font-medium text-ink">{{ option.label }}</span>
              <span class="text-muted-ink">
                {{ option.vote_count || 0 }} oy · %{{ percent(option.vote_count || 0, item.total_votes || 0) }}
              </span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-line">
              <div
                class="h-full rounded-full bg-[var(--color-pine-600,#2F5D50)] transition-all"
                :style="{ width: `${percent(option.vote_count || 0, item.total_votes || 0)}%` }"
              />
            </div>
          </li>
        </ul>
      </PanelCard>
    </div>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">
            Yeni Anket
          </h2>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="Soru / başlık"
              name="title"
              required
            >
              <UInput
                v-model="state.title"
                placeholder="Bahçeye çardak yapılsın mı?"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Açıklama"
              name="description"
            >
              <UTextarea
                v-model="state.description"
                :rows="3"
                class="w-full"
              />
            </UFormField>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField
                label="Durum"
                name="status"
              >
                <USelect
                  v-model="state.status"
                  :items="statusItems"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Bitiş (opsiyonel)"
                name="ends_at"
              >
                <UInput
                  v-model="state.ends_at"
                  type="datetime-local"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <UFormField
                label="Seçenek 1"
                name="option1"
                required
              >
                <UInput
                  v-model="state.option1"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Seçenek 2"
                name="option2"
                required
              >
                <UInput
                  v-model="state.option2"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Seçenek 3"
                name="option3"
              >
                <UInput
                  v-model="state.option3"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Seçenek 4"
                name="option4"
              >
                <UInput
                  v-model="state.option4"
                  class="w-full"
                />
              </UFormField>
            </div>
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
                Oluştur
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
