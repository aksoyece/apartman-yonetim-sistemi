import type { Payment, PaymentMethod } from '~/types/database'

export function usePayments() {
  const supabase = useDb()
  const toast = useToast()
  const { user } = useAuth()
  const items = useState<Payment[]>('payments-items', () => [])
  const pending = useState('payments-pending', () => false)
  const error = useState<string | null>('payments-error', () => null)

  async function fetchAll() {
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
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
      pending.value = false
      error.value = null
      return
    }
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
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

  /** Daire listesini beklemeden malikin ödemelerini çeker */
  async function fetchMine() {
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
        .from('payments')
        .select('*, apartment:apartments!inner(*), due:dues(*)')
        .eq('apartment.owner_id', userId)
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
    const { resolveSession } = useAuth()
    const { userId } = await resolveSession()
    const { error: insertError } = await supabase.from('payments').insert({
      ...payload,
      recorded_by: userId || user.value?.id || null
    })
    if (insertError) {
      toast.add({ title: 'Ödeme kaydedilemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }

    if (payload.due_id) {
      const { error: dueError } = await supabase
        .from('dues')
        .update({ status: 'paid' })
        .eq('id', payload.due_id)
      if (dueError) {
        toast.add({
          title: 'Ödeme kaydedildi',
          description: 'Ancak aidat durumu güncellenemedi: ' + getErrorMessage(dueError),
          color: 'warning'
        })
        await fetchAll()
        return true
      }
    }

    toast.add({ title: 'Ödeme kaydedildi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function payDue(dueId: string, method: PaymentMethod = 'transfer', notes?: string | null) {
    const { ensureSession } = useAuth()
    await ensureSession()

    const { error: rpcError } = await supabase.rpc('resident_pay_due', {
      p_due_id: dueId,
      p_method: method,
      p_notes: notes ?? 'Kat maliki ödemesi'
    })
    if (rpcError) {
      toast.add({ title: 'Ödeme yapılamadı', description: getErrorMessage(rpcError), color: 'error' })
      return false
    }
    toast.add({ title: 'Ödeme alındı', description: 'Aidat ödenmiş olarak işaretlendi.', color: 'success', icon: 'i-lucide-check' })
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
    fetchMine,
    create,
    payDue,
    remove
  }
}
