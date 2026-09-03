export default defineNuxtRouteMiddleware(async () => {
  const { waitForUser, ensureSession } = useAuth()

  const currentUser = await waitForUser(2500)
  if (!currentUser) {
    return navigateTo('/login')
  }

  await ensureSession()
})
