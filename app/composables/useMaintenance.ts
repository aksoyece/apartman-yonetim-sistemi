import type { MaintenanceRequest, MaintenanceStatus, PriorityLevel } from '~/types/database'

export function useMaintenance() {
  const supabase = useDb()
  const toast = useToast()
  const { user } = useAuth()
  const items = ref<MaintenanceRequest[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('maintenance_requests')
        .select('*, apartment:apartments(*), reporter:profiles(*)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as MaintenanceRequest[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function fetchMine() {
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('maintenance_requests')
        .select('*, apartment:apartments(*), reporter:profiles(*)')
        .eq('reporter_id', user.value?.id ?? '')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as MaintenanceRequest[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function create(payload: {
    apartment_id: string
    title: string
    description: string
    priority?: PriorityLevel
  }) {
    const { error: insertError } = await supabase.from('maintenance_requests').insert({
      ...payload,
      reporter_id: user.value?.id,
      priority: payload.priority ?? 'normal',
      status: 'open'
    })
    if (insertError) {
      toast.add({ title: 'Arıza bildirilemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }
    toast.add({ title: 'Arıza bildirimi oluşturuldu', color: 'success', icon: 'i-lucide-check' })
    await fetchMine()
    return true
  }

  async function updateStatus(id: string, status: MaintenanceStatus, admin_notes?: string | null) {
    const payload: Partial<MaintenanceRequest> = {
      status,
      admin_notes: admin_notes ?? null,
      resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : null
    }

    const { error: updateError } = await supabase
      .from('maintenance_requests')
      .update(payload)
      .eq('id', id)

    if (updateError) {
      toast.add({ title: 'Durum güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Durum güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  return {
    items,
    pending,
    error,
    fetchAll,
    fetchMine,
    create,
    updateStatus
  }
}
