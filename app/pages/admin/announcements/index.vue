<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Announcement, PriorityLevel } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, create, update, remove } = useAnnouncements()
const open = ref(false)
const editing = ref<Announcement | null>(null)
const saving = ref(false)

const schema = z.object({
  title: z.string().min(2, 'Başlık gerekli'),
  content: z.string().min(5, 'İçerik gerekli'),
  priority: z.enum(['low', 'normal', 'high']),
  is_active: z.boolean()
})

type Schema = z.output<typeof schema>

const state = reactive({
  title: '',
  content: '',
  priority: 'normal' as PriorityLevel,
  is_active: true
})

const priorityItems = Object.entries(priorityLabels).map(([value, label]) => ({ label, value }))

function resetForm() {
  editing.value = null
  state.title = ''
  state.content = ''
  state.priority = 'normal'
  state.is_active = true
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(item: Announcement) {
  editing.value = item
  state.title = item.title
  state.content = item.content
  state.priority = item.priority
  state.is_active = item.is_active
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  const payload = {
    title: event.data.title,
    content: event.data.content,
    priority: event.data.priority,
    is_active: event.data.is_active
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
  if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return
  await remove(id)
}

onMounted(() => fetchAll(true))
</script>

<template>
  <div>
    <PageHeader
      title="Duyurular"
      description="Kat maliklerine yönelik duyuru ve bilgilendirmeler."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Yeni Duyuru
        </UButton>
      </template>
    </PageHeader>

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="() => fetchAll(true)"
    />
    <LoadingState v-else-if="pending" />
    <EmptyState
      v-else-if="!items.length"
      title="Duyuru yok"
      description="Toplantı, kesinti veya genel bilgilendirmeleri yayınlayın."
      icon="i-lucide-megaphone"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          Duyuru Ekle
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
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold">
                {{ item.title }}
              </h2>
              <UBadge
                :color="priorityColors[item.priority]"
                variant="subtle"
              >
                {{ priorityLabels[item.priority] }}
              </UBadge>
              <UBadge
                :color="item.is_active ? 'success' : 'neutral'"
                variant="subtle"
              >
                {{ item.is_active ? 'Aktif' : 'Pasif' }}
              </UBadge>
            </div>
            <p class="whitespace-pre-wrap text-sm text-muted">
              {{ item.content }}
            </p>
            <p class="mt-3 text-xs text-muted">
              {{ formatDateTime(item.published_at) }}
            </p>
          </div>
          <div class="flex gap-1">
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
        </div>
      </article>
    </div>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">
            {{ editing ? 'Duyuru Düzenle' : 'Yeni Duyuru' }}
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
            <UFormField
              label="İçerik"
              name="content"
              required
            >
              <UTextarea
                v-model="state.content"
                :rows="5"
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
            <UFormField
              label="Aktif"
              name="is_active"
            >
              <USwitch v-model="state.is_active" />
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
