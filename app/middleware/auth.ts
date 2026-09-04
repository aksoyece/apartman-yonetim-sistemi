export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { ensureSession, profile } = useAuth()

  if (!user.value?.id && !profile.value?.id) {
    return navigateTo('/login')
  }

  const nextProfile = await ensureSession()
  if (!nextProfile) {
    return navigateTo('/login')
  }
})
