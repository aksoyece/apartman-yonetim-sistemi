import type { DueStatus, MaintenanceStatus, PaymentMethod, PriorityLevel, SurveyStatus, UserRole } from '~/types/database'

export function formatCurrency(value: number | null | undefined, currency = 'TRY') {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)
}

/** jsPDF Helvetica ₺/Unicode bozar — export için ASCII güvenli tutar */
export function formatCurrencyPdf(value: number | null | undefined) {
  const amount = Number(value ?? 0)
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
  return `${formatted} TL`
}

/** jsPDF varsayılan fontunda sorun çıkaran karakterleri sadeleştir */
export function pdfSafeText(value: unknown) {
  return String(value ?? '')
    .replace(/₺/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .trim()
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function apartmentLabel(apartment?: { block?: string | null, number?: string } | null) {
  if (!apartment?.number) return '—'
  return apartment.block ? `${apartment.block}-${apartment.number}` : `Daire ${apartment.number}`
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Yönetici',
  resident: 'Kat Maliki'
}

export const dueStatusLabels: Record<DueStatus, string> = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  overdue: 'Gecikmiş',
  partial: 'Kısmi'
}

export const dueStatusColors: Record<DueStatus, 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'warning',
  paid: 'success',
  overdue: 'error',
  partial: 'info'
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Nakit',
  transfer: 'Havale/EFT',
  credit_card: 'Kredi Kartı',
  other: 'Diğer'
}

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  open: 'Açık',
  in_progress: 'İşlemde',
  resolved: 'Çözüldü',
  closed: 'Kapalı'
}

export const maintenanceStatusColors: Record<MaintenanceStatus, 'error' | 'warning' | 'success' | 'neutral'> = {
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'neutral'
}

export const priorityLabels: Record<PriorityLevel, string> = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek'
}

export const priorityColors: Record<PriorityLevel, 'neutral' | 'info' | 'error'> = {
  low: 'neutral',
  normal: 'info',
  high: 'error'
}

export const surveyStatusLabels: Record<SurveyStatus, string> = {
  draft: 'Taslak',
  open: 'Açık',
  closed: 'Kapalı'
}

export const surveyStatusColors: Record<SurveyStatus, 'neutral' | 'success' | 'warning'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning'
}

export const expenseCategories = [
  'genel',
  'temizlik',
  'güvenlik',
  'elektrik',
  'su',
  'doğalgaz',
  'bakım',
  'asansör',
  'sigorta',
  'diğer'
] as const

export function currentPeriod(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getErrorMessage(error: unknown, fallback = 'Beklenmeyen bir hata oluştu.') {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message) || fallback
  }
  return fallback
}
