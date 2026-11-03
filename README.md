# Bağımsız Zikirmatik — Vaktuna kaynak kodundan doğrudan ayrıldı

Bu repo Vaktuna'daki **asıl** Zikirmatik'in `src/routes/zikir.*`, `src/hooks/useDhikr.tsx`, `src/lib/dhikr.ts`, `src/components/DhikrProgressRing.tsx`, `src/styles.css`, `src/hooks/useI18n.tsx` ve 13 dil paketini **doğrudan kaynak kod olarak** taşır. Yalnızca bağımsız React/Vite kabuğu ve sayfa yönlendirmeleri eklendi. Vaktuna kaynak deposunda herhangi bir değişiklik yapılmadı.

## Kurulum

`npm install && npm run dev` (geliştirme) veya `npm run build` (üretim). Henüz yayınlanmış bir App Store uygulaması değildir.

## Bilinen farklılıklar

Vaktuna içindeki sayacın özgün tasarımı, 9 hazır zikri, kendi zikrini ekleme, 33/34/100 ve özel hedefler, ilerleme halkası, günlüklük ve 30 günlük yerel kayıtları ve 13 dil içeriği korunmuştur. Bağımsız uygulama, Vaktuna'nın diğer modüllerini (namaz vakitleri, kıble vb.) içermez. PRO satın alma/RevenueCat ve reklam entegrasyonları bağımsız uygulamaya taşınmamıştır; geçmiş sayfasındaki PRO ekranı bu yüzden çalışır satın alma sunmaz. iOS titreşimi yalnızca Capacitor native kabuk ve haptics eklentisiyle kullanılabilir; Safari tek başına iPhone titreşimini desteklemez. Derleme ve telefon testi henüz yapılmadı.
