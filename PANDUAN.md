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
