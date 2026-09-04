<script setup lang="ts">
const {
  items,
  unreadCount,
  pending,
  fetchAll,
  markRead,
  markAllRead,
  subscribeRealtime
} = useNotifications()

const open = ref(false)
let unsubscribe: (() => void) | undefined

onMounted(async () => {
  await fetchAll()
  unsubscribe = subscribeRealtime()
})

onBeforeUnmount(() => {
  unsubscribe?.()
})

async function openNotification(id: string, link: string | null) {
  await markRead(id)
  open.value = false
  if (link) await navigateTo(link)
}
</script>

<template>
  <UPopover v-model:open="open">
    <UChip
      :show="unreadCount > 0"
      :text="unreadCount > 9 ? '9+' : String(unreadCount)"
      color="error"
      size="xl"
      :ui="{
        base: 'ring-2 ring-white dark:ring-[#1E2A38] font-bold shadow-sm',
        background: 'bg-[#B33A3A]!',
        color: 'text-white!'
      }"
    >
      <UButton
        color="neutral"
        :variant="unreadCount > 0 ? 'soft' : 'ghost'"
        icon="i-lucide-bell"
        :class="unreadCount > 0 ? 'text-[#B33A3A] dark:text-[#E8A0A0]' : ''"
        aria-label="Bildirimler"
      />
    </UChip>

    <template #content>
      <div class="w-[22rem] max-w-[90vw] p-3">
        <div class="mb-3 flex items-center justify-between gap-2">
          <p class="text-sm font-semibold">
            Bildirimler
          </p>
          <UButton
            v-if="unreadCount"
            size="xs"
            color="neutral"
            variant="soft"
            @click="markAllRead"
          >
            Tümünü okundu işaretle
          </UButton>
        </div>

        <div
          v-if="pending && !items.length"
          class="py-8 text-center text-sm text-muted"
        >
          Yükleniyor...
        </div>
        <EmptyState
          v-else-if="!items.length"
          title="Bildirim yok"
          description="Yeni duyuru veya arıza güncellemeleri burada görünür."
          icon="i-lucide-bell-off"
        />
        <ul
          v-else
          class="max-h-80 space-y-2 overflow-y-auto"
        >
          <li
            v-for="item in items"
            :key="item.id"
          >
            <button
              type="button"
              class="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-elevated"
              :class="!item.is_read ? 'bg-primary/5' : ''"
              @click="openNotification(item.id, item.link)"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium">
                  {{ item.title }}
                </p>
                <span
                  v-if="!item.is_read"
                  class="mt-1 size-2 shrink-0 rounded-full bg-primary"
                />
              </div>
              <p
                v-if="item.body"
                class="mt-0.5 line-clamp-2 text-xs text-muted"
              >
                {{ item.body }}
              </p>
              <p class="mt-1 text-[11px] text-muted">
                {{ formatDateTime(item.created_at) }}
              </p>
            </button>
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>
