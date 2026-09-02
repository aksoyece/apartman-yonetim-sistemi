import type { Profile } from '~/types/database'

export function useResidents() {
  const supabase = useDb()
  const toast = useToast()
  const items = ref<Profile[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    pending.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'resident')
        .order('full_name')

      if (fetchError) throw fetchError
      items.value = (data ?? []) as Profile[]
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function updateProfile(id: string, payload: Partial<Profile>) {
    const { error: updateError } = await supabase.from('profiles').update(payload).eq('id', id)
    if (updateError) {
      toast.add({ title: 'Güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Kat maliki güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll()
    return true
  }

  return {
    items,
    pending,
    error,
    fetchAll,
    updateProfile
  }
}
