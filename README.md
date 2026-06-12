# Zlip - Toolkit Acak & Produktivitas

Zlip adalah sebuah toolkit interaktif berbasis web (PWA - Progressive Web App) yang menyediakan berbagai alat acak dan utilitas kelas. Dirancang agar berjalan sangat cepat, bisa digunakan secara luring (offline), dan menyimpan data sepenuhnya secara lokal di browser Anda.

Zlip sangat cocok digunakan untuk kebutuhan mengajar di kelas, kepanitiaan, atau sesi permainan kasual bersama teman.

## 🌟 Fitur Utama

- **Roda Putar (Spinner)**: Buat roda keberuntungan dengan warna dan suara yang dinamis.
- **Dadu 3D (Dice)**: Undi angka dari 1 hingga banyak dadu dengan animasi fisika 3D yang mulus.
- **Koin (Coin Flip)**: Pelempar koin virtual untuk penentuan keputusan cepat.
- **Timer Countdown**: Timer visual dengan cincin SVG, bunyi detik, dan mode alarm.
- **Bagi Tim (Team Generator)**: Pembagi kelompok untuk tugas/acara kepanitiaan secara adil berdasarkan kriteria yang diinginkan.
- **Menu Kelas Khusus (Class)**: 
  - **Pilih Nama Acak**: Tentukan murid secara acak.
  - **Pertanyaan Acak**: Undi pertanyaan dari daftar yang dibuat.
  - **Flashcard**: Kartu belajar bolak-balik interaktif.
  - **Bagi Kelompok**: Bagi siswa ke dalam beberapa kelompok diskusi dengan cepat.
  - **Acak Peran**: Pasangkan siswa dengan peran khusus.

## 🔒 Privasi & Keamanan (Zero Backend)

Zlip tidak memiliki _backend_ atau _database_ di server. Semua data yang Anda masukkan (daftar nama kelas, pengaturan tema, jumlah dadu) **disimpan 100% di dalam Local Storage browser Anda**. 
Tidak ada data privasi yang dikirimkan ke internet. Anda memiliki kontrol penuh atas data Anda melalui fitur **Ekspor/Impor Data** dan **Reset**.

## 🚀 Cara Menjalankan Secara Lokal

Cukup jalankan menggunakan server web statis standar di terminal:

```bash
# menggunakan Node.js (http-server)
npx http-server

# menggunakan Python
python -m http.server
```
Buka `http://localhost:8080` (atau port yang diberikan) di browser Anda.

## 🌐 Cara Deploy GitHub Pages

Karena Zlip adalah aplikasi _frontend_ murni, proses instalasinya ke *cloud* sangat mudah:

1. Upload semua file ke repository GitHub.
2. Masuk ke Settings.
3. Pilih Pages.
4. Pada Source, pilih Deploy from a branch.
5. Pilih branch main.
6. Pilih folder /root.
7. Simpan.
8. Tunggu link GitHub Pages aktif.

## 💡 Offline Support (PWA)

Zlip dilengkapi dengan *Service Worker* dan file manifest. Setelah Anda mengunjungi halaman web untuk pertama kali, Zlip akan tersimpan (cache) dan **bisa diakses tanpa koneksi internet sama sekali** (termasuk ikon dan efek suara).

## 📄 Lisensi
Zlip adalah perangkat lunak *open-source* yang bebas dimodifikasi dan digunakan untuk keperluan personal maupun edukasi.
