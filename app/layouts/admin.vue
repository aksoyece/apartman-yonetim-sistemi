<script setup lang="ts">
const links = [{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/admin'
}, {
  label: 'Daireler',
  icon: 'i-lucide-building-2',
  to: '/admin/apartments'
}, {
  label: 'Kat Malikleri',
  icon: 'i-lucide-users',
  to: '/admin/residents'
}, {
  label: 'Aidatlar',
  icon: 'i-lucide-receipt',
  to: '/admin/dues'
}, {
  label: 'Ödemeler',
  icon: 'i-lucide-wallet',
  to: '/admin/payments'
}, {
  label: 'Giderler',
  icon: 'i-lucide-pie-chart',
  to: '/admin/expenses'
}, {
  label: 'Duyurular',
  icon: 'i-lucide-megaphone',
  to: '/admin/announcements'
}, {
  label: 'Anketler',
  icon: 'i-lucide-vote',
  to: '/admin/surveys'
}, {
  label: 'Arıza Bildirimleri',
  icon: 'i-lucide-wrench',
  to: '/admin/maintenance'
}, {
  label: 'Raporlar',
  icon: 'i-lucide-bar-chart-3',
  to: '/admin/reports'
}]
</script>

<template>
  <PanelShell
    :links="links"
    subtitle="Yönetici Paneli"
    header-label="Yönetim"
    home-path="/admin"
    brand-icon="i-lucide-building-2"
  >
    <slot />
  </PanelShell>
</template>
