<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="auth-card grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
    <section class="auth-aside relative hidden min-h-[34rem] p-10 lg:flex lg:flex-col lg:justify-between">
      <div>
        <img
          src="/yonetix-logo.svg"
          alt="YönetiX"
          class="mb-5 size-16 object-contain"
        >
        <p class="font-display text-4xl font-semibold tracking-tight text-ink xl:text-5xl">
          Yöneti<span class="text-accent">X</span>
        </p>
        <p class="mt-2 text-sm font-medium text-muted-ink">
          Apartman Yönetim Sistemi
        </p>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-muted-ink">
          Aidat, ödeme, gider, anket ve arıza süreçlerini tek yerden yönetin.
        </p>
      </div>

      <ul class="space-y-3 text-sm text-muted-ink">
        <li class="flex items-center gap-3">
          <span class="flex size-8 items-center justify-center rounded-[5px] bg-soft text-ink">
            <UIcon
              name="i-lucide-building-2"
              class="size-4"
            />
          </span>
          Daire ve kat maliki yönetimi
        </li>
        <li class="flex items-center gap-3">
          <span class="flex size-8 items-center justify-center rounded-[5px] bg-soft text-ink">
            <UIcon
              name="i-lucide-wallet"
              class="size-4"
            />
          </span>
          Aidat, ödeme ve gider takibi
        </li>
        <li class="flex items-center gap-3">
          <span class="flex size-8 items-center justify-center rounded-[5px] bg-soft text-ink">
            <UIcon
              name="i-lucide-bell"
              class="size-4"
            />
          </span>
          Duyuru ve arıza bildirimleri
        </li>
      </ul>
    </section>

    <section class="relative bg-surface p-6 sm:p-8">
      <div class="mb-2 lg:hidden">
        <div class="mb-3 flex items-center gap-3">
          <img
            src="/yonetix-logo.svg"
            alt="YönetiX"
            class="size-10 object-contain"
          >
          <p class="font-display text-2xl font-semibold tracking-tight text-ink">
            Yöneti<span class="text-accent">X</span>
          </p>
        </div>
        <p class="mb-4 text-xs text-muted-ink">
          Apartman Yönetim Sistemi
        </p>
      </div>
      <div class="mb-6">
        <h1 class="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {{ title }}
        </h1>
        <p class="mt-2 text-sm text-muted-ink">
          {{ description }}
        </p>
      </div>
      <slot />
    </section>
  </div>
</template>
