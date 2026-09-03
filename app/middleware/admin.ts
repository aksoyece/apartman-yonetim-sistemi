export default defineNuxtRouteMiddleware(async () => {
  const { ensureSession, homePathForRole, waitForUser, profile } = useAuth()

  const currentUser = await waitForUser(2500)
  if (!currentUser) {
    return navigateTo('/login')
  }

  const nextProfile = await ensureSession()
  if (!nextProfile) {
    // Oturum var ama profil yok — login'e atmak yerine admin ana sayfada tutma/retry
    return navigateTo('/admin')
  }

  if (nextProfile.role !== 'admin') {
    return navigateTo(homePathForRole(nextProfile.role))
  }

  // profile state senkron kalsın
  if (!profile.value) {
    profile.value = nextProfile
  }
})
