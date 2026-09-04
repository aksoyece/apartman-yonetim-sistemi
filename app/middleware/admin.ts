export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { ensureSession, homePathForRole, profile } = useAuth()

  if (!user.value?.id && !profile.value?.id) {
    return navigateTo('/login')
  }

  const nextProfile = await ensureSession()
  if (!nextProfile) {
    return navigateTo('/login')
  }

  if (nextProfile.role !== 'admin') {
    return navigateTo(homePathForRole(nextProfile.role))
  }
})
