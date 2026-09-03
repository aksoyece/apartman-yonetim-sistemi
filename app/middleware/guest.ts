export default defineNuxtRouteMiddleware(async () => {
  const { resolveSession, ensureSession, homePathForRole, profile } = useAuth()

  const { userId } = await resolveSession(2000)
  if (!userId && !profile.value) return

  const nextProfile = await ensureSession()
  if (nextProfile || profile.value) {
    return navigateTo(homePathForRole((nextProfile || profile.value)?.role), { replace: true })
  }
})
