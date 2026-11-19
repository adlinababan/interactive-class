# Kelas Interaktif

Materi kuliah interaktif. Setiap konsep adalah **diagram hidup yang dijalankan langkah demi langkah**: mahasiswa bisa maju, mundur, menjeda, dan mengulang animasi sambil melihat metrik (biaya) yang berubah di setiap langkah.

## Matakuliah

| Folder | Matakuliah | Status |
|---|---|---|
| [`algoritma-pemrograman/`](algoritma-pemrograman/) | ISYS6973064 Algorithm and Programming (Sistem Informasi, BINUS) | 1 dari 25 pelajaran: **Bubble Sort** |

## Menjalankan

Situs ini statis, tanpa build step dan tanpa dependensi.

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

**Deploy ke Vercel:** impor repo ini di vercel.com. Framework preset "Other", tanpa build command, output directory `.` (root).

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.

## Struktur

```
index.html                     Halaman depan (daftar matakuliah)
shared/
  style.css                    Gaya bersama
  engine.js                    Mesin kursus + pemutar pelajaran
  renderers/sort.{js,css}      Renderer panggung untuk pelajaran pengurutan
algoritma-pemrograman/
  index.html                   Aplikasi kursus
  course.js                    Kerangka modul & pelajaran (dari Course Outline)
  lessons/bubble-sort.js       Data pelajaran Bubble Sort
```

## Fitur pemutar

- Strip metrik yang menghitung naik/turun di setiap langkah
- Stepper bernomor; papan ketik `←` `→` langkah, `R` ulangi, `Spasi` jeda
- Alamat per langkah, mis. `#/bubble-sort/7`, untuk dibagikan di kelas
- Progres per modul disimpan di browser mahasiswa
- Menghormati pengaturan *reduced motion*; nyaman di proyektor dan ponsel

Cara menambah pelajaran baru: lihat [PANDUAN.md](PANDUAN.md).

Struktur pedagogis (langkah bertipe Masalah → Teknik → Solusi → Kasus → Rangkuman) terinspirasi dari *Designed to Scale* karya Dilum Sanjaya. Desain visual, kode, dan isi materi di repo ini dibuat sendiri.
