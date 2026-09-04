export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { ensureSession, homePathForRole, profile } = useAuth()

  // Zaten oturum yoksa bekleme — sayfaya anında geç
  if (!user.value?.id && !profile.value?.id) return

  const nextProfile = await ensureSession()
  if (nextProfile || profile.value) {
    return navigateTo(homePathForRole((nextProfile || profile.value)?.role), { replace: true })
  }
})
