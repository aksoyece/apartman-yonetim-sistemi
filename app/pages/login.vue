<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { signIn, loading, homePathForRole, fetchProfile } = useAuth()

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
  const ok = await signIn(event.data.email, event.data.password)
  if (!ok) return
  const profile = await fetchProfile()
  await navigateTo(homePathForRole(profile?.role))
}
</script>

<template>
  <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl backdrop-blur dark:bg-slate-900/90 dark:text-white sm:p-8">
    <div class="mb-6">
      <p class="text-sm font-medium text-sky-600 dark:text-sky-400">
        Apartman YS
      </p>
      <h1 class="mt-1 text-2xl font-semibold">
        Giriş Yap
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Yönetici veya kat maliki hesabınızla devam edin.
      </p>
    </div>

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
          placeholder="••••••••"
          icon="i-lucide-lock"
          class="w-full"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
      >
        Giriş Yap
      </UButton>
    </UForm>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Hesabınız yok mu?
      <NuxtLink
        to="/register"
        class="font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        Kayıt olun
      </NuxtLink>
    </p>
  </div>
</template>
