import type { Survey, SurveyStatus } from '~/types/database'

function withResults(survey: Survey, userId?: string | null): Survey {
  const votes = survey.votes || []
  const options = (survey.options || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(option => ({
      ...option,
      vote_count: votes.filter(v => v.option_id === option.id).length
    }))

  return {
    ...survey,
    options,
    total_votes: votes.length,
    my_vote_option_id: userId
      ? (votes.find(v => v.user_id === userId)?.option_id ?? null)
      : null
  }
}

export function useSurveys() {
  const supabase = useDb()
  const toast = useToast()
  const { resolveSession } = useAuth()
  const items = useState<Survey[]>('surveys-items', () => [])
  const pending = useState('surveys-pending', () => true)
  const error = useState<string | null>('surveys-error', () => null)

  async function fetchAll(includeDraft = true) {
    const hadItems = items.value.length > 0
    if (!hadItems) pending.value = true
    error.value = null
    try {
      const { userId } = await resolveSession()
      let query = supabase
        .from('surveys')
        .select('*, options:survey_options(*), votes:survey_votes(*)')
        .order('created_at', { ascending: false })

      if (!includeDraft) {
        query = query.in('status', ['open', 'closed'])
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      items.value = ((data ?? []) as Survey[]).map(s => withResults(s, userId))
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  async function create(payload: {
    title: string
    description?: string | null
    status?: SurveyStatus
    ends_at?: string | null
    options: string[]
  }) {
    const { userId } = await resolveSession()
    const labels = payload.options.map(o => o.trim()).filter(Boolean)
    if (labels.length < 2) {
      toast.add({ title: 'En az 2 seçenek gerekli', color: 'error' })
      return false
    }

    const { data: survey, error: insertError } = await supabase
      .from('surveys')
      .insert({
        title: payload.title,
        description: payload.description || null,
        status: payload.status ?? 'draft',
        ends_at: payload.ends_at || null,
        created_by: userId
      })
      .select('*')
      .single()

    if (insertError || !survey) {
      toast.add({ title: 'Anket oluşturulamadı', description: getErrorMessage(insertError), color: 'error' })
      return false
    }

    const optionRows = labels.map((label, index) => ({
      survey_id: survey.id,
      label,
      sort_order: index
    }))

    const { error: optionsError } = await supabase.from('survey_options').insert(optionRows)
    if (optionsError) {
      await supabase.from('surveys').delete().eq('id', survey.id)
      toast.add({ title: 'Seçenekler eklenemedi', description: getErrorMessage(optionsError), color: 'error' })
      return false
    }

    toast.add({ title: 'Anket oluşturuldu', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(true)
    return true
  }

  async function updateStatus(id: string, status: SurveyStatus) {
    const { error: updateError } = await supabase
      .from('surveys')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      toast.add({ title: 'Durum güncellenemedi', description: getErrorMessage(updateError), color: 'error' })
      return false
    }
    toast.add({ title: 'Anket durumu güncellendi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(true)
    return true
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from('surveys').delete().eq('id', id)
    if (deleteError) {
      toast.add({ title: 'Silinemedi', description: getErrorMessage(deleteError), color: 'error' })
      return false
    }
    toast.add({ title: 'Anket silindi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(true)
    return true
  }

  async function vote(surveyId: string, optionId: string) {
    await resolveSession()
    const { error: rpcError } = await supabase.rpc('resident_cast_vote', {
      p_survey_id: surveyId,
      p_option_id: optionId
    })
    if (rpcError) {
      toast.add({ title: 'Oy kullanılamadı', description: getErrorMessage(rpcError), color: 'error' })
      return false
    }
    toast.add({ title: 'Oyunuz kaydedildi', color: 'success', icon: 'i-lucide-check' })
    await fetchAll(false)
    return true
  }

  return {
    items,
    pending,
    error,
    fetchAll,
    create,
    updateStatus,
    remove,
    vote
  }
}
