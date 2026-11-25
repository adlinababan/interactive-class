/* Pelajaran: Agregasi, GROUP BY & HAVING (Modul 09 · LO 2)
 * Mengikuti slide "Aggregate Operators", "Find name and age of the oldest sailor(s)", "Queries With GROUP BY and HAVING",
 * "Conceptual Evaluation", dan dua contoh "youngest sailor … for each rating with at least 2 such sailors".
 * Data: instance Sailors (S3) dari buku Ramakrishnan & Gehrke. Semua hasil dan pesan error dicocokkan dengan PostgreSQL 16.
 */
(function () {
  const SAILORS = [[22, "Dustin", 7, 45.0], [29, "Brutus", 1, 33.0], [31, "Lubber", 8, 55.5], [32, "Andy", 8, 25.5], [58, "Rusty", 10, 35.0],
    [64, "Horatio", 7, 35.0], [71, "Zorba", 10, 16.0], [74, "Horatio", 9, 35.0], [85, "Art", 3, 25.5], [95, "Bob", 3, 63.5]];
  const fmt = (r) => [r[0], r[1], r[2], r[3].toFixed(1)];
  const GI = { 1: 0, 3: 1, 7: 2, 8: 3, 9: 4, 10: 5 };
  const COLS = ["sid", "sname", "rating", "age"];
  const tbl = (rows, state, group, title) => ({ id: "s", type: "table", title: title || "Sailors S", cols: COLS, rows: rows.map(fmt), keys: rows.map((r) => r[0]), state, group });
  const st = (rows, fn) => Object.fromEntries(rows.map((r, i) => [i, fn(r, i)]).filter((e) => e[1]));

  // ---------- kode ----------
  const CODE = {
    count: [["c1", "SELECT COUNT(*)"], ["c2", "FROM   Sailors S;"], ["", ""], ["a1", "SELECT AVG(S.age)"], ["a2", "FROM   Sailors S"], ["a3", "WHERE  S.rating = 10;"]],
    illegal: [["x1", "SELECT S.sname, MAX(S.age)   -- ✗ ilegal"], ["x2", "FROM   Sailors S;"]],
    oldest: [["x1", "SELECT S.sname, S.age"], ["x2", "FROM   Sailors S"], ["x3", "WHERE  S.age = (SELECT MAX(S2.age)"], ["x4", "                FROM   Sailors S2);"]],
    group: [["g1", "SELECT   S.rating, MIN(S.age) AS minage"], ["g2", "FROM     Sailors S"], ["g3", "WHERE    S.age >= 18"], ["g4", "GROUP BY S.rating"], ["g5", "HAVING   COUNT(*) > 1;"]],
    group60: [["g1", "SELECT   S.rating, MIN(S.age) AS minage"], ["g2", "FROM     Sailors S"], ["+g3", "WHERE    S.age >= 18 AND S.age <= 60"], ["g4", "GROUP BY S.rating"], ["g5", "HAVING   COUNT(*) > 1;"]]
  };

  const metricsOf = (f) => ({ rowsIn: f.nRows, groups: f.nGroups, rows: f.result ? f.result.rows.length : undefined });
  const S = DBStory({ items: [], sql: "count", out: [] }, metricsOf);
  const steps = [];

  // 1 — operator agregat
  S.s.items = [tbl(SAILORS)];
  S.s.nRows = 10;
  S.s.result = { cols: ["count"], rows: [[10]] };
  S.snap({ line: ["c1", "c2"], note: "COUNT(*): 10 baris diringkas menjadi 1 angka", tone: "done", dur: 2200 });
  S.s.items = [tbl(SAILORS, st(SAILORS, (r) => (r[2] === 10 ? "hl" : "dim")))];
  S.s.nRows = 2;
  S.s.result = { cols: ["avg"], rows: [["25.5"]] };
  S.snap({ line: ["a1", "a2", "a3"], note: "AVG umur rating 10: (35 + 16) ÷ 2 = 25.5", tone: "done", dur: 2400 });
  steps.push(S.take());

  // 2 — KASUS: kolom biasa + agregat
  S.s.sql = "illegal";
  S.s.items = [tbl(SAILORS)];
  S.s.nRows = 10;
  S.s.result = null;
  S.s.out = ["!ERROR: column \"s.sname\" must appear in the GROUP BY clause or be used in an aggregate function"];
  S.snap({ line: "x1", note: "MAX menghasilkan 1 nilai, sname ada 10. Nama siapa yang dipakai?", tone: "alert", dur: 2600 });
  S.s.sql = "oldest";
  S.s.out = [];
  S.s.items = [tbl(SAILORS, st(SAILORS, (r) => (r[3] === 63.5 ? "ok" : "dim")))];
  S.s.result = { cols: ["sname", "age"], rows: [["Bob", "63.5"]] };
  S.snap({ line: ["x3", "x4"], note: "Solusi: cari umur tertinggi dulu (subquery), lalu siapa pemiliknya", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 3 — WHERE
  S.s.sql = "group";
  S.s.result = null;
  S.s.items = [tbl(SAILORS)];
  S.snap({ line: ["g1", "g2", "g3", "g4", "g5"], note: "Umur termuda per rating, hanya rating dengan ≥ 2 pelaut dewasa", dur: 2400 });
  S.s.items = [tbl(SAILORS, st(SAILORS, (r) => (r[3] < 18 ? "out" : null)))];
  S.s.nRows = 9;
  S.snap({ line: "g3", note: "Langkah 1 · WHERE age >= 18: Zorba (16) dicoret", tone: "keep", dur: 2400 });
  steps.push(S.take());

  // 4 — GROUP BY
  const ADULT = SAILORS.filter((r) => r[3] >= 18).sort((a, b) => a[2] - b[2] || a[3] - b[3] || a[0] - b[0]);
  S.s.items = [tbl(ADULT, null, ADULT.map((r) => GI[r[2]]))];
  S.s.nGroups = 6;
  S.snap({ line: "g4", note: "Langkah 2 · GROUP BY rating: baris berwarna sama = satu kelompok", tone: "done", dur: 2800 });
  steps.push(S.take());

  // 5 — HAVING
  const cnt = (rows) => rows.reduce((m, r) => ((m[r[2]] = (m[r[2]] || 0) + 1), m), {});
  const C1 = cnt(ADULT);
  S.s.items = [tbl(ADULT, st(ADULT, (r) => (C1[r[2]] > 1 ? null : "out")), ADULT.map((r) => GI[r[2]]))];
  S.s.nGroups = 3;
  S.snap({ line: "g5", note: "Langkah 3 · HAVING COUNT(*) > 1: kelompok rating 1, 9, 10 hanya 1 orang → dibuang", tone: "keep", dur: 2800 });
  steps.push(S.take());

  // 6 — SOLUSI: MIN per kelompok
  const minOf = (rows, C) => { const m = {}; rows.forEach((r) => { if (C[r[2]] > 1 && (m[r[2]] == null || r[3] < m[r[2]])) m[r[2]] = r[3]; }); return m; };
  const M1 = minOf(ADULT, C1);
  const firstMin = (rows, M) => { const seen = {}; return st(rows, (r) => { if (M[r[2]] === r[3] && !seen[r[2]]) { seen[r[2]] = 1; return "ok"; } return M[r[2]] == null ? "out" : null; }); };
  S.s.items = [tbl(ADULT, firstMin(ADULT, M1), ADULT.map((r) => GI[r[2]]))];
  S.s.result = { cols: ["rating", "minage"], rows: Object.keys(M1).map(Number).sort((a, b) => a - b).map((k) => [k, M1[k].toFixed(1)]) };
  S.snap({ line: "g1", note: "Langkah 4 · MIN(age) tiap kelompok: 1 baris hasil per kelompok", tone: "done", dur: 2800 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 7 — KASUS: batas umur 60
  S.s.sql = "group60";
  S.s.result = null;
  const ADULT60 = ADULT.filter((r) => r[3] <= 60);
  S.s.items = [tbl(ADULT, st(ADULT, (r) => (r[3] > 60 ? "out" : null)), ADULT.map((r) => GI[r[2]]))];
  S.s.nRows = 8; S.s.nGroups = 6;
  S.snap({ line: "g3", note: "Tambah age <= 60: Bob (63.5) ikut dicoret", tone: "keep", dur: 2200 });
  const C2 = cnt(ADULT60), M2 = minOf(ADULT60, C2);
  S.s.items = [tbl(ADULT60, firstMin(ADULT60, M2), ADULT60.map((r) => GI[r[2]]))];
  S.s.nGroups = 2;
  S.s.result = { cols: ["rating", "minage"], rows: Object.keys(M2).map(Number).sort((a, b) => a - b).map((k) => [k, M2[k].toFixed(1)]) };
  S.snap({ line: "g5", note: "Rating 3 kini tinggal Art seorang → kelompoknya ikut dibuang", tone: "alert", dur: 2800 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "g4", note: "WHERE menyaring baris · HAVING menyaring kelompok", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "agregasi-group-by",
    renderer: "db",
    title: "Agregasi, GROUP BY & HAVING",
    subtitle: "Ikuti satu query dari slide langkah demi langkah: baris disaring, dikelompokkan, kelompok dibuang, lalu tiap kelompok diringkas menjadi satu baris.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 2",
    learn: [
      { text: "COUNT, AVG, MIN, MAX: banyak baris jadi satu nilai", at: 0 },
      { text: "Kenapa kolom biasa tidak boleh dicampur agregat", at: 1 },
      { text: "Urutan WHERE → GROUP BY → HAVING → SELECT", at: 2 },
      { text: "Perbedaan WHERE dan HAVING", at: 4 },
      { text: "Satu syarat kecil bisa membuang satu kelompok", at: 6 }
    ],
    metrics: [
      { key: "rowsIn", label: "Baris diproses", icon: "≡" },
      { key: "groups", label: "Kelompok", icon: "▦" },
      { key: "rows", label: "Baris hasil", icon: "✓" }
    ],
    legend: [
      { color: "#6366f1", label: "Warna = kelompok rating" },
      { color: "#10b981", label: "Nilai MIN" },
      { color: "#fb7185", label: "Dicoret" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "TEKNIK", short: "Agregat", title: "Operator agregat",
        text: [
          "**Operator agregat** meringkas banyak baris menjadi satu nilai: `COUNT` (berapa banyak), `SUM` (jumlah), `AVG` (rata-rata), `MIN` (terkecil), `MAX` (terbesar).",
          "`COUNT(*)` dari tabel Sailors memberi **10**. Rata-rata umur pelaut dengan rating 10 (Rusty 35 dan Zorba 16) adalah **25.5**."
        ],
        changed: [["+", "COUNT(*) = 10"], ["+", "AVG(age) rating 10 = 25.5"]],
        frames: steps[0]
      },
      {
        kind: "KASUS", short: "Ilegal", title: "Kasus: nama dan umur tertua",
        text: [
          "Ingin nama dan umur pelaut tertua, lalu menulis `SELECT S.sname, MAX(S.age)`. Slide menyebut query ini **ilegal**, dan database menolaknya.",
          "Alasannya: `MAX` menghasilkan **satu** nilai, sedangkan `sname` ada **sepuluh**. Database tidak tahu nama mana yang dipasangkan. Solusinya: cari umur tertinggi dengan subquery, lalu cari siapa yang umurnya sama: **Bob, 63.5**."
        ],
        changed: [["+", "Error: must appear in GROUP BY"], ["+", "Hasil: Bob 63.5"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "WHERE", title: "Langkah 1: WHERE menyaring baris",
        text: [
          "Pertanyaan dari slide: **umur termuda untuk setiap rating**, hanya pelaut berumur ≥ 18, dan hanya rating yang punya **minimal 2** pelaut seperti itu.",
          "Database mulai dari `WHERE S.age >= 18`. Zorba (16 tahun) dicoret. Tersisa 9 baris."
        ],
        changed: [["~", "Baris diproses 10 → 9"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "GROUP BY", title: "Langkah 2: GROUP BY membentuk kelompok",
        text: [
          "`GROUP BY S.rating` mengumpulkan baris dengan rating yang sama ke dalam satu **kelompok**. Lihat baris-baris bergeser dan diberi warna sesuai kelompoknya.",
          "Ada **6 kelompok**: rating 1, 3, 7, 8, 9, dan 10."
        ],
        callout: { type: "ANALOGI", text: "Seperti memilah tumpukan kertas ujian ke beberapa map menurut kelas. Setelah itu, setiap map dihitung sendiri-sendiri." },
        changed: [["+", "6 kelompok"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "HAVING", title: "Langkah 3: HAVING menyaring kelompok",
        text: [
          "`HAVING COUNT(*) > 1` diperiksa **per kelompok**, bukan per baris. Kelompok rating 1, 9, dan 10 masing-masing hanya berisi satu orang, jadi seluruh kelompoknya dibuang.",
          "Tersisa 3 kelompok: rating 3, 7, dan 8."
        ],
        callout: { type: "IDE KUNCI", text: "**WHERE** menyaring **baris** sebelum dikelompokkan. **HAVING** menyaring **kelompok** setelah dikelompokkan." },
        changed: [["~", "Kelompok 6 → 3"]],
        frames: steps[4]
      },
      {
        kind: "SOLUSI", short: "MIN", title: "Langkah 4: satu baris per kelompok",
        text: [
          "Terakhir, `SELECT S.rating, MIN(S.age)` meringkas setiap kelompok menjadi **satu baris**: rating 3 → 25.5, rating 7 → 35.0, rating 8 → 25.5.",
          "Kolom di SELECT hanya boleh kolom yang ada di GROUP BY (rating) atau agregat (MIN). Itulah aturan yang dilanggar query ilegal di langkah 2."
        ],
        changed: [["+", "Hasil: 3 baris"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "≤ 60", title: "Kasus: tambah batas umur 60",
        text: [
          "Contoh kedua di slide menambah `AND S.age <= 60`. Bob (63.5) ikut dicoret di WHERE.",
          "Akibatnya kelompok rating 3 tinggal Art seorang, sehingga **gagal di HAVING**. Hasil tinggal 2 baris: rating 7 → 35.0 dan rating 8 → 25.5. Satu syarat kecil di WHERE bisa menghapus satu kelompok utuh."
        ],
        changed: [["~", "Hasil: 3 → 2 baris"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Query dengan GROUP BY dibaca menurut urutan kerjanya: saring baris, kelompokkan, saring kelompok, lalu ringkas."],
        bullets: [
          "Agregat meringkas banyak baris menjadi satu nilai.",
          "Urutan: FROM → WHERE → GROUP BY → HAVING → SELECT.",
          "WHERE menyaring baris; HAVING menyaring kelompok.",
          "SELECT hanya boleh kolom GROUP BY atau agregat.",
          "Agregat tidak boleh bersarang, misalnya `MIN(AVG(age))`; gunakan subquery di FROM."
        ],
        quiz: [
          { q: "Syarat COUNT(*) > 1 untuk menyaring kelompok ditulis di…", options: ["WHERE", "HAVING", "SELECT", "FROM"], answer: 1, why: "HAVING diperiksa setelah baris dikelompokkan." },
          { q: "Kenapa `SELECT sname, MAX(age) FROM Sailors` ditolak?", options: ["MAX tidak ada", "sname bukan kolom GROUP BY atau agregat", "Tabel kosong", "age bukan angka"], answer: 1, why: "MAX satu nilai, sname banyak nilai; database tidak tahu harus memasangkan yang mana." },
          { q: "Satu kelompok punya 2 pelaut. Satu dicoret oleh WHERE. Dengan HAVING COUNT(*) > 1, kelompok itu…", options: ["Tetap tampil", "Dibuang", "Error", "Digabung"], answer: 1, why: "Setelah WHERE isinya tinggal 1, jadi gagal di HAVING." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Pelajaran berikutnya: **NULL, Constraint & Trigger**."
  });
})();
