<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { profile } = useAuth()
const { items: apartments, fetchMine, pending: aptPending, mineReady } = useApartments()
const { items: dues, fetchMine: fetchMyDues, pending: duesPending } = useDues()
const { items: announcements, fetchAll: fetchAnnouncements } = useAnnouncements()
const { items: maintenance, fetchMine: fetchMaintenance } = useMaintenance()
const { items: surveys, fetchAll: fetchSurveys } = useSurveys()

const pending = computed(() =>
  (aptPending.value && !apartments.value.length)
  || (duesPending.value && !dues.value.length)
  || (!mineReady.value && !apartments.value.length)
)

const pendingDuesTotal = computed(() =>
  dues.value
    .filter(d => d.status !== 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)
)

const paidDuesTotal = computed(() =>
  dues.value
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)
)

const openMaintenanceCount = computed(() =>
  maintenance.value.filter(m => m.status === 'open' || m.status === 'in_progress').length
)

const unpaidDues = computed(() => dues.value.filter(d => d.status !== 'paid').slice(0, 5))

const openSurveys = computed(() =>
  surveys.value
    .filter(s => s.status === 'open')
    .slice(0, 4)
)

const pendingSurveyVotes = computed(() =>
  surveys.value.filter(s => s.status === 'open' && !s.my_vote_option_id).length
)

onMounted(() => {
  // Hepsi paralel — aidat daire listesini beklemez
  void Promise.all([
    fetchMine(),
    fetchMyDues(),
    fetchAnnouncements(false),
    fetchMaintenance(),
    fetchSurveys(false)
  ])
})
</script>

<template>
  <div>
    <PageHeader
      title="Hoş geldiniz"
      :description="`${profile?.full_name || 'Kat maliki'}, dairenize ait özet bilgiler.`"
    />

    <LoadingState v-if="pending && !apartments.length && !dues.length" />

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Dairelerim"
          :value="String(apartments.length)"
          icon="i-lucide-door-open"
        />
        <StatCard
          title="Bekleyen Borç"
          :value="formatCurrency(pendingDuesTotal)"
          icon="i-lucide-clock-3"
          :critical="pendingDuesTotal > 0"
        />
        <StatCard
          title="Ödenen Aidat"
          :value="formatCurrency(paidDuesTotal)"
          icon="i-lucide-circle-check"
        />
        <StatCard
          title="Açık Arızalarım"
          :value="String(openMaintenanceCount)"
          icon="i-lucide-wrench"
          :critical="openMaintenanceCount > 0"
        />
        <StatCard
          title="Oy Bekleyen"
          :value="String(pendingSurveyVotes)"
          icon="i-lucide-vote"
          :critical="pendingSurveyVotes > 0"
        />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <PanelCard>
          <template #header>
            <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Son Duyurular
            </h2>
          </template>
          <EmptyState
            v-if="!announcements.length"
            title="Duyuru yok"
            description="Yönetim duyuru yayınladığında burada görünecek."
            icon="i-lucide-megaphone"
          />
          <ul
            v-else
            class="space-y-2"
          >
            <li
              v-for="item in announcements.slice(0, 4)"
              :key="item.id"
              class="rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/5"
            >
              <div class="mb-1 flex items-center gap-2">
                <p class="font-medium text-slate-900 dark:text-white">
                  {{ item.title }}
                </p>
                <UBadge
                  :color="priorityColors[item.priority]"
                  variant="subtle"
                  size="sm"
                >
                  {{ priorityLabels[item.priority] }}
                </UBadge>
              </div>
              <p class="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {{ item.content }}
              </p>
            </li>
          </ul>
        </PanelCard>

        <PanelCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Açık Anketler
              </h2>
              <UButton
                to="/resident/surveys"
                size="xs"
                color="neutral"
                variant="ghost"
              >
                Tümü
              </UButton>
            </div>
          </template>
          <EmptyState
            v-if="!openSurveys.length"
            title="Açık anket yok"
            description="Yeni anket açıldığında burada görünecek."
            icon="i-lucide-vote"
          />
          <ul
            v-else
            class="space-y-2"
          >
            <li
              v-for="item in openSurveys"
              :key="item.id"
              class="rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/5"
            >
              <p class="font-medium text-slate-900 dark:text-white">
                {{ item.title }}
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ item.total_votes || 0 }} oy
                <span v-if="item.my_vote_option_id"> · Oyunuz kaydedildi</span>
                <span v-else> · Oy vermediniz</span>
              </p>
              <UButton
                class="mt-2"
                size="xs"
                :to="'/resident/surveys'"
                :color="item.my_vote_option_id ? 'neutral' : 'primary'"
                :variant="item.my_vote_option_id ? 'outline' : 'solid'"
              >
                {{ item.my_vote_option_id ? 'Sonuçları Gör' : 'Oy Ver' }}
              </UButton>
            </li>
          </ul>
        </PanelCard>

        <PanelCard>
          <template #header>
            <h2 class="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Bekleyen Aidatlar
            </h2>
          </template>
          <EmptyState
            v-if="!unpaidDues.length"
            title="Borç bulunmuyor"
            description="Tüm aidatlarınız ödenmiş görünüyor."
            icon="i-lucide-badge-check"
          />
          <ul
            v-else
            class="space-y-2"
          >
            <li
              v-for="item in unpaidDues"
              :key="item.id"
              class="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/5"
            >
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">
                  {{ item.period }} · {{ apartmentLabel(item.apartment) }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Vade: {{ formatDate(item.due_date) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ formatCurrency(item.amount) }}
                </p>
                <UButton
                  size="xs"
                  class="mt-1"
                  to="/resident/dues"
                >
                  Öde
                </UButton>
              </div>
            </li>
          </ul>
        </PanelCard>
      </div>
    </template>
  </div>
</template>
