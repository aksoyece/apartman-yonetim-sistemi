export default defineNuxtRouteMiddleware(async () => {
  const { ensureSession, homePathForRole, resolveSession, profile } = useAuth()

  const { userId } = await resolveSession()
  if (!userId && !profile.value) {
    return navigateTo('/login')
  }

  const nextProfile = await ensureSession()
  if (!nextProfile) return

  if (nextProfile.role !== 'admin') {
    return navigateTo(homePathForRole(nextProfile.role))
  }
})
