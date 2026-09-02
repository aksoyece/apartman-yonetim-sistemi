import type { Apartment, Profile } from '~/types/database'

export function useApartments() {
  const supabase = useDb()
  const toast = useToast()
  const items = ref<(Apartment & { owner?: Profile | null })[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    pending.value = true
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

  async function fetchMine() {
    pending.value = true
    error.value = null
    try {
      const user = useSupabaseUser()
      const { data, error: fetchError } = await supabase
        .from('apartments')
        .select('*')
        .eq('owner_id', user.value?.id ?? '')
        .order('number')

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Apartment[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  return {
    items,
    pending,
    error,
    fetchAll,
    fetchMine,
    create,
    update,
    remove
  }
}
