import type { Expense } from '~/types/database'

export function useExpenses() {
  const supabase = useDb()
  const toast = useToast()
  const { user } = useAuth()
  const items = ref<Expense[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Expense[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function create(payload: {
    title: string
    amount: number
    category: string
    expense_date: string
    description?: string | null
    attachment_path?: string | null
  }) {
    const { resolveSession } = useAuth()
    const { userId } = await resolveSession()
    const { error: insertError } = await supabase.from('expenses').insert({
      ...payload,
      created_by: userId || user.value?.id || null,
      attachment_path: payload.attachment_path ?? null
    })
    if (insertError) {
      toast.add({ title: 'Gider eklenemedi', description: getErrorMessage(insertError), color: 'error' })
      return false
    }
    toast.add({ title: 'Gider eklendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function update(id: string, payload: Partial<Expense>) {
    const { error: updateError } = await supabase.from('expenses').update(payload).eq('id', id)
    if (updateError) {
      toast.add({ title: 'Güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Gider güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id)
    if (deleteError) {
      toast.add({ title: 'Silinemedi', description: getErrorMessage(deleteError), color: 'error' })
      return false
    }
    toast.add({ title: 'Gider silindi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
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
