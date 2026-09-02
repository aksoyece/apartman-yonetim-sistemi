export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/login')
  }

  const { profile, fetchProfile, homePathForRole } = useAuth()
  if (!profile.value) {
    await fetchProfile()
  }

  if (profile.value?.role !== 'admin') {
    return navigateTo(homePathForRole(profile.value?.role))
  }
})
