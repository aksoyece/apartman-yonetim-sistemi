<script setup lang="ts">
import type { MonthlyChartPoint } from '~/types/database'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: MonthlyChartPoint[]
}>()

const colorMode = useColorMode()

const chartData = computed(() => ({
  labels: props.data.map(item => item.month),
  datasets: [
    {
      label: 'Gelir',
      backgroundColor: '#0ea5e9',
      borderRadius: 8,
      data: props.data.map(item => item.income)
    },
    {
      label: 'Gider',
      backgroundColor: '#f97316',
      borderRadius: 8,
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
        color: colorMode.value === 'dark' ? '#cbd5e1' : '#475569'
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: colorMode.value === 'dark' ? '#94a3b8' : '#64748b'
      },
      grid: {
        display: false
      }
    },
    y: {
      ticks: {
        color: colorMode.value === 'dark' ? '#94a3b8' : '#64748b'
      },
      grid: {
        color: colorMode.value === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)'
      }
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
        title="Grafik verisi yok"
        description="Gelir ve gider kayıtları oluştukça aylık grafik burada görünecek."
        icon="i-lucide-bar-chart-3"
      />
    </ClientOnly>
  </div>
</template>
