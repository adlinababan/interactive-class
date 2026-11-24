# Panduan Menambah Pelajaran

## 1. Daftarkan di kerangka kursus

Di `algoritma-pemrograman/course.js`, cari pelajarannya lalu tambahkan `ready: true`:

```js
{ slug: "selection-insertion-sort", title: "Selection & Insertion Sort", goal: "...", sessions: "Teori 12", ready: true }
```

## 2. Buat file data pelajaran

Buat `algoritma-pemrograman/lessons/<slug>.js`, isinya satu panggilan `Kelas.registerLesson({...})`:

```js
Kelas.registerLesson({
  slug: "selection-insertion-sort",   // sama dengan di course.js
  renderer: "sort",                   // renderer panggung yang dipakai
  title: "...", subtitle: "...",
  minutes: 12, level: "Pemula", lo: "LO 4",
  learn: ["...", "..."],              // 4–5 poin "Yang akan kamu pelajari"
  metrics: [
    { key: "c", label: "Perbandingan" },
    { key: "s", label: "Pertukaran" },
    { key: "t", label: "Total operasi", sum: ["c", "s"], total: true }
  ],
  legend: [{ color: "#ffd7ae", border: "#ee7d1c", label: "Dibandingkan" }],
  initial: { /* frame awal panggung */ },
  steps: [
    {
      kind: "MASALAH",                 // MASALAH | TEKNIK | SOLUSI | KASUS | RANGKUMAN
      short: "Data acak",              // label stepper (1–2 kata)
      title: "...",                    // judul langkah (≤ 6 kata)
      text: ["paragraf 1", "paragraf 2"],   // boleh pakai `kode` dan **tebal**
      bullets: ["..."],                // opsional
      callout: { type: "IDE KUNCI", text: "..." },   // atau "PERLU DIKETAHUI"
      changed: [["+", "baru"], ["~", "berubah 15 → 12"], ["-", "dihapus"]],
      quiz: [{ q: "...", options: ["a", "b"], answer: 1, why: "..." }],   // opsional
      tempo: 0.8,                      // opsional: percepat/perlambat animasi
      frames: [ /* keadaan panggung, diputar berurutan */ ]
    }
  ],
  next: "Teaser pelajaran berikutnya"
});
```

## Aturan frame

- Setiap langkah dimulai dari **frame terakhir langkah sebelumnya**, lalu memutar `frames` miliknya. Jadi maju, mundur, dan mengklik stepper selalu menghasilkan keadaan yang sama.
- `frame.metrics` berisi nilai lengkap metrik saat itu, mis. `{ c: 5, s: 3, p: 1 }`. Nilai yang tidak ada tampil `—`. `frame.approx = { s: true }` menambahkan tanda `≈`.
- `frame.dur` adalah lama frame (ms) sebelum lanjut ke frame berikutnya.
- **Jangan menulis angka dengan tangan.** Jalankan algoritmanya di JavaScript (lihat fungsi `trace` di `bubble-sort.js`) agar narasi, metrik, dan diagram tidak pernah bertentangan.

## Renderer "sort"

Dipakai untuk pelajaran pengurutan. Data tambahan di pelajaran:

```js
sort: { items: [{ id: "a", name: "Ayu", v: 70 }], code: { basic: [["id-baris", "teks kode"]] }, newLines: { opt: ["id-baris"] }, listName: "nilai" }
```

Field frame: `order` (urutan id), `vals` (nilai yang berubah), `cmp` (dua indeks yang dibandingkan), `result` (`"swap"`/`"keep"`), `sortedFrom` (indeks awal zona final), `note`, `tone` (`swap`/`keep`/`done`/`alert`), `code` (versi kode), `line` (id baris yang disorot), `vars`, `revised` (id yang disorot ungu), serta `view: "growth"` atau `view: "summary"` untuk tampilan grafik/ringkasan.

## Renderer "oop"

Dipakai untuk pelajaran class dan objek. Tata letak memakai koordinat `(u, v)`: `u` ke kanan di layar, `v` ke depan (bawah). Isi frame:

