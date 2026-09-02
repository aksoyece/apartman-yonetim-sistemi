import type { Payment, PaymentMethod } from '~/types/database'

export function usePayments() {
  const supabase = useDb()
  const toast = useToast()
  const { user } = useAuth()
  const items = ref<Payment[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*, apartment:apartments(*), due:dues(*)')
        .order('payment_date', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Payment[]
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
        .from('payments')
        .select('*, apartment:apartments(*), due:dues(*)')
        .in('apartment_id', apartmentIds)
        .order('payment_date', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Payment[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function create(payload: {
    apartment_id: string
    due_id?: string | null
    amount: number
    payment_date: string
    method: PaymentMethod
    notes?: string | null
  }) {
    const { error: insertError } = await supabase.from('payments').insert({
      ...payload,
      recorded_by: user.value?.id ?? null
    })
    if (insertError) {
      toast.add({ title: 'Ödeme kaydedilemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }

    if (payload.due_id) {
      await supabase.from('dues').update({ status: 'paid' }).eq('id', payload.due_id)
    }

    toast.add({ title: 'Ödeme kaydedildi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from('payments').delete().eq('id', id)
    if (deleteError) {
      toast.add({ title: 'Silinemedi', description: getErrorMessage(deleteError), color: 'error' })
      return false
    }
    toast.add({ title: 'Ödeme silindi', color: 'success', icon: 'i-lucide-check' })
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
    remove
  }
}
