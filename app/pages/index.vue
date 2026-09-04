<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

const { isAuthenticated, profile, homePathForRole } = useAuth()

watchEffect(() => {
  if (isAuthenticated.value && profile.value) {
    navigateTo(homePathForRole(profile.value.role))
  }
})

const features = [
  {
    icon: 'i-lucide-receipt',
    title: 'Aidat ve ödemeler',
    text: 'Borç takibi, tahsilat kaydı ve ödeme geçmişi tek panelde.',
    tone: 'text-accent bg-[color-mix(in_srgb,var(--ays-accent)_14%,transparent)]'
  },
  {
    icon: 'i-lucide-megaphone',
    title: 'Duyurular',
    text: 'Site bilgilendirmelerini anında yayınlayın, herkes görsün.',
    tone: 'text-[#3B6B9A] bg-[#3B6B9A]/15 dark:text-[#8BB4DC] dark:bg-[#3B6B9A]/20'
  },
  {
    icon: 'i-lucide-vote',
    title: 'Anket ve karar alma',
    text: 'Ortak kararlar için hızlı oylama açın, sonuçları canlı izleyin.',
    tone: 'text-ink bg-soft'
  },
  {
    icon: 'i-lucide-wrench',
    title: 'Arıza bildirimleri',
    text: 'Kat malikleri talep oluştursun, yönetim durumu güncellesin.',
    tone: 'text-ink bg-soft'
  },
  {
    icon: 'i-lucide-wallet',
    title: 'Gider ve raporlar',
    text: 'Ortak giderleri kaydedin; gelir-gider özetini raporlayın.',
    tone: 'text-ink bg-soft'
  },
  {
    icon: 'i-lucide-bell',
    title: 'Bildirimler',
    text: 'Yeni duyuru, anket ve arıza güncellemeleri uygulama içinde düşer.',
    tone: 'text-ink bg-soft'
  }
]
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-90"
      style="background:
        radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--ays-accent) 18%, transparent), transparent 70%),
        linear-gradient(180deg, var(--ays-soft) 0%, var(--ays-canvas) 55%);"
    />

    <header class="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
      <AppLogo size="sm" />
      <div class="flex items-center gap-1.5">
        <div class="inline-flex size-8 items-center justify-center">
          <UColorModeButton size="sm" />
        </div>
        <UButton
          to="/login"
          color="neutral"
          variant="ghost"
          size="sm"
          prefetch
        >
          Giriş
        </UButton>
        <UButton
          to="/register"
          size="sm"
          prefetch
        >
          Kayıt Ol
        </UButton>
      </div>
    </header>

    <main class="relative z-10">
      <section class="mx-auto flex min-h-[72vh] max-w-5xl flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-8">
        <img
          src="/yonetix-logo.svg"
          alt="YönetiX"
          class="ays-rise size-24 object-contain sm:size-28"
        >
        <p class="ays-rise mt-5 font-display text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          Yöneti<span class="text-accent">X</span>
        </p>
        <p class="mt-3 font-display text-lg font-medium text-muted-ink sm:text-xl">
          Apartman Yönetim Sistemi
        </p>
        <p class="ays-rise-delay mx-auto mt-5 max-w-xl text-base text-muted-ink sm:text-lg">
          Aidat, duyuru, anket ve arıza süreçlerini tek yerden yönetin; site işleri sadeleşsin.
        </p>
        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/login"
            size="xl"
            icon="i-lucide-log-in"
            prefetch
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
            prefetch
          >
            Kayıt Ol
          </UButton>
        </div>
      </section>

      <section class="border-t border-line bg-surface/60 px-5 py-16 sm:px-8">
        <div class="mx-auto max-w-5xl">
          <h2 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Neler sunuyor?
          </h2>
          <p class="mt-2 max-w-2xl text-muted-ink">
            Yönetici ve kat maliki için net paneller; günlük apartman işleri tek uygulamada.
          </p>

          <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="item in features"
              :key="item.title"
              class="rounded-[5px] border border-line bg-canvas p-5"
            >
              <span
                class="flex size-10 items-center justify-center rounded-[5px]"
                :class="item.tone"
              >
                <UIcon
                  :name="item.icon"
                  class="size-5"
                />
              </span>
              <p class="mt-4 font-medium text-ink">
                {{ item.title }}
              </p>
              <p class="mt-1.5 text-sm leading-relaxed text-muted-ink">
                {{ item.text }}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section class="px-5 py-16 sm:px-8">
        <div class="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-accent">
              Yönetici
            </p>
            <h3 class="mt-2 font-display text-xl font-semibold">
              Siteyi uçtan uca yönetin
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-ink">
              Daire, kat maliki, aidat, ödeme, gider, duyuru, anket ve arıza kayıtlarını tek panelden takip edin; rapor alın.
            </p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-accent">
              Kat maliki
            </p>
            <h3 class="mt-2 font-display text-xl font-semibold">
              Dairenizi kolay izleyin
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-ink">
              Borç durumunu görün, duyuruları okuyun, anketlere katılın ve arıza bildirimi oluşturun.
            </p>
          </div>
        </div>
      </section>

      <section class="border-t border-line px-5 py-14 text-center sm:px-8">
        <h2 class="font-display text-2xl font-semibold tracking-tight">
          Site yönetimine hemen başlayın
        </h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-muted-ink">
          Hesap oluşturun veya mevcut hesabınızla panele giriş yapın.
        </p>
        <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/register"
            size="lg"
            prefetch
          >
            Kayıt Ol
          </UButton>
          <UButton
            to="/login"
            size="lg"
            color="neutral"
            variant="outline"
            class="border-line"
            prefetch
          >
            Giriş Yap
          </UButton>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-dashed border-line px-5 py-10 text-center sm:px-8">
      <p class="font-mono text-xs tracking-wide text-muted-ink">
        © 2026 YönetiX · Designed &amp; developed by
        <a
          href="https://github.com/aksoyece"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:text-ink"
        >Ece Aksoy</a>
      </p>
    </footer>
  </div>
</template>