| Field | Isi |
|---|---|
| `classes` | `[{ id, title, u, v, theme, parent, members: [{ id, label, kind: "attr" \| "method" }] }]`, dengan `parent` menggambar panah "mewarisi" |
| `objects` | `[{ id, title, u, v, theme, attrs: [[nama, nilai], ...] }]` |
| `vars` | `[{ id, u, v, to }]`: tag variabel di lantai dengan panah ke objek (`to` = id objek atau anchor) |
| `links` | `[{ from, to, label }]`: panah antar-anchor, misalnya atribut → objek lain |
| `flow` | `{ path: [anchor, ...], kind: "go" \| "err" }`: jalur pemanggilan dengan paket berjalan |
| `marks` | `{ anchor: "hl" \| "chg" \| "err" \| "ok" \| "new" \| "miss" \| "over" \| "ghost" }` |
| `out` | Baris konsol output; awali dengan `!` untuk baris error |
| `crowd` | `{ n, show, cols, u, v, label }`: banyak objek kecil (kasus skala) |

Anchor: `v:my_dog`, `o:o1`, `o:o1.a:name`, `c:Dog`, `c:Dog.m:sit`, `crowd`.

Frame disusun dengan `OOPStory(keadaanAwal, metricsOf)`: ubah `S.s`, lalu panggil `S.snap({ line, note, flow, marks })`, dan `S.take()` untuk mengambil frame satu langkah. Metrik dihitung otomatis dari keadaan, dan semua output konsol harus dicocokkan dengan menjalankan programnya di Python.

## Renderer "net"

Dipakai untuk arsitektur sistem, jaringan, dan analisis keputusan (biaya, skor). Tata letak memakai `(u, v)` seperti renderer "oop". Isi frame:

| Field | Isi |
|---|---|
| `nodes` | `[{ id, kind, label, sub, subTone, u, v, theme, state, range, sparkle }]`. `kind`: server, app, mainframe, pc, terminal, laptop, phone, db, cloud, switch, router, proxy, printer, ap, box, stack, token, bar. `state`: `hl`, `ok`, `err`, `off`, `busy` |
| `bar` | Batang grafik 3D: `n` = tinggi bertanda (negatif masuk ke bawah lantai), `w` = lebar, `z0` = dasar untuk batang bertumpuk |
| `edges` | `[{ a, b, kind: "wire" \| "wan" \| "wifi" \| "logic", state: "cut" \| "off" \| "hl", label }]` |
| `zones` | `[{ id, label, u0, v0, u1, v1, theme }]`: area lantai berlabel |
| `flows` | `[{ path: [id, ...], kind: "req" \| "res" \| "data" \| "err" \| "file", dur, delay, count }]`: paket berjalan |
| `card` | Kartu di panggung: `type: "chart" \| "table" \| "lab"`, `at: "center" \| "right"`, `title`, `foot`. Tabel memakai `cols`, `rows`, `hl`, `rowTone`; lab memanggil `lesson.labs[nama](el, helpers)` untuk slider interaktif |
| `note`, `tone`, `metrics` | Catatan di atas diagram dan nilai strip metrik |

Frame disusun dengan `NetStory(keadaanAwal)`: ubah `S.s` atau pakai `S.set(id, props)`, `S.drop(...)`, lalu `S.snap({ note, flows, card, metrics })` dan `S.take()`. Semua angka (antrean, TCO, payback, ROI, NPV, skor berbobot) dihitung dari rumus di file pelajaran, bukan diketik tangan.

### Ulang otomatis

Tombol **🔁 Otomatis** (pintasan **L**) memutar animasi langkah yang sedang dibuka berulang-ulang: animasi selesai, diam di keadaan akhir sekitar 2,8 detik (garis di bawah tombol menunjukkan hitung mundur), lalu diputar lagi. Efek suara ikut berbunyi di setiap putaran (bisa dimatikan dengan tombol Suara / **M**). **Spasi** saat menunggu menahan di keadaan akhir, Spasi lagi melanjutkan. Langkah RANGKUMAN tidak diulang. Pilihan disimpan di `localStorage` (`kelas:ulang`).

### Animasi dan pengaturan "kurangi gerakan"

