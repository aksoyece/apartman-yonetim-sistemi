import type { Profile, UserRole } from '~/types/database'
import { getErrorMessage } from '~/utils/format'

export function useAuth() {
  const supabase = useDb()
  const authClient = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => false)
  const toast = useToast()

  const isAuthenticated = computed(() => !!user.value || !!profile.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isResident = computed(() => profile.value?.role === 'resident')

  function profileFromUser(current: any): Profile {
    const meta = current.user_metadata || {}
    return {
      id: current.id,
      full_name: meta.full_name || current.email?.split('@')[0] || 'Kullanıcı',
      email: current.email || null,
      phone: meta.phone || null,
      role: (meta.role as UserRole) || 'resident',
      created_at: current.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Profile
  }

  /** JWT oturumunu zorla getir — yavaş ağ / hydration için */
  async function resolveSession(maxWaitMs = 10000) {
    const deadline = Date.now() + maxWaitMs

    while (Date.now() < deadline) {
      if (user.value?.id) {
        const { data } = await authClient.auth.getSession()
        if (data.session) {
          return { session: data.session, userId: data.session.user.id }
        }
        return { session: null, userId: user.value.id }
      }

      try {
        const { data } = await authClient.auth.getSession()
        if (data.session?.user?.id) {
          return { session: data.session, userId: data.session.user.id }
        }
      } catch {
        // devam
      }

      try {
        const { data } = await authClient.auth.refreshSession()
        if (data.session?.user?.id) {
          return { session: data.session, userId: data.session.user.id }
        }
      } catch {
        // devam
      }

      if (profile.value?.id) {
        // Profil var — JWT gelene kadar kısa bekle
        await new Promise(r => setTimeout(r, 250))
        try {
          const { data } = await authClient.auth.getSession()
          if (data.session?.user?.id) {
            return { session: data.session, userId: data.session.user.id }
          }
        } catch {
          // profil id ile devam (RPC için JWT şart olabilir)
        }
        return { session: null, userId: profile.value.id }
      }

      await new Promise(r => setTimeout(r, 300))
    }

    const fallbackId = user.value?.id || profile.value?.id || null
    if (!fallbackId) return { session: null, userId: null }

    try {
      const { data } = await authClient.auth.getSession()
      return { session: data.session, userId: data.session?.user?.id || fallbackId }
    } catch {
      return { session: null, userId: fallbackId }
    }
  }

  async function waitForUser(timeoutMs = 8000): Promise<any> {
    const { session, userId } = await resolveSession(timeoutMs)
    if (session?.user) return session.user
    if (user.value) return user.value
    const currentProfile = profile.value
    if (userId && currentProfile && currentProfile.id === userId) {
      return {
        id: userId,
        email: currentProfile.email,
        user_metadata: {
          full_name: currentProfile.full_name,
          role: currentProfile.role,
          phone: currentProfile.phone
        }
      }
    }
    if (userId) return { id: userId }
    return null
  }

  async function fetchProfile(userId?: string) {
    const id = userId || user.value?.id || profile.value?.id
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
        const existing = profile.value
        const { data: created, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id,
            full_name: meta.full_name || existing?.full_name || user.value?.email?.split('@')[0] || 'Kullanıcı',
            email: user.value?.email || existing?.email || null,
            phone: meta.phone || existing?.phone || null,
            role: (meta.role as UserRole) || existing?.role || 'resident'
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
      if (!profile.value && user.value) {
        profile.value = profileFromUser(user.value)
      }
      return profile.value
    } finally {
      loading.value = false
    }
  }

  async function ensureSession() {
    const { userId } = await resolveSession()
    if (!userId) return profile.value

    if (!profile.value || profile.value.id !== userId) {
      await fetchProfile(userId)
    }

    if (!profile.value) {
      profile.value = {
        id: userId,
        full_name: 'Kullanıcı',
        email: null,
        phone: null,
        role: 'resident',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
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
    clearAppCaches()
    await authClient.auth.signOut()
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
    resolveSession,
    signIn,
    signUp,
    signOut,
    homePathForRole,
    waitForUser
  }
}
