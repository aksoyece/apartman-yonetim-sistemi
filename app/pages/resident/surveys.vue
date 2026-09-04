<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: 'resident'
})

const { items, pending, error, fetchAll, vote } = useSurveys()
const votingId = ref<string | null>(null)

function percent(optionCount: number, total: number) {
  if (!total) return 0
  return Math.round((optionCount / total) * 100)
}

function canVote(item: { status: string, ends_at: string | null }) {
  if (item.status !== 'open') return false
  if (!item.ends_at) return true
  return new Date(item.ends_at).getTime() > Date.now()
}

async function onVote(surveyId: string, optionId: string) {
  votingId.value = optionId
  try {
    await vote(surveyId, optionId)
  } finally {
    votingId.value = null
  }
}

onMounted(() => fetchAll(false))
</script>

<template>
  <div>
    <PageHeader
      title="Anketler"
      description="Site kararlarına katılın; oy verdikçe sonuçlar güncellenir."
    />

    <ErrorState
      v-if="error"
      class="mb-6"
      :message="error"
      @retry="() => fetchAll(false)"
    />
    <LoadingState v-else-if="pending && !items.length" />
    <EmptyState
      v-else-if="!pending && !items.length"
      title="Açık anket yok"
      description="Yönetim yeni anket yayınladığında burada görünecek."
      icon="i-lucide-vote"
    />

    <div
      v-else
      class="space-y-4"
    >
      <PanelCard
        v-for="item in items"
        :key="item.id"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <h2 class="font-display text-xl font-semibold text-ink">
            {{ item.title }}
          </h2>
          <UBadge
            :color="surveyStatusColors[item.status]"
            variant="subtle"
          >
            {{ surveyStatusLabels[item.status] }}
          </UBadge>
        </div>
        <p
          v-if="item.description"
          class="mb-3 text-sm text-muted-ink"
        >
          {{ item.description }}
        </p>
        <p class="mb-4 text-xs text-muted-ink">
          {{ item.total_votes || 0 }} oy
          <span v-if="item.ends_at"> · Son: {{ formatDateTime(item.ends_at) }}</span>
          <span v-if="item.my_vote_option_id"> · Oyunuz kaydedildi</span>
        </p>

        <ul class="space-y-2">
          <li
            v-for="option in item.options"
            :key="option.id"
            class="rounded-md border px-3 py-3"
            :class="item.my_vote_option_id === option.id
              ? 'border-[var(--ays-accent)] bg-[color-mix(in_srgb,var(--ays-accent)_14%,transparent)]'
              : 'border-line'"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-ink">
                  {{ option.label }}
                </p>
                <p class="mt-1 text-xs font-medium !text-[#1E2A38] dark:!text-white">
                  {{ option.vote_count || 0 }} oy · %{{ percent(option.vote_count || 0, item.total_votes || 0) }}
                </p>
                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    class="h-full rounded-full bg-[var(--ays-accent)]"
                    :style="{ width: `${percent(option.vote_count || 0, item.total_votes || 0)}%` }"
                  />
                </div>
              </div>
              <UButton
                v-if="canVote(item)"
                size="sm"
                :variant="item.my_vote_option_id === option.id ? 'solid' : 'soft'"
                :color="item.my_vote_option_id === option.id ? 'primary' : 'neutral'"
                :loading="votingId === option.id"
                @click="onVote(item.id, option.id)"
              >
                {{ item.my_vote_option_id === option.id ? 'Seçildi' : 'Oy Ver' }}
              </UButton>
            </div>
          </li>
        </ul>
      </PanelCard>
    </div>
  </div>
</template>
