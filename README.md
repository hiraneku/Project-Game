# Silence of Life — Movement Prototype

Prototype browser untuk menguji fondasi movement game 2D side-scrolling.

## Fitur

- Gerak kiri dan kanan dengan akselerasi/deselerasi.
- Jalan/lari toggle.
- Lompat dengan gravity, coyote time, dan jump buffer.
- Dash blink dengan afterimage dan flash cue.
- Kamera follow, smoothing, damping, look-ahead, dead zone, bounds, bob, dan parallax.
- Kontrol touch untuk HP.
- Level platform pengujian.
- Bola kuning sebagai placeholder sementara.

## Preview

https://hiraneku.github.io/Project-Game/

## Struktur saat ini

- `index.html` — prototype movement yang dapat dimainkan.
- `background-aesthetic.png` — background environment sementara.

Aset karakter sengaja belum disimpan. Aset tersebut akan ditambahkan kembali setelah sistem movement dan struktur game sudah stabil.

## Menyiapkan APK Android dengan Capacitor

Prasyarat: Node.js, Android Studio, dan Android SDK.

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Setelah Android Studio terbuka, jalankan emulator atau sambungkan HP Android lalu tekan Run. Untuk membuat APK, gunakan menu **Build → Generate App Bundles or APKs → Generate APKs**.

Setiap ada perubahan pada game web, jalankan:

```bash
npx cap sync android
```

Folder `android/` akan dibuat oleh Capacitor setelah perintah `cap add android` dijalankan dan sebaiknya ikut disimpan di repository.
