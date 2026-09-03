<script setup lang="ts">
const props = defineProps<{
  links: Array<{ label: string, icon: string, to: string }>
  subtitle: string
  brandIcon?: string
  headerLabel: string
  homePath: string
}>()

const { profile, signOut } = useAuth()
const route = useRoute()
const open = ref(false)

watch(() => route.fullPath, () => {
  open.value = false
})

function isActive(to: string) {
  if (to === props.homePath) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <div class="panel-shell">
    <div class="flex min-h-screen">
      <aside
        class="panel-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col p-4 transition-transform lg:static lg:translate-x-0"
        :class="open ? 'translate-x-0' : '-translate-x-full'"
      >
        <AppSidebarBrand
          :subtitle="subtitle"
          :icon="brandIcon"
        />

        <nav class="flex-1 space-y-0.5 overflow-y-auto pb-28">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="panel-nav-link"
            :class="isActive(link.to) ? 'panel-nav-link-active' : ''"
          >
            <UIcon
              :name="link.icon"
              class="size-4 shrink-0"
            />
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="absolute bottom-4 left-4 right-4 space-y-3 border-t border-line pt-4">
          <div class="px-2">
            <p class="truncate text-sm font-medium text-ink">
              {{ profile?.full_name }}
            </p>
            <p class="truncate text-xs text-muted-ink">
              {{ profile?.email }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            block
            class="border-line"
            icon="i-lucide-log-out"
            @click="signOut"
          >
            Çıkış Yap
          </UButton>
        </div>
      </aside>

      <div
        v-if="open"
        class="fixed inset-0 z-30 bg-[#1E2A38]/25 lg:hidden"
        @click="open = false"
      />

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="panel-header-bar sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div class="flex items-center gap-2">
            <UButton
              class="lg:hidden"
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              @click="open = true"
            />
            <p class="text-sm text-muted-ink">
              {{ headerLabel }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <NotificationBell />
            <UColorModeButton />
          </div>
        </header>

        <main class="ays-rise flex-1 p-4 lg:p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
