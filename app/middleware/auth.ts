export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/login')
  }

  const { profile, fetchProfile } = useAuth()
  if (!profile.value) {
    await fetchProfile()
  }
})
