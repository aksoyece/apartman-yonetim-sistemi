<script setup lang="ts">
definePageMeta({
  layout: 'auth',
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
  <div class="ays-rise w-full max-w-3xl text-center">
    <p class="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">
      Apartman
      <span class="block text-accent">Yönetim Sistemi</span>
    </p>
    <p class="ays-rise-delay mx-auto mt-5 max-w-xl text-base text-muted-ink sm:text-lg">
      Aidat, ödeme, gider, duyuru ve arıza bildirimlerini tek panelden yönetin.
    </p>
    <div class="ays-rise-delay mt-10 flex flex-wrap items-center justify-center gap-3">
      <UButton
        to="/login"
        size="xl"
        icon="i-lucide-log-in"
      >
        Giriş Yap
      </UButton>
      <UButton
        to="/register"
        size="xl"
        color="neutral"
        variant="outline"
        class="border-line"
        icon="i-lucide-user-plus"
      >
        Kayıt Ol
      </UButton>
    </div>
  </div>
</template>
