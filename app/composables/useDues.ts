import type { Due, DueStatus } from '~/types/database'

export function useDues() {
  const supabase = useDb()
  const toast = useToast()
  const items = ref<Due[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    pending.value = true
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
      return
    }
    pending.value = true
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
    create,
    update,
    remove
  }
}
