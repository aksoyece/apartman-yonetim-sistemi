export default defineNuxtRouteMiddleware(async () => {
  const { waitForUser, ensureSession, homePathForRole, profile } = useAuth()

  const currentUser = await waitForUser(1500)
  if (!currentUser) return

  const nextProfile = await ensureSession()
  if (nextProfile || profile.value) {
    return navigateTo(homePathForRole((nextProfile || profile.value)?.role), { replace: true })
  }
})
