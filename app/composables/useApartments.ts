import type { Apartment, Profile } from '~/types/database'

let apartmentsMineInflight: Promise<void> | null = null

export function useApartments() {
  const supabase = useDb()
  const toast = useToast()
  // Sayfalar arası paylaşılan önbellek — menü değişince boş ekran olmasın
  const items = useState<(Apartment & { owner?: Profile | null })[]>('apartments-items', () => [])
  const pending = useState('apartments-pending', () => false)
  const error = useState<string | null>('apartments-error', () => null)
  const mineReady = useState('apartments-mine-ready', () => false)

  async function fetchAll() {
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('apartments')
        .select('*, owner:profiles(*)')
        .order('floor')
        .order('number')

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Apartment[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function create(payload: {
    number: string
    floor: number
    block?: string | null
    owner_id?: string | null
    area_m2?: number | null
    notes?: string | null
  }) {
    const { error: insertError } = await supabase.from('apartments').insert(payload)
    if (insertError) {
      toast.add({ title: 'Daire eklenemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }
    toast.add({ title: 'Daire eklendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function update(id: string, payload: Partial<Apartment>) {
    const { error: updateError } = await supabase.from('apartments').update(payload).eq('id', id)
    if (updateError) {
      toast.add({ title: 'Güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Daire güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from('apartments').delete().eq('id', id)
    if (deleteError) {
      toast.add({ title: 'Silinemedi', description: getErrorMessage(deleteError), color: 'error' })
      return false
    }
    toast.add({ title: 'Daire silindi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function resolveOwnerId(maxWaitMs = 3000): Promise<string | null> {
    const { profile, resolveSession } = useAuth()
    if (profile.value?.id) return profile.value.id
    const { userId } = await resolveSession(maxWaitMs)
    return userId
  }

  async function fetchMine() {
    if (apartmentsMineInflight) return apartmentsMineInflight

    apartmentsMineInflight = (async () => {
      const hadItems = items.value.length > 0
      if (!hadItems) pending.value = true
      error.value = null
      if (!hadItems) mineReady.value = false

      try {
        const ownerId = await resolveOwnerId()
        if (!ownerId) {
          if (!hadItems) items.value = []
          return
        }

        const { data, error: fetchError } = await supabase
          .from('apartments')
          .select('*')
          .eq('owner_id', ownerId)
          .order('number')

        if (fetchError) throw fetchError
        items.value = (data ?? []) as Apartment[]
      } catch (err) {
        error.value = getErrorMessage(err)
      } finally {
        pending.value = false
        mineReady.value = true
      }
    })().finally(() => {
      apartmentsMineInflight = null
    })

    return apartmentsMineInflight
  }

  return {
    items,
    pending,
    error,
    mineReady,
    fetchAll,
    fetchMine,
    create,
    update,
    remove
  }
}
