<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap'
    },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/favicon.svg' }
  ],
  htmlAttrs: {
    lang: 'tr'
  }
})

useSeoMeta({
  title: 'YönetiX — Apartman Yönetim Sistemi',
  description: 'YönetiX ile aidat, ödeme, gider, duyuru, anket ve arıza süreçlerini tek panelden yönetin.',
  ogTitle: 'YönetiX — Apartman Yönetim Sistemi',
  ogDescription: 'Modern, güvenli ve responsive apartman yönetim paneli.'
})

const { user, profile, fetchProfile } = useAuth()

// Geçici user=null dalgalanmasında profili silme — sadece gerçek çıkışta temizlenir
watch(user, async (value) => {
  if (value?.id) {
    if (!profile.value || profile.value.id !== value.id) {
      await fetchProfile(value.id)
    }
  }
}, { immediate: true })
</script>

<template>
  <UApp :toaster="{ duration: 1800 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
