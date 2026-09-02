<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap'
    }
  ],
  htmlAttrs: {
    lang: 'tr'
  }
})

useSeoMeta({
  title: 'Apartman Yönetim Sistemi',
  description: 'Nuxt, Vue 3, TypeScript, Nuxt UI ve Supabase ile apartman yönetimi.',
  ogTitle: 'Apartman Yönetim Sistemi',
  ogDescription: 'Modern, güvenli ve responsive apartman yönetim paneli.'
})

const { user, fetchProfile } = useAuth()

watch(user, async (value) => {
  if (value) {
    await fetchProfile()
  }
}, { immediate: true })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
