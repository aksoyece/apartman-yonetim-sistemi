<script setup lang="ts">
import type { MonthlyChartPoint } from '~/types/database'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  data: MonthlyChartPoint[]
}>()

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const chartData = computed(() => ({
  labels: props.data.map(item => item.month),
  datasets: [
    {
      label: 'Gelir',
      backgroundColor: isDark.value ? '#4A8A76' : '#2F5D50',
      borderRadius: 2,
      data: props.data.map(item => item.income)
    },
    {
      label: 'Gider',
      backgroundColor: isDark.value ? '#9CA3AF' : '#1E2A38',
      borderRadius: 2,
      data: props.data.map(item => item.expense)
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: isDark.value ? '#9CA3AF' : '#6B7280',
        boxWidth: 12,
        font: { family: 'Source Sans 3', size: 12 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: isDark.value ? '#9CA3AF' : '#6B7280' },
      grid: { display: false },
      border: { color: isDark.value ? '#2C3642' : '#DEDAD0' }
    },
    y: {
      ticks: { color: isDark.value ? '#9CA3AF' : '#6B7280' },
      grid: { color: isDark.value ? '#1E2732' : '#EFECE5' },
      border: { color: isDark.value ? '#2C3642' : '#DEDAD0' }
    }
  }
}))
</script>

<template>
  <div class="h-72 w-full">
    <ClientOnly>
      <Bar
        v-if="data.length"
        :data="chartData"
        :options="chartOptions"
      />
      <EmptyState
        v-else
        quiet
        message="Henüz veri yok — ilk kaydı ekleyin."
      />
    </ClientOnly>
  </div>
</template>
