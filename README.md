# YönetiX — Apartman Yönetim Sistemi

Nuxt 4, Vue 3, TypeScript, Nuxt UI ve Supabase ile geliştirilmiş modern apartman yönetim uygulaması.

**Marka:** YönetiX  
**Canlı demo:** https://yonetix-app.vercel.app

## Özellikler

### Yönetici
- Dashboard: daire, toplanan/bekleyen aidat, gider, net bakiye, açık arıza
- Aylık gelir-gider grafiği ve son ödemeler
- Daire, kat maliki, aidat, ödeme, gider, duyuru ve arıza yönetimi
- Anket oluşturma, sonuçları izleme, açma/kapama
- Arıza durumu güncelleme
- Raporlama (tarih / kategori filtresi) + PDF / CSV export

### Kat Maliki
- Özet panel: borç, ödenen aidat, arızalar, açık anketler, duyurular
- Daire bilgileri
- Aidat / borç durumu ve **demo ödeme** (Öde)
- Ödeme geçmişi
- Duyurular ve anket / oylama
- Arıza bildirimi (isteğe bağlı ek dosya)

### Teknik
- Supabase Auth + PostgreSQL + Row Level Security (RLS)
- In-app bildirimler (duyuru, arıza, anket açılışı) + realtime
- Zod form validasyonları
- Loading / error / empty state bileşenleri
- Sayfalar arası veri önbelleği (hızlı menü geçişleri)
- Responsive Nuxt UI + dark mode
- Dosya ekleri (`attachments` storage bucket)

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Framework | Nuxt 4, Vue 3, TypeScript |
| UI | Nuxt UI 4, Tailwind CSS 4 |
| Auth & DB | Supabase Auth, PostgreSQL, RLS |
| Form | Zod + Nuxt UI Form |
| Grafik | Chart.js + vue-chartjs |
| Deploy | Vercel |

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni proje oluşturun.
2. SQL Editor’de sırayla çalıştırın:
   - `supabase/schema.sql` — ana tablolar + RLS
   - `supabase/bonus.sql` — bildirimler, storage, ödeme RPC, tetikleyiciler
   - `supabase/surveys.sql` — anket / oy tabloları + tetikleyiciler
   - (gerekirse) `supabase/storage-fix.sql` — storage politikaları
3. (Opsiyonel) Örnek veri: `supabase/seed.sql`
4. Project Settings → API → URL ve anon key alın.
5. Auth → URL Configuration:
   - Site URL: uygulamanızın adresi (ör. Vercel URL)
   - Redirect URLs: aynı origin’i ekleyin

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

1. `/register` → **Yönetici** hesabı oluşturun.
2. Aynı şekilde **Kat Maliki** hesapları oluşturun.
3. Yönetici → Daireler: daire ekleyip kat maliklerini atayın.
4. Aidat, ödeme, gider, duyuru ve anket kayıtlarını oluşturun.

## Database Yapısı

```
profiles              → kullanıcı profili (admin | resident)
apartments            → daireler (owner_id → profiles)
dues                  → aidatlar (apartment_id → apartments)
payments              → ödemeler (apartment_id, due_id)
expenses              → ortak giderler
announcements         → duyurular
maintenance_requests  → arıza bildirimleri
notifications         → in-app bildirimler
surveys               → anketler
survey_options        → anket seçenekleri
survey_votes           → oylar (anket başına bir oy / kullanıcı)
```

### RLS özeti
- **Yönetici:** tüm tablolarda tam yetki
- **Kat maliki:** kendi dairesi, aidatları, ödemeleri; aktif duyurular; yayınlanmış anketler ve oy kullanma; kendi arıza bildirimlerini okuma/oluşturma; kendi bildirimleri

### Önemli RPC’ler
- `resident_pay_due` — kat maliki demo aidat ödemesi
- `resident_cast_vote` — güvenli oy kullanma
- `notify_residents` — duyuru / anket açılışında toplu bildirim

## Proje Yapısı

```
app/
  assets/css/     # tema, panel, koyu mod token’ları
  components/     # StatCard, NotificationBell, EmptyState...
  composables/    # useAuth, useSurveys, useNotifications...
  layouts/        # auth, admin, resident
  middleware/     # auth, admin, resident, guest
  pages/
    admin/        # yönetici paneli
    resident/     # kat maliki portalı
  types/          # TypeScript modelleri
  utils/          # format yardımcıları
supabase/
  schema.sql      # ana tablolar + RLS
  bonus.sql       # bildirimler, storage, ödeme
  surveys.sql     # anket modülü
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

## Deploy (Vercel)

1. Repo’yu Vercel’e bağlayın.
2. Environment Variables olarak `NUXT_PUBLIC_SUPABASE_URL` ve `NUXT_PUBLIC_SUPABASE_KEY` ekleyin.
3. Supabase Auth Site URL / Redirect URL’lerini Vercel domain’ine ayarlayın.

## Bağlantılar

- Canlı: https://yonetix-app.vercel.app
- GitHub: https://github.com/aksoyece/apartman-yonetim-sistemi
- Supabase: https://supabase.com/dashboard/project/npotuvizibiedamqagil

## İleri adımlar (opsiyonel)

- Gerçek ödeme altyapısı (şu an demo “Öde”)
- E-posta / push bildirimleri
- Şifre sıfırlama akışı
- Çoklu apartman / site desteği

## Lisans

MIT
