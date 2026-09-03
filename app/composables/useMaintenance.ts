import type { MaintenanceRequest, MaintenanceStatus, PriorityLevel } from '~/types/database'

export function useMaintenance() {
  const supabase = useDb()
  const toast = useToast()
  const { user, profile, resolveSession, ensureSession } = useAuth()
  const items = useState<MaintenanceRequest[]>('maintenance-items', () => [])
  const pending = useState('maintenance-pending', () => false)
  const error = useState<string | null>('maintenance-error', () => null)

  async function fetchAll() {
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
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
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
    error.value = null
    try {
      const { userId } = await resolveSession()
      const reporterId = userId || user.value?.id || profile.value?.id
      if (!reporterId) {
        if (!hadItems) items.value = []
        return
      }

      const { data, error: fetchError } = await supabase
        .from('maintenance_requests')
        .select('*, apartment:apartments(*), reporter:profiles(*)')
        .eq('reporter_id', reporterId)
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
    attachment_path?: string | null
  }) {
    await ensureSession()
    const { session, userId } = await resolveSession()
    const reporterId = userId || user.value?.id || profile.value?.id

    if (!reporterId) {
      toast.add({
        title: 'Arıza bildirilemedi',
        description: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
        color: 'error'
      })
      return false
    }

    if (!session) {
      // JWT yoksa RPC auth.uid() çalışmaz — oturumu bir kez daha zorla
      const authClient = useSupabaseClient()
      await authClient.auth.refreshSession()
    }

    const { error: rpcError } = await supabase.rpc('resident_create_maintenance', {
      p_apartment_id: payload.apartment_id,
      p_title: payload.title,
      p_description: payload.description,
      p_priority: payload.priority ?? 'normal',
      p_attachment_path: payload.attachment_path ?? null
    })

    if (rpcError) {
      const { error: insertError } = await supabase.from('maintenance_requests').insert({
        apartment_id: payload.apartment_id,
        title: payload.title,
        description: payload.description,
        reporter_id: reporterId,
        priority: payload.priority ?? 'normal',
        status: 'open',
        attachment_path: payload.attachment_path ?? null
      })
        if (insertError) {
        toast.add({
          title: 'Arıza bildirilemedi',
          description: getErrorMessage(insertError),
          color: 'error'
        })
        return false
      }
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
