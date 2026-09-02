export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) return

  const { profile, fetchProfile, homePathForRole } = useAuth()
  if (!profile.value) {
    await fetchProfile()
  }

  if (profile.value) {
    return navigateTo(homePathForRole(profile.value.role))
  }
})
