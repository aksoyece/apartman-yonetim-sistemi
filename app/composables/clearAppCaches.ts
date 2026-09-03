/** Çıkış / kullanıcı değişiminde paylaşılan önbellekleri temizle */
export function clearAppCaches() {
  useState('auth-profile', () => null).value = null
  useState('auth-loading', () => false).value = false

  useState('apartments-items', () => []).value = []
  useState('apartments-pending', () => false).value = false
  useState<string | null>('apartments-error', () => null).value = null
  useState('apartments-mine-ready', () => false).value = false

  useState('maintenance-items', () => []).value = []
  useState('maintenance-pending', () => false).value = false
  useState<string | null>('maintenance-error', () => null).value = null

  useState('announcements-items', () => []).value = []
  useState('announcements-pending', () => false).value = false
  useState<string | null>('announcements-error', () => null).value = null
  useState<boolean | null>('announcements-include-inactive', () => null).value = null
}
