export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { ensureSession, homePathForRole, profile } = useAuth()

  // Hızlı yol: user/profil yoksa hemen login'e
  if (!user.value?.id && !profile.value?.id) {
    return navigateTo('/login')
  }

  const nextProfile = await ensureSession()
  if (!nextProfile) {
    return navigateTo('/login')
  }

  if (nextProfile.role !== 'resident') {
    return navigateTo(homePathForRole(nextProfile.role))
  }
})
