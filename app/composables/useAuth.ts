import type { Profile, UserRole } from '~/types/database'
import { getErrorMessage } from '~/utils/format'

export function useAuth() {
  const supabase = useDb()
  const authClient = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => false)
  const toast = useToast()

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isResident = computed(() => profile.value?.role === 'resident')

  async function waitForUser(timeoutMs = 4000): Promise<any> {
    if (user.value) return user.value

    const started = Date.now()
    return await new Promise((resolve) => {
      const stop = watch(user, (value) => {
        if (value) {
          stop()
          resolve(value)
        } else if (Date.now() - started > timeoutMs) {
          stop()
          resolve(null)
        }
      }, { immediate: true })

      setTimeout(() => {
        stop()
        resolve(user.value ?? null)
      }, timeoutMs)
    })
  }

  async function fetchProfile(userId?: string) {
    const id = userId || user.value?.id
    if (!id) {
      return profile.value
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        const meta = user.value?.user_metadata || {}
        const { data: created, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id,
            full_name: meta.full_name || user.value?.email?.split('@')[0] || 'Kullanıcı',
            email: user.value?.email || null,
            phone: meta.phone || null,
            role: (meta.role as UserRole) || 'resident'
          })
          .select('*')
          .single()

        if (upsertError) throw upsertError
        profile.value = created as Profile
        return profile.value
      }

      profile.value = data as Profile
      return profile.value
    } catch (error) {
      console.error(error)
      // Mevcut profili silme — geçici hata login'e atmasın
      return profile.value
    } finally {
      loading.value = false
    }
  }

  async function ensureSession() {
    let current = user.value
    if (!current) {
      current = await waitForUser(2000)
    }
    if (!current) return null

    if (!profile.value || profile.value.id !== current.id) {
      await fetchProfile(current.id)
    }
    return profile.value
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await authClient.auth.signInWithPassword({ email, password })
      if (error) throw error

      await waitForUser()
      const nextProfile = await fetchProfile(data.user?.id)
      toast.add({ title: 'Giriş başarılı', color: 'success', icon: 'i-lucide-check-circle' })
      return nextProfile
    } catch (error) {
      toast.add({
        title: 'Giriş başarısız',
        description: getErrorMessage(error, 'E-posta veya şifre hatalı.'),
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return null
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
      const { data, error } = await authClient.auth.signUp({
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

      if (data.session && data.user) {
        await waitForUser()
        await fetchProfile(data.user.id)
        toast.add({
          title: 'Kayıt ve giriş başarılı',
          color: 'success',
          icon: 'i-lucide-check-circle'
        })
        return { signedIn: true, profile: profile.value }
      }

      toast.add({
        title: 'Kayıt oluşturuldu',
        description: 'Giriş yaparak devam edebilirsiniz.',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
      return { signedIn: false, profile: null }
    } catch (error) {
      toast.add({
        title: 'Kayıt başarısız',
        description: getErrorMessage(error),
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return null
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await authClient.auth.signOut()
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
    ensureSession,
    signIn,
    signUp,
    signOut,
    homePathForRole,
    waitForUser
  }
}
