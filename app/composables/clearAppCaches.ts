/** Çıkış / kullanıcı değişiminde paylaşılan önbellekleri temizle */
export function clearAppCaches() {
  useState('auth-profile', () => null).value = null
  useState('auth-loading', () => false).value = false

  useState('apartments-items', () => []).value = []
  useState('apartments-pending', () => false).value = false
  useState<string | null>('apartments-error', () => null).value = null
  useState('apartments-mine-ready', () => false).value = false

  useState('dues-items', () => []).value = []
  useState('dues-pending', () => false).value = false
  useState<string | null>('dues-error', () => null).value = null

  useState('payments-items', () => []).value = []
  useState('payments-pending', () => false).value = false
  useState<string | null>('payments-error', () => null).value = null

  useState('maintenance-items', () => []).value = []
  useState('maintenance-pending', () => false).value = false
  useState<string | null>('maintenance-error', () => null).value = null

  useState('announcements-items', () => []).value = []
  useState('announcements-pending', () => false).value = false
  useState<string | null>('announcements-error', () => null).value = null
  useState<boolean | null>('announcements-include-inactive', () => null).value = null

  useState('surveys-items', () => []).value = []
  useState('surveys-pending', () => false).value = false
  useState<string | null>('surveys-error', () => null).value = null

  useState('notifications-items', () => []).value = []
  useState('notifications-pending', () => false).value = false
  useState<string | null>('notifications-error', () => null).value = null
}
