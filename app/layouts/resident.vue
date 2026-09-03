<script setup lang="ts">
const { profile, signOut } = useAuth()
const route = useRoute()

const links = [{
  label: 'Özet',
  icon: 'i-lucide-home',
  to: '/resident'
}, {
  label: 'Dairem',
  icon: 'i-lucide-door-open',
  to: '/resident/apartment'
}, {
  label: 'Aidatlar',
  icon: 'i-lucide-receipt',
  to: '/resident/dues'
}, {
  label: 'Ödemeler',
  icon: 'i-lucide-wallet',
  to: '/resident/payments'
}, {
  label: 'Duyurular',
  icon: 'i-lucide-megaphone',
  to: '/resident/announcements'
}, {
  label: 'Arıza Bildirimi',
  icon: 'i-lucide-wrench',
  to: '/resident/maintenance'
}]

const open = ref(false)

watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <div class="min-h-screen bg-muted/40">
    <div class="flex min-h-screen">
      <aside
        class="fixed inset-y-0 left-0 z-40 w-72 border-r border-default bg-default p-4 transition-transform lg:static lg:translate-x-0"
        :class="open ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="mb-8 flex items-center gap-3 px-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-inverted">
            <UIcon name="i-lucide-home" class="size-5" />
          </div>
          <div>
            <p class="text-sm font-semibold">
              Apartman YS
            </p>
            <p class="text-xs text-muted">
              Kat Maliki Portalı
            </p>
          </div>
        </div>

        <nav class="space-y-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
            :class="route.path === link.to
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted hover:bg-elevated hover:text-default'"
          >
            <UIcon :name="link.icon" class="size-4" />
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="absolute bottom-4 left-4 right-4 space-y-3 border-t border-default pt-4">
          <div class="px-2">
            <p class="truncate text-sm font-medium">
              {{ profile?.full_name }}
            </p>
            <p class="truncate text-xs text-muted">
              {{ profile?.email }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="soft"
            block
            icon="i-lucide-log-out"
            @click="signOut"
          >
            Çıkış Yap
          </UButton>
        </div>
      </aside>

      <div
        v-if="open"
        class="fixed inset-0 z-30 bg-black/40 lg:hidden"
        @click="open = false"
      />

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-default bg-default/90 px-4 py-3 backdrop-blur lg:px-6">
          <div class="flex items-center gap-2">
            <UButton
              class="lg:hidden"
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              @click="open = true"
            />
            <p class="text-sm text-muted">
              Portal
            </p>
          </div>
          <div class="flex items-center gap-1">
            <NotificationBell />
            <UColorModeButton />
          </div>
        </header>

        <main class="flex-1 p-4 lg:p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
