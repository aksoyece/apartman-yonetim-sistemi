import type { DashboardStats, MonthlyChartPoint, Payment } from '~/types/database'

export function useDashboard() {
  const supabase = useDb()
  const pending = ref(false)
  const error = ref<string | null>(null)
  const stats = ref<DashboardStats>({
    totalApartments: 0,
    collectedDues: 0,
    pendingDues: 0,
    totalExpenses: 0,
    netBalance: 0,
    openMaintenance: 0
  })
  const chartData = ref<MonthlyChartPoint[]>([])
  const recentPayments = ref<Payment[]>([])

  async function fetchDashboard() {
    pending.value = true
    error.value = null

    try {
      const [
        apartmentsRes,
        paidDuesRes,
        pendingDuesRes,
        expensesRes,
        maintenanceRes,
        paymentsRes,
        allPaymentsRes,
        allExpensesRes
      ] = await Promise.all([
        supabase.from('apartments').select('id', { count: 'exact', head: true }),
        supabase.from('dues').select('amount').eq('status', 'paid'),
        supabase.from('dues').select('amount').in('status', ['pending', 'overdue', 'partial']),
        supabase.from('expenses').select('amount'),
        supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase
          .from('payments')
          .select('*, apartment:apartments(*)')
          .order('payment_date', { ascending: false })
          .limit(8),
        supabase.from('payments').select('amount, payment_date'),
        supabase.from('expenses').select('amount, expense_date')
      ])

      if (apartmentsRes.error) throw apartmentsRes.error
      if (paidDuesRes.error) throw paidDuesRes.error
      if (pendingDuesRes.error) throw pendingDuesRes.error
      if (expensesRes.error) throw expensesRes.error
      if (maintenanceRes.error) throw maintenanceRes.error
      if (paymentsRes.error) throw paymentsRes.error
      if (allPaymentsRes.error) throw allPaymentsRes.error
      if (allExpensesRes.error) throw allExpensesRes.error

      const collected = (paidDuesRes.data ?? []).reduce((sum: number, row: { amount: number | string }) => sum + Number(row.amount), 0)
      const pendingAmount = (pendingDuesRes.data ?? []).reduce((sum: number, row: { amount: number | string }) => sum + Number(row.amount), 0)
      const expensesTotal = (expensesRes.data ?? []).reduce((sum: number, row: { amount: number | string }) => sum + Number(row.amount), 0)
      const incomeTotal = (allPaymentsRes.data ?? []).reduce((sum: number, row: { amount: number | string }) => sum + Number(row.amount), 0)

      stats.value = {
        totalApartments: apartmentsRes.count ?? 0,
        collectedDues: collected,
        pendingDues: pendingAmount,
        totalExpenses: expensesTotal,
        netBalance: incomeTotal - expensesTotal,
        openMaintenance: maintenanceRes.count ?? 0
      }

      recentPayments.value = (paymentsRes.data ?? []) as Payment[]
      chartData.value = buildMonthlyChart(allPaymentsRes.data ?? [], allExpensesRes.data ?? [])
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    error,
    stats,
    chartData,
    recentPayments,
    fetchDashboard
  }
}

function buildMonthlyChart(
  payments: Array<{ amount: number | string, payment_date: string }>,
  expenses: Array<{ amount: number | string, expense_date: string }>
): MonthlyChartPoint[] {
  const map = new Map<string, MonthlyChartPoint>()

  const ensure = (key: string, label: string) => {
    if (!map.has(key)) {
      map.set(key, { month: label, income: 0, expense: 0 })
    }
    return map.get(key)!
  }

  for (const payment of payments) {
    const date = new Date(payment.payment_date)
    if (Number.isNaN(date.getTime())) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
    ensure(key, label).income += Number(payment.amount)
  }

  for (const expense of expenses) {
    const date = new Date(expense.expense_date)
    if (Number.isNaN(date.getTime())) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
    ensure(key, label).expense += Number(expense.amount)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, value]) => value)
}