Secara bawaan, animasi mengikuti pengaturan perangkat (*prefers-reduced-motion*). Banyak laptop Windows mematikan "Animation effects", sehingga pelajaran langsung melompat ke hasil akhir tanpa animasi. Pada perangkat seperti itu muncul tombol **✨ Nyalakan animasi** di atas panggung. Pilihannya disimpan di `localStorage` (`kelas:animasi` = `on`/`off`) dan dibaca lewat `KelasMotion.reduce` serta `Iso.reduceMotion`.

### Efek suara (`shared/sfx.js`)

Halaman yang memuat `shared/sfx.js` otomatis mendapat tombol **🔊 Suara** (pintasan **M**, pilihan diingat di browser). Semua bunyi disintesis dengan Web Audio API, tanpa file audio. Renderer "net" membunyikan:

| Kejadian di panggung | Bunyi |
|---|---|
| Benda muncul / kabel tersambung | `drop` (nada sesuai jenis benda), `link` |
| Paket berjalan (`flows`) | `req` naik, `res` turun, `data`, `file`, `err` |
| Status berubah ke `err` / `ok` | dengung rendah / dua nada naik |
| Kabel `cut` | bunyi putus |
| Batang tumbuh / turun di bawah nol | nada meluncur naik / turun |
| `sparkle`, kartu muncul | kilau, desis |
| Catatan bertanda `alert` / `done` | dua nada peringatan / akor berhasil |
| Slider di lab | tik yang nadanya mengikuti nilai |

Bunyi hanya diputar saat animasi berjalan, tidak saat melompat langsung ke suatu langkah. Browser baru mengizinkan suara setelah klik atau tombol pertama.

## Toolkit isometrik (`shared/iso.js`)

Semua panggung digambar sebagai diagram isometrik 3D. Toolkit ini bisa dipakai untuk renderer apa pun:

| Fungsi | Kegunaan |
|---|---|
| `Iso.scene(el)` | Membuat SVG dengan latar grid isometrik, lapisan (`floor`, `obj`, `conn`, `label`, `fx`), dan kamera |
| `Iso.box(layer, { theme, drop })` → `.set({ x, y, z, w, d, h, base })` | Balok 3D (kolom, server, alas). `drop` = jeda (ms) animasi jatuh ke panggung |
| `Iso.pill(layer, { text, cls })` → `.at(x, y, z, dy)` | Label pil yang menempel di titik dunia; berpindah halus |
| `Iso.connector(layer, sc.arrow)` → `.set({ from, to, arc, packets, both })` | Garis/busur berpanah; `packets: true` menjalankan paket hijau (pergi) dan oranye (kembali) terus-menerus |
| `sc.camera.fit(points, { pad })` | Membingkai ulang kamera agar semua titik terlihat; hanya bergerak bila perlu |
| `Iso.tween(ms, step, done)` | Animasi berbasis waktu (menghormati *reduced motion*) |

Tema warna balok: `slate`, `board`, `warm`, `warm-strong`, `ok`, `violet`, `blue`, `sand` (lihat `shared/iso.css`).

Aturan animasi yang dipakai:
1. Benda baru **jatuh ke panggung** (berurutan, beberapa puluh ms per benda).
2. Benda yang tetap ada **bergeser** ke posisi baru; benda yang ditukar **melompat** melewati pasangannya.
3. Koneksi muncul setelah benda mendarat, lalu **paket mengalir** bolak-balik selama langkah aktif.
4. Label pil menempel di diagram, bukan di luar panggung.
5. Kartu ringkasan/grafik muncul **di dalam panggung** sementara diagram diredupkan.

## Renderer baru

Untuk topik lain (flowchart, list, dictionary, call stack), buat `shared/renderers/<nama>.js`:

```js
Kelas.registerRenderer("nama", {
  mount(stageEl, lesson) { /* bangun DOM sekali */ },
  render(frame, { instant }) { /* terapkan keadaan; instant = tanpa animasi */ },
  unmount() {}
});
```

Lalu muat file JS dan CSS-nya di `algoritma-pemrograman/index.html` (setelah `iso.js`).

## Sebelum commit

1. Jalankan setiap langkah maju sampai akhir, lalu mundur. Keadaannya harus sama.
2. Hitung ulang angka di narasi.
3. Cek tampilan di lebar ponsel (sekitar 380 px) dan di proyektor.
