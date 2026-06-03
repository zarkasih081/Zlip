# Zlip — Multi Randomizer

Zlip adalah aplikasi web interaktif yang menyediakan berbagai alat acak (randomizer) dalam satu tempat. Dibangun menggunakan teknologi web standar (HTML, CSS, dan JavaScript murni), aplikasi ini ringan, super cepat, aman, dan dapat digunakan sebagai Progressive Web App (PWA) di perangkat Android maupun Desktop.

## Fitur Utama

- **Roda Acak (Spinner):** Masukkan nama atau pilihan untuk diundi secara visual.
- **Dadu 3D (Dice):** Lempar dadu dari D4 hingga D100, lengkap dengan fitur modifier dan advantage/disadvantage bergaya RPG.
- **Koin (Coin Toss):** Lempar koin 3D dengan hasil Head/Tail.
- **Bingo:** Alat undian angka Bingo bergaya klasik (B-I-N-G-O) dengan riwayat undian dan papan otomatis.
- **Lotere:** Undi beberapa bola angka sekaligus sesuai kebutuhan.
- **Timer:** Pengatur waktu visual dengan cincin SVG yang presisi.
- **Pembuat Sandi (Password Generator):** Buat kata sandi acak dan aman yang bisa langsung disalin.
- **Pembagi Tim (Team Generator):** Bagi sekelompok orang menjadi beberapa tim secara adil.
- **Tema dan Pengaturan:**
  - Mendukung *Dark Mode* dan *Light Mode*.
  - Pengaturan Suara (Sound) dan Animasi.
  - Multi-bahasa (ID dan EN).

## Teknologi

- **HTML5 & CSS3:** Desain responsif, modern (Neo-Noir Crystalline), dengan micro-animations.
- **Vanilla JavaScript (ES6+):** Logika dipecah menjadi modul-modul fungsional (`core`, `games`, `tools`, `ui`).
- **PWA (Progressive Web App):**
  - Menggunakan manifest `manifest.json`.
  - Offline-first cache strategy melalui `service-worker.js`.
  - Kompatibel dan bisa diinstal layaknya aplikasi asli di Android maupun Windows.
- **Aman (Secure DOM Manipulation):** Data pengguna ditangani dengan lebih aman menggunakan textContent pada bagian yang membutuhkan input langsung.
- **Ikon:** Lucide Icons (disertakan secara lokal untuk ketersediaan offline).

## Struktur Direktori

```text
Zlip/
├── index.html            # File utama (Entry Point)
├── manifest.json         # Konfigurasi PWA
├── service-worker.js     # Service Worker untuk caching offline
├── offline.html          # Halaman fallback saat tidak ada koneksi
│
├── css/                  # Styling (dipecah per modul)
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── games.css
│   └── responsive.css
│
├── js/
│   ├── core/             # Sistem inti aplikasi
│   │   ├── main.js       # Logika utama dan inisialisasi aplikasi
│   │   ├── storage.js    # Pengelolaan localStorage
│   │   ├── i18n.js       # Sistem multi-bahasa
│   │   └── audio.js      # Pemutar suara efek
│   │
│   ├── games/            # Logika fitur game
│   │   ├── spinner.js    # Roda Acak
│   │   ├── dice.js       # Dadu 3D
│   │   ├── coin.js       # Lempar Koin
│   │   ├── bingo.js      # Papan Bingo
│   │   └── lottery.js    # Lotere Angka
│   │
│   ├── tools/            # Fitur utilitas
│   │   ├── timer.js      # Pengatur Waktu (Timer)
│   │   └── password.js   # Generator Kata Sandi
│   │
│   ├── ui/               # Kontrol antarmuka
│   │   ├── ui.js         # Logika elemen UI tambahan (Toast, Modal, dll)
│   │   └── team.js       # Pembagi Tim
│   │
│   └── vendor/           # Pustaka eksternal pihak ketiga
│       └── lucide.min.js # Ikon lokal
│
├── assets/               # Aset statis (gambar, audio, dll.)
│   ├── images/
│   ├── icons/
│   └── sounds/
│
└── tools/                # Skrip utility development (tidak dimuat di produksi)
```

## Cara Menjalankan (Development)

Aplikasi ini adalah sekumpulan file web statis murni sehingga tidak memerlukan *build process*. Anda bisa membukanya dengan beberapa cara:
1. Buka `index.html` langsung di peramban web Anda.
2. Untuk mendukung fungsionalitas PWA dan Service Worker secara optimal, jalankan menggunakan server HTTP lokal. Misalnya, menggunakan ekstensi *Live Server* di VS Code atau menggunakan Node.js:
   ```bash
   npx serve .
   ```

## Lisensi
Proyek ini bersifat bebas dan dapat dikembangkan lebih lanjut.
