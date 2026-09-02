<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { signUp, loading } = useAuth()

const schema = z.object({
  full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  role: z.enum(['admin', 'resident'])
})

type Schema = z.output<typeof schema>

const state = reactive({
  full_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'resident' as 'admin' | 'resident'
})

const roleItems = [
  { label: 'Kat Maliki', value: 'resident' },
  { label: 'Yönetici', value: 'admin' }
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const ok = await signUp({
    email: event.data.email,
    password: event.data.password,
    full_name: event.data.full_name,
    phone: event.data.phone,
    role: event.data.role
  })
  if (ok) {
    await navigateTo('/login')
  }
}
</script>

<template>
  <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl backdrop-blur dark:bg-slate-900/90 dark:text-white sm:p-8">
    <div class="mb-6">
      <p class="text-sm font-medium text-sky-600 dark:text-sky-400">
        Apartman YS
      </p>
      <h1 class="mt-1 text-2xl font-semibold">
        Kayıt Ol
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Yeni hesap oluşturun. İlk yönetici hesabını buradan açabilirsiniz.
      </p>
    </div>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="Ad Soyad"
        name="full_name"
        required
      >
        <UInput
          v-model="state.full_name"
          placeholder="Ad Soyad"
          icon="i-lucide-user"
          class="w-full"
        />
      </UFormField>

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
        label="Telefon"
        name="phone"
      >
        <UInput
          v-model="state.phone"
          placeholder="05xx xxx xx xx"
          icon="i-lucide-phone"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Rol"
        name="role"
        required
      >
        <USelect
          v-model="state.role"
          :items="roleItems"
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
        Kayıt Ol
      </UButton>
    </UForm>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Zaten hesabınız var mı?
      <NuxtLink
        to="/login"
        class="font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        Giriş yapın
      </NuxtLink>
    </p>
  </div>
</template>
