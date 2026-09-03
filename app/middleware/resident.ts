export default defineNuxtRouteMiddleware(async () => {
  const { ensureSession, homePathForRole, waitForUser, profile } = useAuth()

  const currentUser = await waitForUser(2500)
  if (!currentUser) {
    return navigateTo('/login')
  }

  const nextProfile = await ensureSession()
  if (!nextProfile) {
    return navigateTo('/resident')
  }

  if (nextProfile.role !== 'resident') {
    return navigateTo(homePathForRole(nextProfile.role))
  }

  if (!profile.value) {
    profile.value = nextProfile
  }
})
