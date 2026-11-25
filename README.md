# Kelas Interaktif

Materi kuliah interaktif. Setiap konsep adalah **diagram hidup yang dijalankan langkah demi langkah**: mahasiswa bisa maju, mundur, menjeda, dan mengulang animasi sambil melihat metrik (biaya) yang berubah di setiap langkah.

## Matakuliah

| Folder | Matakuliah | Status |
|---|---|---|
| [`algoritma-pemrograman/`](algoritma-pemrograman/) | ISYS6973064 Algorithm and Programming (Sistem Informasi, BINUS) | 4 dari 27 pelajaran: **Bubble Sort**, **Class & Objek**, **Mengubah Atribut Objek**, **Inheritance** |

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
  iso.{js,css}                 Toolkit diagram isometrik 3D (balok, label, paket, kamera)
  renderers/sort.{js,css}      Renderer panggung untuk pelajaran pengurutan
  renderers/oop.{js,css}       Renderer panggung untuk class, objek, dan inheritance
  renderers/net.{js,css}       Renderer panggung untuk arsitektur, jaringan, dan grafik keputusan
algoritma-pemrograman/
  index.html                   Aplikasi kursus
  course.js                    Kerangka modul & pelajaran (dari Course Outline)
  lessons/*.js                 Data pelajaran (bubble-sort, class-objek, atribut-objek, inheritance)
pemrograman-berorientasi-objek/ COMP6820001 Object Oriented Programming (Java)
  lessons/*.js                 Polymorphism: overriding, overloading, polimorfisme-shape
                               Interface & Abstract Class: abstract-class, interface, interface-vs-abstract
analisis-perancangan-si/       ISYS6979064 Information Systems Analysis and Design (studi kasus MartKita)
  course.js                    13 modul, 36 pelajaran
  lessons/*.js                 System Architecture: evolusi-arsitektur, client-server, online-batch, topologi-jaringan
                               Development Strategies: make-or-buy, payback-roi-npv, memilih-vendor
```

## Fitur pemutar

- Panggung isometrik 3D: benda jatuh ke panggung, kolom melompat saat ditukar, paket mengalir di sepanjang koneksi
- Strip metrik yang menghitung naik/turun di setiap langkah
- Daftar "Yang akan kamu pelajari" tercentang seiring langkah
- Stepper bernomor; papan ketik `←` `→` langkah, `R` ulangi, `Spasi` jeda
- Sidebar bisa diciutkan menjadi lajur nomor modul (`[` atau tombol ‹), dan pilihannya diingat
- Mode presentasi untuk proyektor (`P`): layar penuh, sidebar disembunyikan, panggung diperbesar (`Esc` untuk keluar)
- Alamat per langkah, mis. `#/bubble-sort/7`, untuk dibagikan di kelas
- Progres per modul disimpan di browser mahasiswa
- Menghormati pengaturan *reduced motion*; nyaman di proyektor dan ponsel

Cara menambah pelajaran baru: lihat [PANDUAN.md](PANDUAN.md).

Struktur pedagogis (langkah bertipe Masalah → Teknik → Solusi → Kasus → Rangkuman) terinspirasi dari *Designed to Scale* karya Dilum Sanjaya. Desain visual, kode, dan isi materi di repo ini dibuat sendiri.
