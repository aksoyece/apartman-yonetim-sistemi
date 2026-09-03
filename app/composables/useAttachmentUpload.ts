export function useAttachmentUpload() {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const toast = useToast()
  const uploading = ref(false)

  async function upload(file: File, folder = 'general') {
    if (!user.value) {
      toast.add({ title: 'Oturum gerekli', color: 'error' })
      return null
    }

    const ext = file.name.split('.').pop() || 'bin'
    const path = `${user.value.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    uploading.value = true
    try {
      const { error } = await supabase.storage.from('attachments').upload(path, file, {
        cacheControl: '3600',
        upsert: false
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
