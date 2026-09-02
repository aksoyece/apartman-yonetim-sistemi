import type { Profile, UserRole } from '~/types/database'
import { getErrorMessage } from '~/utils/format'

export function useAuth() {
  const supabase = useDb()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => false)
  const toast = useToast()

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isResident = computed(() => profile.value?.role === 'resident')

  async function fetchProfile() {
    if (!user.value) {
      profile.value = null
      return null
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) throw error
      profile.value = data as Profile
      return profile.value
    } catch (error) {
      console.error(error)
      profile.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      await fetchProfile()
      toast.add({ title: 'Giriş başarılı', color: 'success', icon: 'i-lucide-check-circle' })
      return true
    } catch (error) {
      toast.add({
        title: 'Giriş başarısız',
        description: getErrorMessage(error, 'E-posta veya şifre hatalı.'),
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function signUp(payload: {
    email: string
    password: string
    full_name: string
    phone?: string
    role?: UserRole
  }) {
    loading.value = true
    try {
      const { error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.full_name,
            phone: payload.phone ?? null,
            role: payload.role ?? 'resident'
          }
        }
      })
      if (error) throw error
      toast.add({
        title: 'Kayıt oluşturuldu',
        description: 'Giriş yaparak devam edebilirsiniz.',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
      return true
    } catch (error) {
      toast.add({
        title: 'Kayıt başarısız',
        description: getErrorMessage(error),
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    profile.value = null
    await navigateTo('/login')
  }

  function homePathForRole(role?: UserRole | null) {
    if (role === 'admin') return '/admin'
    if (role === 'resident') return '/resident'
    return '/login'
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isResident,
    fetchProfile,
    signIn,
    signUp,
    signOut,
    homePathForRole
  }
}
