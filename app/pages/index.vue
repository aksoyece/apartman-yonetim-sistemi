<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const { isAuthenticated, profile, homePathForRole } = useAuth()

watchEffect(() => {
  if (isAuthenticated.value && profile.value) {
    navigateTo(homePathForRole(profile.value.role))
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12),_transparent_50%)] px-4">
    <div class="w-full max-w-lg text-center">
      <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-inverted shadow-lg shadow-primary/30">
        <UIcon
          name="i-lucide-building-2"
          class="size-8"
        />
      </div>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Apartman Yönetim Sistemi
      </h1>
      <p class="mx-auto mt-3 max-w-md text-muted">
        Aidat, ödeme, gider, duyuru ve arıza bildirimlerini tek panelden yönetin.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <UButton
          to="/login"
          size="lg"
          icon="i-lucide-log-in"
        >
          Giriş Yap
        </UButton>
        <UButton
          to="/register"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-user-plus"
        >
          Kayıt Ol
        </UButton>
      </div>
    </div>
  </div>
</template>
