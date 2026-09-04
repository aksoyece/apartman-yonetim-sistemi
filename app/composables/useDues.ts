import type { Due, DueStatus } from '~/types/database'

let duesMineInflight: Promise<void> | null = null

export function useDues() {
  const supabase = useDb()
  const toast = useToast()
  const items = useState<Due[]>('dues-items', () => [])
  const pending = useState('dues-pending', () => false)
  const error = useState<string | null>('dues-error', () => null)

  async function fetchAll() {
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('dues')
        .select('*, apartment:apartments(*)')
        .order('due_date', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Due[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function fetchByApartmentIds(apartmentIds: string[]) {
    if (!apartmentIds.length) {
      items.value = []
      pending.value = false
      error.value = null
      return
    }
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('dues')
        .select('*, apartment:apartments(*)')
        .in('apartment_id', apartmentIds)
        .order('due_date', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Due[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  /** Daire listesini beklemeden, oturumdaki malikin aidatlarını çeker */
  async function fetchMine() {
    if (duesMineInflight) return duesMineInflight

    duesMineInflight = (async () => {
      const hadItems = items.value.length > 0
      if (!hadItems) pending.value = true
      error.value = null
      try {
        const { profile, resolveSession } = useAuth()
        const userId = profile.value?.id || (await resolveSession()).userId
        if (!userId) {
          if (!hadItems) items.value = []
          return
        }

        const { data, error: fetchError } = await supabase
          .from('dues')
          .select('*, apartment:apartments!inner(*)')
          .eq('apartment.owner_id', userId)
          .order('due_date', { ascending: false })

        if (fetchError) throw fetchError
        items.value = (data ?? []) as Due[]
      } catch (err) {
        error.value = getErrorMessage(err)
      } finally {
        pending.value = false
      }
    })().finally(() => {
      duesMineInflight = null
    })

    return duesMineInflight
  }

  async function create(payload: {
    apartment_id: string
    amount: number
    due_date: string
    period: string
    status?: DueStatus
    description?: string | null
  }) {
    const { error: insertError } = await supabase.from('dues').insert({
      ...payload,
      status: payload.status ?? 'pending'
    })
    if (insertError) {
      toast.add({ title: 'Aidat eklenemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }
    toast.add({ title: 'Aidat eklendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function update(id: string, payload: Partial<Due>) {
    const { error: updateError } = await supabase.from('dues').update(payload).eq('id', id)
    if (updateError) {
      toast.add({ title: 'Güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Aidat güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from('dues').delete().eq('id', id)
    if (deleteError) {
      toast.add({ title: 'Silinemedi', description: getErrorMessage(deleteError), color: 'error' })
      return false
    }
    toast.add({ title: 'Aidat silindi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  return {
    items,
    pending,
    error,
    fetchAll,
    fetchByApartmentIds,
    fetchMine,
    create,
    update,
    remove
  }
}
