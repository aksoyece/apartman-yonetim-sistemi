<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { signUp, loading, homePathForRole } = useAuth()

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
  const result = await signUp({
    email: event.data.email,
    password: event.data.password,
    full_name: event.data.full_name,
    phone: event.data.phone,
    role: event.data.role
  })

  if (!result) return

  if (result.signedIn && result.profile) {
    await navigateTo(homePathForRole(result.profile.role), { replace: true })
    return
  }

  await navigateTo('/login')
}
</script>

<template>
  <AuthShell
    title="Kayıt Ol"
    description="Yeni hesap oluşturun. İlk yönetici hesabını buradan açabilirsiniz."
  >
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
          size="lg"
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
          size="lg"
          placeholder="ornek@mail.com"
          icon="i-lucide-mail"
          class="w-full"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Telefon"
          name="phone"
        >
          <UInput
            v-model="state.phone"
            size="lg"
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
            size="lg"
            :items="roleItems"
            class="w-full"
          />
        </UFormField>
      </div>

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
        Kayıt Ol
      </UButton>
    </UForm>

    <p class="mt-6 text-sm text-slate-500 dark:text-slate-400">
      Zaten hesabınız var mı?
      <NuxtLink
        to="/login"
        class="font-medium text-accent hover:underline"
      >
        Giriş yapın
      </NuxtLink>
    </p>
  </AuthShell>
</template>
