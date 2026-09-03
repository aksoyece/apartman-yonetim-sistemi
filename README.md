# Apartman Yönetim Sistemi

Nuxt 4, Vue 3, TypeScript, Nuxt UI ve Supabase ile geliştirilmiş modern apartman yönetim uygulaması.

## Özellikler

### Yönetici
- Dashboard: toplam daire, toplanan/bekleyen aidat, toplam gider, net bakiye, açık arıza
- Aylık gelir-gider grafiği ve son ödemeler
- Daire, kat maliki, aidat, ödeme, gider, duyuru ve arıza yönetimi
- Arıza bildirim durumunu güncelleme

### Kat Maliki
- Kendi daire bilgilerini görüntüleme
- Aidat / borç durumu ve ödeme geçmişi
- Duyuruları görüntüleme
- Arıza bildirimi oluşturma

### Teknik
- Supabase Auth + PostgreSQL
- Row Level Security (RLS) ile yetkilendirme
- Zod form validasyonları
- Loading / error / empty state bileşenleri
- Responsive Nuxt UI arayüzü
- Dark mode (Nuxt Color Mode)

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Framework | Nuxt 4, Vue 3, TypeScript |
| UI | Nuxt UI 4, Tailwind CSS 4 |
| Auth & DB | Supabase Auth, PostgreSQL, RLS |
| Form | Zod + Nuxt UI Form |
| Grafik | Chart.js + vue-chartjs |

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni proje oluşturun.
2. SQL Editor'de `supabase/schema.sql` dosyasını çalıştırın.
3. (Opsiyonel) Örnek veri için `supabase/seed.sql` dosyasını çalıştırın.
4. Project Settings → API bölümünden URL ve anon key değerlerini alın.

### 3. Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

```env
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key
```

### 4. Çalıştırma

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

### 5. İlk kullanıcılar

1. `/register` sayfasından **Yönetici** hesabı oluşturun.
2. Aynı şekilde **Kat Maliki** hesapları oluşturun.
3. Yönetici paneli → Daireler üzerinden daireleri ekleyip kat maliklerini atayın.
4. Aidat, ödeme, gider ve duyuru kayıtlarını oluşturun.

## Database Yapısı

```
profiles              → kullanıcı profili (admin | resident)
apartments            → daireler (owner_id → profiles)
dues                  → aidatlar (apartment_id → apartments)
payments              → ödemeler (apartment_id, due_id)
expenses              → ortak giderler
announcements         → duyurular
maintenance_requests  → arıza bildirimleri
```

### RLS özeti
- **Yönetici**: tüm tablolarda tam yetki
- **Kat maliki**: kendi dairesi, aidatları, ödemeleri; aktif duyurular; kendi arıza bildirimlerini okuma/oluşturma

## Proje Yapısı

```
app/
  components/     # StatCard, EmptyState, IncomeExpenseChart...
  composables/    # useAuth, useDashboard, useApartments...
  layouts/        # auth, admin, resident
  middleware/     # auth, admin, resident, guest
  pages/
    admin/        # yönetici paneli
    resident/     # kat maliki portalı
  types/          # TypeScript modelleri
  utils/          # format yardımcıları
supabase/
  schema.sql      # tablolar + RLS
  seed.sql        # örnek veri (opsiyonel)
```

## Scripts

```bash
npm run dev        # geliştirme sunucusu
npm run build      # production build
npm run preview    # build önizleme
npm run typecheck  # TypeScript kontrolü
npm run lint       # ESLint
```

## Bonus özellikler

- **Dark mode** — üst bardaki renk modu düğmesi
- **Bildirimler** — duyuru ve arıza olaylarında in-app bildirim + toast
- **Dosya yükleme** — arıza ve gider ekleri (`attachments` storage bucket)
- **PDF / CSV export** — aidat, ödeme, gider ve rapor sayfalarında
- **Realtime** — arıza, ödeme ve bildirim güncellemeleri canlı yenilenir
- **Gelişmiş raporlama** — `/admin/reports` tarih/kategori filtreleri

## Supabase proje

- Dashboard: https://supabase.com/dashboard/project/npotuvizibiedamqagil
- SQL dosyaları: `supabase/schema.sql` + `supabase/bonus.sql`

## GitHub

- Repo: https://github.com/aksoyece/apartman-yonetim-sistemi

## Bonus fikirler (ileri adımlar)

- E-posta bildirimleri
- Daha gelişmiş grafik setleri
- Çoklu apartman / site desteği

## Lisans

MIT
