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
  const { user } = useAuth()
  const items = ref<AppNotification[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  const unreadCount = computed(() => items.value.filter(n => !n.is_read).length)

  async function fetchAll() {
    if (!user.value) {
      items.value = []
      return
    }
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.value.id)
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
    if (!user.value) return
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.value.id)
      .eq('is_read', false)

    if (updateError) {
      toast.add({ title: 'İşlem başarısız', description: getErrorMessage(updateError), color: 'error' })
      return
    }
    items.value = items.value.map(n => ({ ...n, is_read: true }))
  }

  function subscribeRealtime() {
    if (!user.value) return () => {}

    const channel = useSupabaseClient()
      .channel(`notifications-${user.value.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.value.id}`
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

    return () => {
      useSupabaseClient().removeChannel(channel)
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
