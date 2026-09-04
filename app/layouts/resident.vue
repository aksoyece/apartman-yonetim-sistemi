<script setup lang="ts">
const links = [{
  label: 'Özet',
  icon: 'i-lucide-home',
  to: '/resident'
}, {
  label: 'Dairem',
  icon: 'i-lucide-door-open',
  to: '/resident/apartment'
}, {
  label: 'Aidatlar',
  icon: 'i-lucide-receipt',
  to: '/resident/dues'
}, {
  label: 'Ödemeler',
  icon: 'i-lucide-wallet',
  to: '/resident/payments'
}, {
  label: 'Duyurular',
  icon: 'i-lucide-megaphone',
  to: '/resident/announcements'
}, {
  label: 'Anketler',
  icon: 'i-lucide-vote',
  to: '/resident/surveys'
}, {
  label: 'Arıza Bildirimi',
  icon: 'i-lucide-wrench',
  to: '/resident/maintenance'
}]

// Portal açılır açılmaz sık kullanılan veriyi ısıt
const { fetchMine } = useApartments()
const { fetchMine: fetchMyDues } = useDues()
const { fetchMine: fetchMyPayments } = usePayments()
const { fetchAll: fetchAnnouncements } = useAnnouncements()
onMounted(() => {
  void Promise.all([
    fetchMine(),
    fetchMyDues(),
    fetchMyPayments(),
    fetchAnnouncements(false)
  ])
})
</script>

<template>
  <PanelShell
    :links="links"
    subtitle="Kat Maliki Portalı"
    header-label="Portal"
    home-path="/resident"
    brand-icon="i-lucide-home"
  >
    <slot />
  </PanelShell>
</template>
