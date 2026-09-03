import type { Ref } from 'vue'

export function useExport() {
  function downloadBlob(content: BlobPart, filename: string, mime: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function toCsv(rows: Record<string, unknown>[], columns: { key: string, label: string }[]) {
    const escape = (value: unknown) => {
      const text = value == null ? '' : String(value)
      if (/[",\n;]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`
      }
      return text
    }

    const header = columns.map(c => escape(c.label)).join(';')
    const body = rows.map(row => columns.map(c => escape(row[c.key])).join(';')).join('\n')
    return `\uFEFF${header}\n${body}`
  }

  function exportCsv(rows: Record<string, unknown>[], columns: { key: string, label: string }[], filename: string) {
    const csv = toCsv(rows, columns)
    downloadBlob(csv, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;')
  }

  async function exportPdf(
    title: string,
    columns: { header: string, dataKey: string }[],
    rows: Record<string, unknown>[],
    filename: string
  ) {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.text(pdfSafeText(title), 14, 16)
    doc.setFontSize(10)
    doc.text(pdfSafeText(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`), 14, 23)

    autoTable(doc, {
      startY: 28,
      head: [columns.map(c => pdfSafeText(c.header))],
      body: rows.map(row => columns.map(c => pdfSafeText(row[c.dataKey]))),
      styles: { font: 'helvetica', fontSize: 8 }
    })

    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  }

  return {
    exportCsv,
    exportPdf,
    downloadBlob
  }
}

export function useRealtimeChannel(
  channelName: string,
  table: string,
  onChange: () => void | Promise<void>,
  enabled: Ref<boolean> | boolean = true
) {
  const supabase = useSupabaseClient()
  let channel: ReturnType<typeof supabase.channel> | null = null

  function subscribe() {
    if (channel) return
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        async () => {
          await onChange()
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  onMounted(() => {
    if (toValue(enabled)) subscribe()
  })

  onBeforeUnmount(unsubscribe)

  watch(() => toValue(enabled), (value) => {
    if (value) subscribe()
    else unsubscribe()
  })

  return { subscribe, unsubscribe }
}
