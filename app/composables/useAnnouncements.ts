import type { Announcement, PriorityLevel } from '~/types/database'

export function useAnnouncements() {
  const supabase = useDb()
  const toast = useToast()
  const { user, resolveSession } = useAuth()
  const items = useState<Announcement[]>('announcements-items', () => [])
  const pending = useState('announcements-pending', () => true)
  const error = useState<string | null>('announcements-error', () => null)
  const lastIncludeInactive = useState<boolean | null>('announcements-include-inactive', () => null)

  async function fetchAll(includeInactive = false) {
    const hasCache = items.value.length > 0 && lastIncludeInactive.value === includeInactive
    // İlk yüklemede tam loading; yenilemede listeyi gizleme
    if (!hasCache) pending.value = true
    error.value = null
    try {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false })

      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      items.value = (data ?? []) as Announcement[]
      lastIncludeInactive.value = includeInactive
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function create(payload: {
    title: string
    content: string
    priority?: PriorityLevel
    is_active?: boolean
  }) {
    const { userId } = await resolveSession()
    const { error: insertError } = await supabase.from('announcements').insert({
      ...payload,
      priority: payload.priority ?? 'normal',
      is_active: payload.is_active ?? true,
      created_by: userId || user.value?.id || null
    })
    if (insertError) {
      toast.add({ title: 'Duyuru eklenemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }
    toast.add({ title: 'Duyuru yayınlandı', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(true)
    return true
  }

  async function update(id: string, payload: Partial<Announcement>) {
    const { error: updateError } = await supabase.from('announcements').update(payload).eq('id', id)
    if (updateError) {
      toast.add({ title: 'Güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Duyuru güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(true)
    return true
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from('announcements').delete().eq('id', id)
    if (deleteError) {
      toast.add({ title: 'Silinemedi', description: getErrorMessage(deleteError), color: 'error' })
      return false
    }
    toast.add({ title: 'Duyuru silindi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(true)
    return true
  }

  return {
    items,
    pending,
    error,
    fetchAll,
    create,
    update,
    remove
  }
}
