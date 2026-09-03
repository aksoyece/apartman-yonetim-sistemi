<script setup lang="ts">
import type { MaintenanceRequest, MaintenanceStatus } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { items, pending, error, fetchAll, updateStatus } = useMaintenance()
const { getSignedUrl } = useAttachmentUpload()
const open = ref(false)
const selected = ref<MaintenanceRequest | null>(null)
const saving = ref(false)
const status = ref<MaintenanceStatus>('open')
const adminNotes = ref('')

const statusItems = Object.entries(maintenanceStatusLabels).map(([value, label]) => ({ label, value }))

function openStatus(item: MaintenanceRequest) {
  selected.value = item
  status.value = item.status
  adminNotes.value = item.admin_notes ?? ''
  open.value = true
}

async function saveStatus() {
  if (!selected.value) return
  saving.value = true
  const ok = await updateStatus(selected.value.id, status.value, adminNotes.value || null)
  saving.value = false
  if (ok) open.value = false
}

async function openAttachment(path: string | null | undefined) {
  const url = await getSignedUrl(path)
  if (url) window.open(url, '_blank')
}

onMounted(fetchAll)
useRealtimeChannel('admin-maintenance', 'maintenance_requests', fetchAll)
</script>

<template>
  <div>
    <PageHeader
      title="Arıza Bildirimleri"
      description="Kat maliklerinden gelen talepleri yönetin ve durumlarını güncelleyin."
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="soft"
          :loading="pending"
          @click="fetchAll"
        >
          Yenile
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
      title="Açık arıza yok"
      description="Yeni bildirimler burada listelenir."
      icon="i-lucide-wrench"
    />

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
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
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
            <p class="text-sm text-muted whitespace-pre-wrap">
              {{ item.description }}
            </p>
            <div class="mt-3 flex flex-wrap gap-4 text-xs text-muted">
              <span>{{ apartmentLabel(item.apartment) }}</span>
              <span>{{ item.reporter?.full_name || '—' }}</span>
              <span>{{ formatDateTime(item.created_at) }}</span>
            </div>
            <p
              v-if="item.admin_notes"
              class="mt-3 rounded-xl bg-elevated px-3 py-2 text-sm"
            >
              <span class="font-medium">Yönetici notu:</span> {{ item.admin_notes }}
            </p>
            <UButton
              v-if="item.attachment_path"
              class="mt-3"
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-paperclip"
              @click="openAttachment(item.attachment_path)"
            >
              Ek dosyayı aç
            </UButton>
          </div>
          <UButton
            icon="i-lucide-refresh-cw"
            variant="soft"
            @click="openStatus(item)"
          >
            Durum Güncelle
          </UButton>
        </div>
      </PanelCard>
    </div>

    <UModal v-model:open="open">
      <template #content>
        <div class="space-y-4 p-6">
          <h2 class="text-lg font-semibold">
            Durum Güncelle
          </h2>
          <UFormField label="Durum">
            <USelect
              v-model="status"
              :items="statusItems"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Yönetici Notu">
            <UTextarea
              v-model="adminNotes"
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
              :loading="saving"
              @click="saveStatus"
            >
              Kaydet
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
