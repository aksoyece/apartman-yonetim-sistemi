export default defineNuxtRouteMiddleware(async () => {
  const { resolveSession, ensureSession, profile } = useAuth()

  const { userId } = await resolveSession()
  if (!userId && !profile.value) {
    return navigateTo('/login')
  }

  await ensureSession()
})
