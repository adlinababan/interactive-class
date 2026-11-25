/* Pelajaran: Clustered vs Unclustered (Modul 08 · LO 2)
 * Mengikuti slide "Issues to Consider in Index Selection", "Examples of Clustering", "Points to Remember".
 * Semua angka diukur di PostgreSQL 16 pada tabel Emp 100.000 baris (830 halaman) yang urutan fisiknya acak,
 * lalu diurutkan dengan CLUSTER Emp USING emp_age.
 */
(function () {
  const N = 83;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const ALL = range(0, N - 1);
  const EQ_UNCL = ALL.filter((i) => ![3, 17, 29, 41, 56, 63, 78].includes(i));   // 760 dari 830 halaman (≈ 76 kotak)
  const pages = (read, extra) => Object.assign({ id: "pages", type: "pages", title: "Tabel Emp di disk", cap: "830 halaman", n: N, cols: 14, scale: 10, total: 830, read }, extra || {});
  const badge = (v, tone, title) => ({ id: "badge", type: "badge", title: title || "Total halaman", value: v, unit: "tabel + indeks", tone });
  const SAMPLE_COLS = ["eid", "age", "halaman"];
  const SAMPLE_UNCL = [[38, 30, 156], [114, 30, 425], [117, 30, 523], [118, 30, 745], [154, 30, 705], [175, 30, 442]];
  const SAMPLE_CL = [[38, 30, 208], [114, 30, 214], [117, 30, 216], [118, 30, 221], [154, 30, 220], [175, 30, 214]];
  const sq = (rows) => rows.map((r) => Math.floor(r[2] / 10));
  const sample = (rows, state) => ({ id: "sample", type: "table", title: "Contoh baris dengan age = 30", cap: "lokasi fisiknya", cols: SAMPLE_COLS, rows, keys: rows.map((r) => r[0]), state });

  // ---------- kode ----------
  const Q = (cond) => [["", ""], ["q1", "SELECT ename"], ["q2", "FROM   Emp"], ["q3", "WHERE  " + cond + ";"]];
  const CODE = {
    range: [["mk", "CREATE INDEX emp_age ON Emp(age);   -- unclustered"], ...Q("age BETWEEN 30 AND 34")],
    cluster: [
      ["mk", "CREATE INDEX emp_age ON Emp(age);"],
      ["+cl", "CLUSTER Emp USING emp_age;   -- urutkan baris menurut age"],
      ["cm", "-- SQL Server: CREATE CLUSTERED INDEX emp_age ON Emp(age);"],
      ...Q("age BETWEEN 30 AND 34")
    ],
    eq: [["mk", "-- indeks emp_age, sebelum dan sesudah CLUSTER"], ...Q("age = 30")],
    satu: [
      ["s1", "-- Baris fisik hanya bisa diurutkan dengan SATU cara"],
      ["s2", "CLUSTER Emp USING emp_age;   -- urut menurut age"],
      ["s3", "-- emp_dno tetap ada, tetapi tidak lagi berurutan di disk"],
      ["s4", "SELECT ename FROM Emp WHERE dno = 21;"]
    ],
    eid: [["", "-- Tabel sudah di-cluster menurut age"], ["q1", "SELECT *"], ["q2", "FROM   Emp"], ["q3", "WHERE  eid = 4242;   -- eid unik: hanya 1 baris"]]
  };

  const metricsOf = (f) => ({ pages: f.pg, rows: f.rows });
  const S = DBStory({ items: [], sql: "range", out: [] }, metricsOf);
  const steps = [];

  // 1 — MASALAH: indeks unclustered tetap membaca semua halaman
  S.s.items = [pages([])];
  S.snap({ line: ["q1", "q2", "q3"], note: "Cari karyawan berumur 30–34 tahun (pakai indeks age)", dur: 1800 });
  S.s.items = [pages(ALL, { hit: ALL, count: 830 }), badge(841, "bad")];
  S.s.pg = 841; S.s.rows = 10325;
  S.s.out = ["#Bitmap Heap Scan on emp", "#  Heap Blocks: exact=830", "#  Buffers: shared hit=830 read=11", "10.325 baris"];
  S.snap({ line: "q3", note: "Ada indeks, tetapi 830 halaman tabel tetap dibaca", tone: "alert", dur: 2800 });
  steps.push(S.take());

  // 2 — kenapa: baris tersebar
  S.s.items = [sample(SAMPLE_UNCL, { 0: "hl", 1: "hl", 2: "hl", 3: "hl", 4: "hl", 5: "hl" }), pages(sq(SAMPLE_UNCL), { hit: sq(SAMPLE_UNCL), foot: "Lokasi <b>6 baris contoh</b> · 1 kotak ≈ 10 halaman" })];
  S.s.out = []; S.s.pg = undefined; S.s.rows = undefined;
  S.snap({ line: "mk", note: "Baris dengan age = 30 tersebar di halaman 156, 425, 523, 745, …", tone: "alert", dur: 2800 });
  steps.push(S.take());

  // 3 — CLUSTER
  S.s.sql = "cluster";
  S.snap({ line: "cl", note: "CLUSTER: susun ulang baris tabel mengikuti urutan age", dur: 1800 });
  S.s.items = [sample(SAMPLE_CL, { 0: "ok", 1: "ok", 2: "ok", 3: "ok", 4: "ok", 5: "ok" }), pages(sq(SAMPLE_CL), { hit: sq(SAMPLE_CL), foot: "Lokasi <b>6 baris contoh</b> · 1 kotak ≈ 10 halaman" })];
  S.snap({ line: "cl", note: "Sekarang age = 30 berkumpul di halaman 205–222", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 4 — SOLUSI
  S.s.items = [pages(range(20, 29), { hit: range(20, 29), count: 87 }), badge(98, "ok")];
  S.s.pg = 98; S.s.rows = 10325;
  S.s.out = ["#Index Scan using emp_age on emp", "#  Buffers: shared hit=87 read=11", "10.325 baris"];
  S.snap({ line: "q3", note: "Rentang yang sama: 87 halaman berurutan + 11 halaman indeks", tone: "done", dur: 2800 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 5 — KASUS: kesamaan dengan banyak duplikat
  S.s.sql = "eq";
  const CMP = { id: "cmp", type: "bars", title: "Halaman dibaca (tabel + indeks)", unit: "halaman", max: 850, items: [
    { label: "age 30–34 · unclustered", value: 841, tone: "bad" },
    { label: "age 30–34 · clustered", value: 98, tone: "ok" }
  ] };
  S.s.items = [pages(EQ_UNCL, { hit: EQ_UNCL, count: 760 }), CMP];
  S.s.pg = 764; S.s.rows = 2046;
  S.s.out = ["#Bitmap Heap Scan on emp", "#  Heap Blocks: exact=760", "2.046 baris"];
  S.snap({ line: "q3", note: "age = 30 ada 2.046 orang: tanpa cluster 764 halaman", tone: "alert", dur: 2600 });
  CMP.items.push({ label: "age = 30 · unclustered", value: 764, tone: "bad" }, { label: "age = 30 · clustered", value: 22, tone: "ok" });
  S.s.items = [pages(range(20, 22), { hit: range(20, 22), count: 18 }), CMP];
  S.s.pg = 22;
  S.s.out = ["#Index Scan using emp_age on emp", "#  Buffers: shared hit=22", "2.046 baris"];
  S.snap({ line: "q3", note: "Setelah cluster: 22 halaman saja", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 6 — KASUS: hanya satu clustered index
  S.s.sql = "satu";
  S.s.out = []; S.s.pg = undefined; S.s.rows = undefined;
  S.s.items = [{ id: "satu", type: "table", title: "Urutan fisik tabel = age", cols: ["Query", "Indeks", "Berurutan di disk?"],
    rows: [["WHERE age BETWEEN …", "emp_age", "ya ✓"], ["WHERE dno = 21", "emp_dno", "tidak ✗"], ["WHERE hobby = 'Stamps'", "emp_hobby", "tidak ✗"]],
    state: { 0: "ok", 1: "err", 2: "err" } }];
  S.snap({ line: ["s2", "s3"], note: "Satu tabel hanya bisa punya 1 clustered index", tone: "keep", dur: 2800 });
  steps.push(S.take());

  // 7 — KASUS: mencari 1 baris unik
  S.s.sql = "eid";
  S.s.items = [pages([26], { hit: [26], count: 1 }), badge(3, "ok")];
  S.s.pg = 3; S.s.rows = 1;
  S.s.out = ["#Index Scan using emp_eid on emp", "#  Buffers: 3 halaman", "1 baris"];
  S.snap({ line: "q3", note: "Cari 1 baris unik: tetap 3 halaman, clustered atau tidak", tone: "done", dur: 2400 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "cl", note: "Clustering berguna saat banyak baris diambil sekaligus", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "clustered-index",
    renderer: "db",
    title: "Clustered vs Unclustered: Urutan di Disk Itu Penting",
    subtitle: "Indeks tahu di mana barisnya, tetapi kalau baris-baris itu tersebar di seluruh disk, database tetap harus membuka hampir semua halaman.",
    minutes: 14,
    level: "Menengah",
    lo: "LO 2",
    learn: [
      { text: "Kenapa indeks biasa lemah untuk query rentang", at: 0 },
      { text: "Clustered index: baris disusun mengikuti kunci indeks", at: 2 },
      { text: "Duplikat (age = 30) juga terbantu clustering", at: 4 },
      { text: "Satu tabel hanya punya satu clustered index", at: 5 },
      { text: "Pencarian 1 baris unik tidak butuh clustering", at: 6 }
    ],
    metrics: [
      { key: "pages", label: "Halaman dibaca", icon: "▤" },
      { key: "rows", label: "Baris hasil", icon: "≡" }
    ],
    legend: [
      { color: "#10b981", label: "Halaman berisi hasil" },
      { color: "#f59e0b", label: "Baris contoh" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Rentang", title: "Indeks ada, tetapi tetap lambat",
        text: [
          "Kita mencari semua karyawan berumur 30–34 tahun, dan sudah ada indeks pada kolom `age`. Hasilnya 10.325 orang.",
          "Anehnya, database tetap membaca **semua 830 halaman** tabel, ditambah 11 halaman indeks: total **841**. Indeksnya hampir tidak membantu."
        ],
        changed: [["+", "Indeks emp_age (unclustered)"], ["+", "841 halaman dibaca"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Tersebar", title: "Kenapa? Barisnya tersebar",
        text: [
          "Lihat lokasi beberapa karyawan berumur 30: halaman 156, 425, 523, 745, 705, 442. Barisnya **tersebar** ke seluruh tabel, karena data dimasukkan dalam urutan acak.",
          "Indeks seperti ini disebut **unclustered**: urutan di indeks (terurut menurut age) berbeda dengan urutan baris di disk."
        ],
        callout: { type: "ANALOGI", text: "Daftar indeks buku bilang \"topik X ada di hlm. 15, 230, 410, 702\". Tahu halamannya tetap saja harus membalik ke mana-mana." },
        changed: [["+", "6 contoh baris dan halamannya"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "CLUSTER", title: "Clustered index",
        text: [
          "`CLUSTER Emp USING emp_age` menyusun ulang baris-baris tabel **mengikuti urutan age**. Karyawan berumur 30 kini berkumpul di halaman 205–222.",
          "Indeks yang urutannya sama dengan urutan baris di disk disebut **clustered index**. Di SQL Server ditulis `CREATE CLUSTERED INDEX`."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Di PostgreSQL, `CLUSTER` hanya mengurutkan sekali; data baru tidak otomatis ikut urut. Di SQL Server, clustered index menjaga urutan itu terus-menerus." },
        changed: [["~", "Halaman age = 30: tersebar → 205–222"]],
        frames: steps[2]
      },
      {
        kind: "SOLUSI", short: "98 halaman", title: "Dari 841 menjadi 98 halaman",
        text: [
          "Query rentang yang sama kini hanya membaca **87 halaman tabel yang berurutan** dan 11 halaman indeks: total **98 halaman**, turun dari 841.",
          "Barisnya tidak berubah (tetap 10.325), yang berubah hanya **tempat penyimpanannya**."
        ],
        callout: { type: "IDE KUNCI", text: "Untuk query **rentang** (BETWEEN, >, <), clustering sangat menentukan. Itu pesan slide: *range conditions are sensitive to clustering*." },
        changed: [["~", "Halaman dibaca 841 → 98"]],
        frames: steps[3]
      },
      {
        kind: "KASUS", short: "Duplikat", title: "Kasus: banyak nilai yang sama",
        text: [
          "Query `age = 30` adalah kesamaan (=), bukan rentang. Tetapi ada **2.046** karyawan berumur 30. Tanpa clustering, mereka tersebar di 760 halaman (total 764).",
          "Setelah clustering, cukup **22 halaman**. Jadi kesamaan pada kolom yang punya banyak duplikat juga terbantu clustering, seperti contoh `hobby = 'Stamps'` di slide."
        ],
        changed: [["+", "age = 30: 764 → 22 halaman"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Hanya satu", title: "Kasus: cuma boleh satu",
        text: [
          "Baris di disk hanya bisa diurutkan dengan **satu cara**. Kalau sudah urut menurut `age`, maka urut menurut `dno` atau `hobby` tidak mungkin sekaligus.",
          "Karena itu satu tabel hanya punya **satu clustered index**. Pilih untuk query penting yang mengambil **banyak baris**."
        ],
        changed: [["+", "Hanya emp_age yang clustered"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "1 baris", title: "Kasus: mencari 1 baris unik",
        text: [
          "Mencari `eid = 4242` hanya menghasilkan 1 baris. Satu baris pasti ada di satu halaman, jadi clustered atau tidak, tetap **3 halaman**.",
          "Kesimpulan slide: *clustering is useful whenever many tuples are to be retrieved*."
        ],
        changed: [["+", "eid = 4242: 3 halaman"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Indeks memberi tahu lokasi baris. Clustering memastikan baris-baris yang dicari berdekatan di disk."],
        bullets: [
          "Unclustered: urutan indeks ≠ urutan baris di disk.",
          "Untuk rentang atau nilai yang banyak duplikat, unclustered bisa membaca hampir semua halaman.",
          "Clustered: baris disusun mengikuti kunci indeks (841 → 98 halaman).",
          "Satu tabel hanya punya satu clustered index.",
          "Untuk 1 baris unik, clustering tidak berpengaruh."
        ],
        quiz: [
          { q: "Query mana yang paling terbantu oleh clustered index pada kolom age?", options: ["WHERE eid = 4242", "WHERE age BETWEEN 30 AND 34", "WHERE ename = 'Emp1'", "SELECT COUNT(*) FROM Emp"], answer: 1, why: "Rentang mengambil banyak baris; clustering membuatnya berdekatan di disk." },
          { q: "Berapa clustered index yang boleh dimiliki satu tabel?", options: ["Tidak terbatas", "Satu", "Dua", "Sebanyak jumlah kolom"], answer: 1, why: "Baris di disk hanya bisa diurutkan dengan satu cara." },
          { q: "Apa arti unclustered index?", options: ["Indeks yang rusak", "Urutan indeks berbeda dengan urutan baris di disk", "Indeks tanpa kunci", "Indeks yang belum dibuat"], answer: 1, why: "Barisnya bisa tersebar di banyak halaman." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Pelajaran berikutnya: **Indeks Komposit & Tuning Query**, yaitu indeks dua kolom dan menulis ulang query."
  });
})();
