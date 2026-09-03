export function useAttachmentUpload() {
  const supabase = useSupabaseClient()
  const { resolveSession, ensureSession } = useAuth()
  const toast = useToast()
  const uploading = ref(false)

  async function resolveUserId(): Promise<string | null> {
    await ensureSession()
    const { session, userId } = await resolveSession()
    if (session?.user?.id) return session.user.id
    if (userId) return userId

    try {
      const { data } = await supabase.auth.refreshSession()
      if (data.session?.user?.id) return data.session.user.id
    } catch {
      // ignore
    }

    return null
  }

  async function upload(file: File, folder = 'general') {
    const id = await resolveUserId()
    if (!id) {
      toast.add({
        title: 'Oturum gerekli',
        description: 'Dosya yüklemek için tekrar giriş yapın.',
        color: 'error'
      })
      return null
    }

    const ext = file.name.split('.').pop() || 'bin'
    const path = `${id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    uploading.value = true
    try {
      const { error } = await supabase.storage.from('attachments').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
      })
      if (error) throw error
      return path
    } catch (err) {
      toast.add({
        title: 'Dosya yüklenemedi',
        description: getErrorMessage(err),
        color: 'error'
      })
      return null
    } finally {
      uploading.value = false
    }
  }

  async function getSignedUrl(path: string | null | undefined, expiresIn = 3600) {
    if (!path) return null
    const { data, error } = await supabase.storage.from('attachments').createSignedUrl(path, expiresIn)
    if (error) return null
    return data.signedUrl
  }

  async function remove(path: string | null | undefined) {
    if (!path) return
    await supabase.storage.from('attachments').remove([path])
  }

  return {
    uploading,
    upload,
    getSignedUrl,
    remove
  }
}
