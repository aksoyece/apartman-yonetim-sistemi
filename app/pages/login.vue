<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { signIn, loading, homePathForRole } = useAuth()

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı')
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: '',
  password: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const nextProfile = await signIn(event.data.email, event.data.password)
  if (!nextProfile) {
    const user = useSupabaseUser()
    if (user.value) {
      useToast().add({
        title: 'Profil bulunamadı',
        description: 'Hesap oturumu açıldı fakat profil kaydı okunamadı. Sayfayı yenileyip tekrar deneyin.',
        color: 'warning'
      })
    }
    return
  }

  await navigateTo(homePathForRole(nextProfile.role), { replace: true })
}
</script>

<template>
  <AuthShell
    title="Giriş Yap"
    description="Yönetici veya kat maliki hesabınızla panele devam edin."
  >
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="E-posta"
        name="email"
        required
      >
        <UInput
          v-model="state.email"
          type="email"
          size="lg"
          placeholder="ornek@mail.com"
          icon="i-lucide-mail"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Şifre"
        name="password"
        required
      >
        <UInput
          v-model="state.password"
          type="password"
          size="lg"
          placeholder="••••••••"
          icon="i-lucide-lock"
          class="w-full"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        class="mt-2"
        :loading="loading"
      >
        Giriş Yap
      </UButton>
    </UForm>

    <p class="mt-6 text-sm text-slate-500 dark:text-slate-400">
      Hesabınız yok mu?
      <NuxtLink
        to="/register"
        class="font-medium text-accent hover:underline"
      >
        Kayıt olun
      </NuxtLink>
    </p>
  </AuthShell>
</template>
