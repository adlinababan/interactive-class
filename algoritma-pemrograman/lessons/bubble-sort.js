/* Pelajaran: Bubble Sort (Modul 06 · Teori 12 · LO 4)
 * Frame animasi dihasilkan dengan menjalankan bubble sort sungguhan (fungsi trace),
 * sehingga angka di narasi, metrik, dan diagram selalu konsisten.
 */
(function () {
  const ITEMS = [
    { id: "a", name: "Ayu", v: 70 },
    { id: "b", name: "Bima", v: 85 },
    { id: "c", name: "Citra", v: 62 },
    { id: "d", name: "Dani", v: 91 },
    { id: "e", name: "Eka", v: 75 },
    { id: "f", name: "Fajar", v: 80 }
  ];
  const START = ITEMS.map((x) => x.id);
  const BASE_VALS = Object.fromEntries(ITEMS.map((x) => [x.id, x.v]));

  const CODE = {
    basic: [
      ["def", "def bubble_sort(nilai):"],
      ["n", "    n = len(nilai)"],
      ["fori", "    for i in range(n - 1):"],
      ["forj", "        for j in range(n - 1 - i):"],
      ["if", "            if nilai[j] > nilai[j+1]:"],
      ["swap", "                nilai[j], nilai[j+1] = nilai[j+1], nilai[j]"],
      ["ret", "    return nilai"]
    ],
    opt: [
      ["def", "def bubble_sort(nilai):"],
      ["n", "    n = len(nilai)"],
      ["fori", "    for i in range(n - 1):"],
      ["flag", "        tertukar = False"],
      ["forj", "        for j in range(n - 1 - i):"],
      ["if", "            if nilai[j] > nilai[j+1]:"],
      ["swap", "                nilai[j], nilai[j+1] = nilai[j+1], nilai[j]"],
      ["set", "                tertukar = True"],
      ["chk", "        if not tertukar:"],
      ["brk", "            break  # sudah urut, berhenti"],
      ["ret", "    return nilai"]
    ]
  };

  /* Jalankan bubble sort dan rekam setiap kejadian sebagai frame. */
  function trace(order0, vals, opts) {
    const early = opts.early, code = early ? "opt" : "basic", extra = opts.extra || {};
    const order = order0.slice(), n = order.length, val = (id) => vals[id];
    let c = 0, s = 0, p = 0, sortedFrom = n;
    const out = [];
    const push = (fr) => out.push({ order: order.slice(), vals, code, sortedFrom, metrics: { c, s, p }, ...extra, ...fr });
    for (let i = 0; i < n - 1; i++) {
      p++;
      let tertukar = false;
      const v = (j) => (early ? { i, j, tertukar } : j == null ? { i } : { i, j });
      push({ pass: i, type: "start", line: early ? "flag" : "fori", vars: v(), note: "Putaran " + (i + 1) + ": periksa pasangan sampai posisi " + (n - 1 - i), dur: 900 });
      for (let j = 0; j < n - 1 - i; j++) {
        const A = val(order[j]), B = val(order[j + 1]);
        c++;
        push({ pass: i, j, type: "cmp", cmp: [j, j + 1], line: "if", vars: v(j), note: A + " > " + B + " ?", dur: 800 });
        if (A > B) {
          [order[j], order[j + 1]] = [order[j + 1], order[j]];
          s++; tertukar = true;
          push({ pass: i, j, type: "swap", cmp: [j, j + 1], result: "swap", line: "swap", vars: v(j), note: A + " > " + B + "  →  tukar", tone: "swap", dur: 1000 });
        } else {
          push({ pass: i, j, type: "keep", cmp: [j, j + 1], result: "keep", line: "if", vars: v(j), note: A + " ≤ " + B + "  →  biarkan", tone: "keep", dur: 700 });
        }
      }
      if (early && !tertukar) {
        sortedFrom = 0;
        push({ pass: i, type: "break", line: "brk", vars: v(), note: "Tidak ada pertukaran  →  data sudah urut, break", tone: "done", dur: 1100 });
        break;
      }
      sortedFrom = i === n - 2 ? 0 : n - 1 - i;
      push({ pass: i, type: "end", line: early ? "chk" : "fori", vars: v(), note: val(order[n - 1 - i]) + " terkunci di posisi akhirnya", tone: "done", dur: 1000 });
    }
    sortedFrom = 0;
    push({ type: "done", line: "ret", vars: {}, note: "Selesai: semua nilai urut", tone: "done", dur: 900 });
    return out;
  }

  const basic = trace(START, BASE_VALS, { early: false });
  const early = trace(START, BASE_VALS, { early: true });
  const pick = (frames, fn) => frames.filter(fn);

  // Kasus "hampir urut": daftar sudah urut, lalu nilai Bima direvisi 85 → 93
  const SORTED = basic[basic.length - 1].order;
  const REV_VALS = { ...BASE_VALS, b: 93 };
  const nearly = trace(SORTED, REV_VALS, { early: true, extra: { revised: ["b"] } });

  const afterPass2 = pick(early, (f) => f.pass === 1 && f.type === "end")[0];
  const initial = { order: START, vals: BASE_VALS, code: "basic", line: "def", vars: {}, note: "6 nilai UTS dalam urutan absen", metrics: {} };

  const last = (a) => a[a.length - 1];
  const finalBasic = last(basic).metrics;   // 15 / 6 / 5
  const finalEarly = last(early).metrics;   // 12 / 6 / 3
  const finalNearly = last(nearly).metrics; // 9 / 1 / 2

  Kelas.registerLesson({
    slug: "bubble-sort",
    renderer: "sort",
    title: "Bubble Sort: Menukar Tetangga",
    subtitle: "Urutkan nilai UTS enam mahasiswa sambil menghitung setiap perbandingan, lalu lihat kenapa cara ini kewalahan untuk satu angkatan berisi seribu orang.",
    minutes: 12,
    level: "Pemula",
    lo: "LO 4",
    learn: [
      "Cara kerja bubble sort: bandingkan dua tetangga, tukar jika terbalik",
      "Kenapa nilai terbesar \"menggelembung\" ke kanan di setiap putaran",
      "Menulis bubble sort di Python dengan dua `for` bersarang",
      "Optimasi berhenti-awal dengan penanda `tertukar` dan `break`",
      "Menghitung biaya algoritma: n(n − 1) / 2 perbandingan"
    ],
    metrics: [
      { key: "c", label: "Perbandingan" },
      { key: "s", label: "Pertukaran" },
      { key: "p", label: "Putaran" },
      { key: "t", label: "Total operasi", sum: ["c", "s"], total: true }
    ],
    legend: [
      { color: "#ffd7ae", border: "#ee7d1c", label: "Dibandingkan" },
      { color: "#ee7d1c", label: "Ditukar" },
      { color: "#a8dec5", label: "Sudah final ✓" }
    ],
    sort: { items: ITEMS, code: CODE, newLines: { opt: ["flag", "set", "chk", "brk"] }, listName: "nilai" },
    initial,
    steps: [
      {
        kind: "MASALAH", short: "Data acak", title: "Enam nilai, belum berurutan",
        text: [
          "Kamu asisten dosen. Nilai UTS enam mahasiswa masuk sesuai urutan absen: 70, 85, 62, 91, 75, 80. Dosen minta daftar dari nilai terendah ke tertinggi untuk menentukan siapa yang ikut remedial.",
          "Kamu bisa melihat keenam angka sekaligus. Komputer tidak bisa: dalam satu langkah ia hanya membandingkan dua nilai. Jadi kita butuh **algoritma**, yaitu urutan langkah yang pasti selesai."
        ],
        callout: { type: "IDE KUNCI", text: "Mengurutkan adalah rangkaian perbandingan dan pemindahan. Biaya sebuah algoritma bisa dihitung dari berapa kali keduanya terjadi." },
        changed: [["+", "6 nilai UTS dalam urutan absen"], ["+", "List Python `nilai`"]],
        frames: [initial]
      },
      {
        kind: "TEKNIK", short: "Bandingkan", title: "Bandingkan dua tetangga",
        text: [
          "Bubble sort mulai dari kiri dan hanya melihat dua nilai yang bersebelahan: posisi `j` dan `j + 1`.",
          "70 dan 85 sudah benar urutannya (yang kecil di kiri), jadi keduanya dibiarkan. Sejauh ini: 1 perbandingan, 0 pertukaran."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Ekspresi `nilai[j] > nilai[j+1]` menghasilkan `True` atau `False`. Satu kali evaluasi = satu perbandingan." },
        changed: [["+", "Putaran 1 dimulai (`i = 0`)"], ["+", "Perbandingan pertama: 70 vs 85"], ["~", "Tidak ada pertukaran"]],
        frames: pick(basic, (f) => f.pass === 0 && (f.type === "start" || f.j === 0))
      },
      {
        kind: "TEKNIK", short: "Tukar", title: "Tukar yang terbalik",
        text: [
          "Geser satu posisi ke kanan: 85 dan 62. Nilai yang lebih besar ada di kiri, jadi urutannya terbalik. Keduanya ditukar.",
          "Python bisa menukar dua nilai dalam satu baris tanpa variabel sementara: `nilai[j], nilai[j+1] = nilai[j+1], nilai[j]`."
        ],
        callout: { type: "IDE KUNCI", text: "Aturan bubble sort hanya satu: jika kiri lebih besar dari kanan, tukar." },
        changed: [["+", "Pertukaran pertama: 85 ↔ 62"], ["~", "Perbandingan 1 → 2"]],
        frames: pick(basic, (f) => f.pass === 0 && f.j === 1)
      },
      {
        kind: "TEKNIK", short: "Putaran 1", title: "Satu putaran penuh",
        text: [
          "Teruskan sampai ujung: 85 vs 91 dibiarkan, 91 vs 75 ditukar, 91 vs 80 ditukar. Putaran pertama selesai dengan 5 perbandingan dan 3 pertukaran.",
          "Perhatikan 91. Begitu ditemukan, ia terus terbawa ke kanan seperti gelembung yang naik ke permukaan. Nilai terbesar pasti berakhir di posisi terakhir."
        ],
        callout: { type: "IDE KUNCI", text: "Setelah putaran ke-k, k nilai terbesar sudah berada di posisi akhirnya. Karena itulah namanya bubble (gelembung)." },
        changed: [["+", "Putaran 1 selesai: 5 perbandingan, 3 pertukaran"], ["~", "91 terkunci di ujung kanan"]],
        frames: pick(basic, (f) => f.pass === 0 && (f.j >= 2 || f.type === "end"))
      },
      {
        kind: "TEKNIK", short: "Putaran 2", title: "Ujung kanan tak perlu dicek",
        text: [
          "Karena 91 sudah final, putaran kedua cukup berjalan sampai posisi 4: hanya 4 perbandingan. Itulah fungsi `range(n - 1 - i)` pada loop dalam.",
          "Putaran 2 menukar 3 pasang, dan datanya kini 62, 70, 75, 80, 85, 91. Sudah urut! Tapi algoritma belum tahu, karena ia hanya pernah melihat dua nilai sekaligus."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Loop luar (`i`) menghitung putaran. Loop dalam (`j`) berjalan di sepanjang bagian yang belum final, sehingga makin pendek di setiap putaran." },
        changed: [["+", "Putaran 2: 4 perbandingan, 3 pertukaran"], ["~", "85 terkunci di posisi 5"], ["~", "Data sudah urut, tapi algoritma belum tahu"]],
        frames: pick(basic, (f) => f.pass === 1)
      },
      {
        kind: "SOLUSI", short: "Selesai", title: "Semua putaran selesai",
        text: [
          "Versi dasar tetap menjalankan putaran 3, 4, dan 5 sampai habis: 3 + 2 + 1 = 6 perbandingan lagi, tanpa satu pun pertukaran.",
          "Hasil akhir untuk 6 nilai: **" + finalBasic.c + " perbandingan, " + finalBasic.s + " pertukaran, " + finalBasic.p + " putaran**. Angka 15 ini selalu sama apa pun isi datanya, karena 5 + 4 + 3 + 2 + 1 = 15."
        ],
        callout: { type: "IDE KUNCI", text: "Untuk n data, versi dasar selalu melakukan n(n − 1) / 2 perbandingan. Untuk n = 6: 6 × 5 / 2 = 15." },
        changed: [["+", "Putaran 3–5: 6 perbandingan tanpa pertukaran"], ["~", "Baseline: 15 perbandingan, 6 pertukaran, 5 putaran"]],
        tempo: 0.8,
        frames: pick(basic, (f) => f.pass >= 2 || f.type === "done")
      },
      {
        kind: "TEKNIK", short: "Berhenti awal", title: "Berhenti jika tak ada tukar",
        text: [
          "Tambahkan penanda `tertukar`. Setiap putaran dimulai dengan `False`, dan berubah menjadi `True` begitu ada pertukaran.",
          "Kita putar ulang dari akhir putaran 2. Putaran 3 memeriksa 3 pasang tanpa menukar apa pun, artinya data sudah urut, jadi `break`. Total turun dari " + finalBasic.c + " menjadi " + finalEarly.c + " perbandingan."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Pola penanda (flag) + `break` juga dipakai di perulangan `while` dan di algoritma pencarian." },
        changed: [["+", "Variabel `tertukar`"], ["+", "`if not tertukar: break`"], ["~", "Perbandingan " + finalBasic.c + " → " + finalEarly.c], ["~", "Putaran " + finalBasic.p + " → " + finalEarly.p]],
        frames: [
          { ...afterPass2, type: "rewind", line: "fori", vars: {}, note: "Putar ulang dari akhir putaran 2, kini dengan penanda tertukar", tone: "", dur: 1600 },
          ...pick(early, (f) => f.pass >= 2 || f.type === "done")
        ]
      },
      {
        kind: "KASUS", short: "Hampir urut", title: "Kasus: data hampir urut",
        text: [
          "Seminggu kemudian daftarnya sudah urut, lalu Bima mendapat koreksi nilai: 85 → 93. Kini hanya satu pasangan yang terbalik, yaitu 93 dan 91.",
          "Dengan berhenti-awal, putaran 1 menukar pasangan itu dan putaran 2 tidak menemukan pertukaran, lalu berhenti. Cukup **" + finalNearly.c + " perbandingan dan " + finalNearly.s + " pertukaran**. Versi dasar tetap butuh 15 perbandingan."
        ],
        callout: { type: "IDE KUNCI", text: "Kinerja algoritma bergantung pada kondisi data. Makin urut datanya, makin cepat bubble sort berhenti. Data yang sudah urut cukup satu putaran: n − 1 perbandingan." },
        changed: [["~", "Nilai Bima 85 → 93"], ["~", "Perbandingan " + finalEarly.c + " → " + finalNearly.c], ["~", "Pertukaran " + finalEarly.s + " → " + finalNearly.s]],
        tempo: 0.75,
        frames: [
          { order: SORTED, vals: REV_VALS, revised: ["b"], code: "opt", line: "def", vars: {}, sortedFrom: 6, note: "Nilai Bima direvisi: 85 → 93", tone: "alert", metrics: { c: 0, s: 0, p: 0 }, dur: 1600 },
          ...nearly
        ]
      },
      {
        kind: "KASUS", short: "1.000 data", title: "Kasus: seribu mahasiswa",
        text: [
          "Sekarang urutkan nilai satu angkatan: 1.000 mahasiswa dalam urutan acak. Versi dasar butuh 1.000 × 999 / 2 = **499.500 perbandingan**.",
          "Dari 6 ke 100 data, perbandingan naik dari 15 menjadi 4.950. Dari 100 ke 1.000 (10 kali lipat), naik sekitar 100 kali lipat. Pada data acak, berhenti-awal hampir tidak membantu."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Pola ini disebut kompleksitas kuadratik, ditulis O(n²). Dalam praktik, pakai `sorted()` atau `list.sort()` bawaan Python yang jauh lebih efisien." },
        changed: [["~", "Data 6 → 1.000 nilai"], ["~", "Perbandingan 15 → 499.500"], ["~", "Pertukaran rata-rata ≈ n(n − 1) / 4 ≈ 249.750"]],
        frames: [
          { view: "growth", dur: 1300, metrics: { c: 15, s: 6, p: 5 },
            growth: { title: "Perbandingan versi dasar = n(n − 1) / 2", sub: "Lebar batang sebanding dengan jumlah perbandingan.", rows: [{ label: "n = 6", note: "kelas kecil", value: 15 }] } },
          { view: "growth", dur: 1500, metrics: { c: 4950, s: 2475, p: 99 }, approx: { s: true },
            growth: { title: "Perbandingan versi dasar = n(n − 1) / 2", sub: "Lebar batang sebanding dengan jumlah perbandingan.", rows: [{ label: "n = 6", note: "kelas kecil", value: 15 }, { label: "n = 100", note: "satu kelas besar", value: 4950 }] } },
          { view: "growth", dur: 1500, metrics: { c: 499500, s: 249750, p: 999 }, approx: { s: true },
            growth: { title: "Perbandingan versi dasar = n(n − 1) / 2", sub: "Lebar batang sebanding dengan jumlah perbandingan.",
              rows: [{ label: "n = 6", note: "kelas kecil", value: 15 }, { label: "n = 100", note: "satu kelas besar", value: 4950 }, { label: "n = 1.000", note: "satu angkatan", value: 499500 }],
              foot: "Data **10× lebih banyak** → kerja **±100× lebih banyak**. Batang n = 6 bahkan tidak terlihat lagi." } }
        ]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Kapan bubble sort cukup?",
        text: [
          "Untuk 6 nilai acak, bubble sort butuh " + finalBasic.c + " perbandingan dan " + finalBasic.s + " pertukaran. Berhenti-awal memangkasnya menjadi " + finalEarly.c + ", dan menjadi " + finalNearly.c + " pada data yang hampir urut."
        ],
        bullets: [
          "Bandingkan dua tetangga; tukar jika kiri lebih besar.",
          "Setiap putaran mengunci satu nilai terbesar di ujung kanan.",
          "Versi dasar selalu n(n − 1) / 2 perbandingan.",
          "Penanda `tertukar` + `break` menghentikan algoritma saat data sudah urut.",
          "Kerja tumbuh kuadratik: cocok untuk data kecil, tidak untuk ribuan data."
        ],
        quiz: [
          { q: "Setelah putaran pertama pada `[70, 85, 62, 91, 75, 80]`, nilai apa yang pasti berada paling kanan?", options: ["80", "91", "85", "Belum bisa dipastikan"], answer: 1, why: "Setiap putaran membawa nilai terbesar yang belum final ke ujung kanan. Nilai terbesar di sini 91." },
          { q: "Berapa perbandingan bubble sort versi dasar untuk 10 data?", options: ["10", "45", "90", "100"], answer: 1, why: "n(n − 1) / 2 = 10 × 9 / 2 = 45." },
          { q: "Data sudah urut sejak awal. Dengan penanda `tertukar`, berapa putaran yang dijalankan?", options: ["0", "1", "n − 1", "n"], answer: 1, why: "Putaran pertama tidak menemukan pertukaran, jadi langsung `break` setelah n − 1 perbandingan." }
        ],
        changed: [],
        frames: [
          { view: "summary", metrics: finalBasic, dur: 800,
            summary: {
              title: "Ringkasan angka",
              sub: "Semua angka berasal dari animasi di pelajaran ini.",
              rows: [
                { label: "Data acak, versi dasar", note: "70, 85, 62, 91, 75, 80", value: finalBasic.c + " perbandingan · " + finalBasic.s + " tukar" },
                { label: "Data acak + berhenti-awal", note: "putaran " + finalBasic.p + " → " + finalEarly.p, value: finalEarly.c + " perbandingan · " + finalEarly.s + " tukar" },
                { label: "Hampir urut + berhenti-awal", note: "nilai Bima direvisi 85 → 93", value: finalNearly.c + " perbandingan · " + finalNearly.s + " tukar", hl: true },
                { label: "1.000 data acak, versi dasar", note: "n(n − 1) / 2", value: "499.500 perbandingan" }
              ],
              foot: "Pilih algoritma sesuai **ukuran** dan **kondisi** data. Inilah inti LO 4: memilih algoritma terbaik untuk masalahnya."
            } }
        ]
      }
    ],
    next: "**Selection Sort & Insertion Sort**: dua cara lain mengurutkan. Mana yang paling sedikit menukar, dan mana yang paling cocok untuk data hampir urut?"
  });
})();
