export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const supabase = useDb()
  const toast = useToast()
  const { profile, resolveSession } = useAuth()
  const items = useState<AppNotification[]>('notifications-items', () => [])
  const pending = useState('notifications-pending', () => false)
  const error = useState<string | null>('notifications-error', () => null)

  const unreadCount = computed(() => items.value.filter(n => !n.is_read).length)

  async function currentUserId() {
    return profile.value?.id || (await resolveSession()).userId
  }

  async function fetchAll() {
    const userId = await currentUserId()
    if (!userId) {
      items.value = []
      return
    }
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(40)

      if (fetchError) throw fetchError
      items.value = (data ?? []) as AppNotification[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function markRead(id: string) {
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (updateError) {
      toast.add({ title: 'Okundu işaretlenemedi', description: getErrorMessage(updateError), color: 'error' })
      return
    }
    const target = items.value.find(n => n.id === id)
    if (target) target.is_read = true
  }

  async function markAllRead() {
    const userId = await currentUserId()
    if (!userId) return
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (updateError) {
      toast.add({ title: 'İşlem başarısız', description: getErrorMessage(updateError), color: 'error' })
      return
    }
    items.value = items.value.map(n => ({ ...n, is_read: true }))
  }

  function subscribeRealtime() {
    let stopped = false
    let unsubscribe: (() => void) | null = null

    ;(async () => {
      const userId = await currentUserId()
      if (!userId || stopped) return

      const channel = useSupabaseClient()
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const row = payload.new as AppNotification
            items.value = [row, ...items.value]
            toast.add({
              title: row.title,
              description: row.body || undefined,
              color: 'info',
              icon: 'i-lucide-bell'
            })
          }
        )
        .subscribe()

      unsubscribe = () => {
        useSupabaseClient().removeChannel(channel)
      }
    })()

    return () => {
      stopped = true
      unsubscribe?.()
    }
  }

  return {
    items,
    pending,
    error,
    unreadCount,
    fetchAll,
    markRead,
    markAllRead,
    subscribeRealtime
  }
}
