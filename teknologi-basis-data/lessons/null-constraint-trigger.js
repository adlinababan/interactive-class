/* Pelajaran: NULL, Constraint & Trigger (Modul 09 · LO 3)
 * Mengikuti slide "Null Values", "Integrity Constraints", "General Constraints", "Constraints Over Multiple Relations", "Triggers".
 * Data: Sailors (S3) dari buku Ramakrishnan & Gehrke + satu pelaut baru tanpa rating. Hasil dan pesan error dicocokkan dengan PostgreSQL 16.
 * Trigger ditulis dalam sintaks SQL Server (T-SQL); perilakunya diuji dengan trigger setara di PostgreSQL.
 */
(function () {
  const BASE = [[22, "Dustin", 7, "45.0"], [29, "Brutus", 1, "33.0"], [31, "Lubber", 8, "55.5"], [32, "Andy", 8, "25.5"], [58, "Rusty", 10, "35.0"],
    [64, "Horatio", 7, "35.0"], [71, "Zorba", 10, "16.0"], [74, "Horatio", 9, "35.0"], [85, "Art", 3, "25.5"], [95, "Bob", 3, "63.5"]];
  const DIAN = [99, "Dian", null, "21.0"];
  const ROWS = BASE.concat([DIAN]);
  const COLS = ["sid", "sname", "rating", "age"];
  const T = (id, title, cols, rows, extra) => Object.assign({ id, type: "table", title, cols, rows }, extra || {});
  const st = (rows, fn) => Object.fromEntries(rows.map((r, i) => [i, fn(r, i)]).filter((e) => e[1]));
  const sail = (rows, fn) => T("s", "Sailors", COLS, rows, { state: fn ? st(rows, fn) : undefined });

  // ---------- kode ----------
  const CODE = {
    insert: [["i1", "INSERT INTO Sailors"], ["i2", "VALUES (99, 'Dian', NULL, 21.0);   -- rating belum ada"]],
    gt: [["q1", "SELECT sname, rating"], ["q2", "FROM   Sailors"], ["q3", "WHERE  rating > 8;"], ["", ""], ["p1", "SELECT COUNT(*) FROM Sailors"], ["p2", "WHERE  rating > 8 OR rating <= 8;"]],
    logic: [["l1", "-- Logika tiga nilai: TRUE, FALSE, UNKNOWN"], ["l2", "-- WHERE hanya meloloskan baris bernilai TRUE"]],
    isnull: [["e1", "SELECT sname FROM Sailors"], ["e2", "WHERE  rating = NULL;    -- selalu UNKNOWN"], ["", ""], ["n1", "SELECT sname FROM Sailors"], ["n2", "WHERE  rating IS NULL;"]],
    agg: [["a1", "SELECT COUNT(*), COUNT(rating), AVG(rating)"], ["a2", "FROM   Sailors;"]],
    check: [
      ["t1", "CREATE TABLE Sailors ("], ["", "    sid    INTEGER,"], ["", "    sname  CHAR(10),"], ["", "    rating INTEGER,"], ["", "    age    REAL,"],
      ["", "    PRIMARY KEY (sid),"], ["ck", "    CHECK (rating >= 1 AND rating <= 10)"], ["", ");"], ["", ""],
      ["+ins", "INSERT INTO Sailors VALUES (100, 'Eko', 11, 30.0);"]
    ],
    trig: [
      ["t1", "CREATE TRIGGER YoungSailorUpdate"], ["ev", "ON Sailors AFTER INSERT          -- EVENT"], ["", "AS"], ["", "BEGIN"],
      ["ac", "    INSERT INTO YoungSailors (sid, sname, rating, age)   -- ACTION"], ["ac", "    SELECT sid, sname, rating, age"],
      ["ins", "    FROM   inserted              -- baris yang baru masuk"], ["co", "    WHERE  age <= 18;             -- CONDITION"], ["", "END;"], ["", ""],
      ["do", "INSERT INTO Sailors VALUES (101, 'Budi', 5, 17.0),"], ["do", "                           (102, 'Citra', 6, 20.0);"]
    ]
  };

  const metricsOf = (f) => ({ size: f.size, rows: f.result ? f.result.rows.length : undefined, rej: f.rej || 0 });
  const S = DBStory({ items: [], sql: "insert", out: [], size: 10 }, metricsOf);
  const steps = [];

  // 1 — MASALAH: data belum diketahui
  S.s.items = [sail(BASE)];
  S.snap({ line: ["i1", "i2"], note: "Pelaut baru Dian: rating-nya belum dinilai", dur: 1800 });
  S.s.items = [sail(ROWS, (r) => (r[0] === 99 ? "new" : null))];
  S.s.size = 11;
  S.snap({ line: "i2", note: "Nilai yang tidak diketahui diisi NULL", tone: "keep", dur: 2200 });
  steps.push(S.take());

  // 2 — NULL dalam perbandingan
  S.s.sql = "gt";
  S.s.items = [sail(ROWS, (r) => (r[2] === null ? "err" : r[2] > 8 ? "ok" : "dim"))];
  S.s.result = { cols: ["sname", "rating"], rows: ROWS.filter((r) => r[2] !== null && r[2] > 8).map((r) => [r[1], r[2]]) };
  S.snap({ line: "q3", note: "rating > 8: 3 pelaut. Dian? NULL > 8 bukan TRUE, bukan FALSE", tone: "alert", dur: 2600 });
  S.s.items = [sail(ROWS, (r) => (r[2] === null ? "err" : "ok"))];
  S.s.result = { cols: ["count"], rows: [[10]] };
  S.snap({ line: ["p1", "p2"], note: "rating > 8 OR rating <= 8 → hanya 10, padahal ada 11 pelaut", tone: "alert", dur: 2600 });
  steps.push(S.take());

  // 3 — logika tiga nilai
  S.s.sql = "logic";
  S.s.items = [T("tv", "Logika tiga nilai", ["Ekspresi", "Hasil"], [["NULL > 8", "UNKNOWN"], ["UNKNOWN OR TRUE", "TRUE"], ["UNKNOWN AND FALSE", "FALSE"], ["UNKNOWN AND TRUE", "UNKNOWN"], ["NOT UNKNOWN", "UNKNOWN"]],
    { state: { 0: "hl", 1: "ok", 2: "err", 3: "hl", 4: "hl" } })];
  S.s.result = null;
  S.snap({ line: ["l1", "l2"], note: "Ada nilai ketiga: UNKNOWN. WHERE hanya meloloskan TRUE", tone: "keep", dur: 2800 });
  steps.push(S.take());

  // 4 — IS NULL
  S.s.sql = "isnull";
  S.s.items = [sail(ROWS, () => "dim")];
  S.s.result = { cols: ["sname"], rows: [] };
  S.snap({ line: ["e1", "e2"], note: "rating = NULL → 0 baris: membandingkan dengan NULL selalu UNKNOWN", tone: "alert", dur: 2400 });
  S.s.items = [sail(ROWS, (r) => (r[2] === null ? "ok" : "dim"))];
  S.s.result = { cols: ["sname"], rows: [["Dian"]] };
  S.snap({ line: ["n1", "n2"], note: "Pakai IS NULL → Dian ditemukan", tone: "done", dur: 2200 });
  steps.push(S.take());

  // 5 — agregat dan NULL
  S.s.sql = "agg";
  S.s.items = [sail(ROWS, (r) => (r[2] === null ? "dim" : "hl"))];
  S.s.result = { cols: ["count", "count(rating)", "avg(rating)"], rows: [[11, 10, "6.6"]] };
  S.snap({ line: "a1", note: "COUNT(*) = 11 · COUNT(rating) = 10 · AVG mengabaikan NULL: 66 ÷ 10", tone: "done", dur: 2800 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 6 — CHECK constraint
  S.s.sql = "check";
  S.s.items = [sail(BASE)];
  S.s.size = 10;
  S.s.result = null;
  S.snap({ line: "ck", note: "CHECK: aturan yang harus dipenuhi setiap baris", dur: 2000 });
  S.s.items = [sail(BASE.concat([[100, "Eko", 11, "30.0"]]), (r) => (r[0] === 100 ? "err" : null))];
  S.s.out = ["!ERROR: new row for relation \"sailors\" violates check constraint", "!  Failing row contains (100, Eko, 11, 30)"];
  S.s.rej = 1;
  S.snap({ line: "ins", note: "Rating 11 melanggar aturan → INSERT ditolak", tone: "alert", dur: 2400 });
  S.s.items = [sail(BASE)];
  S.snap({ line: "ins", note: "Tabel tetap bersih: Eko tidak pernah masuk", tone: "done", dur: 1800 });
  steps.push(S.take());

  // 7 — Trigger
  S.s.sql = "trig";
  S.s.out = [];
  S.s.rej = 0;
  const YS = (rows, state) => T("y", "YoungSailors", COLS, rows, { state });
  S.s.items = [sail(BASE), YS([])];
  S.snap({ line: "t1", note: "Trigger: prosedur yang berjalan sendiri saat data berubah", dur: 2000 });
  const NEW = [[101, "Budi", 5, "17.0"], [102, "Citra", 6, "20.0"]];
  S.s.items = [sail(BASE.concat(NEW), (r) => (r[0] > 100 ? "new" : null)), YS([])];
  S.s.size = 12;
  S.snap({ line: ["do", "ev"], note: "EVENT: ada INSERT ke Sailors → trigger aktif", tone: "keep", dur: 2200 });
  S.s.items = [sail(BASE.concat(NEW), (r) => (r[0] === 101 ? "ok" : r[0] === 102 ? "out" : null)), YS([])];
  S.snap({ line: ["ins", "co"], note: "CONDITION: age <= 18? Budi (17) ya, Citra (20) tidak", dur: 2400 });
  S.s.items = [sail(BASE.concat(NEW), (r) => (r[0] === 101 ? "ok" : null)), YS([NEW[0]], { 0: "ok" })];
  S.s.result = { cols: ["sid", "sname", "rating", "age"], rows: [NEW[0]] };
  S.snap({ line: "ac", note: "ACTION: Budi otomatis disalin ke YoungSailors", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "a1", note: "NULL = tidak diketahui · constraint menolak · trigger bereaksi", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "null-constraint-trigger",
    renderer: "db",
    title: "NULL, Constraint & Trigger",
    subtitle: "Data yang belum diketahui, aturan yang menolak data salah, dan prosedur yang berjalan sendiri setiap kali data berubah.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "NULL dan logika tiga nilai", at: 1 },
      { text: "IS NULL, bukan = NULL", at: 3 },
      { text: "Agregat mengabaikan NULL", at: 4 },
      { text: "CHECK constraint", at: 5 },
      { text: "Trigger: event, condition, action", at: 6 }
    ],
    metrics: [
      { key: "size", label: "Baris di Sailors", icon: "≡" },
      { key: "rows", label: "Baris hasil", icon: "✓" },
      { key: "rej", label: "Ditolak", icon: "⛔" }
    ],
    legend: [
      { color: "#10b981", label: "TRUE / lolos" },
      { color: "#fb7185", label: "UNKNOWN / ditolak" },
      { color: "#6366f1", label: "Baris baru" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "NULL", title: "Data yang belum diketahui",
        text: [
          "Dian baru bergabung dan rating-nya **belum dinilai**. Kolom rating tidak bisa diisi 0, karena 0 juga sebuah nilai.",
          "SQL punya nilai khusus untuk ini: **NULL**, artinya *tidak diketahui* atau *tidak berlaku*. Sekarang Sailors berisi 11 pelaut."
        ],
        changed: [["+", "Dian, rating NULL"], ["~", "Baris 10 → 11"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "NULL > 8", title: "NULL dalam perbandingan",
        text: [
          "`WHERE rating > 8` menghasilkan 3 pelaut. Apakah rating Dian lebih dari 8? Kita **tidak tahu**, jadi Dian tidak ikut.",
          "Yang mengejutkan: `rating > 8 OR rating <= 8` hanya menghitung **10**, bukan 11. Untuk Dian, kedua syarat sama-sama tidak diketahui."
        ],
        changed: [["+", "Hasil 10, bukan 11"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "UNKNOWN", title: "Logika tiga nilai",
        text: [
          "Karena NULL, SQL memakai **logika tiga nilai**: selain TRUE dan FALSE, ada **UNKNOWN**. `NULL > 8` bernilai UNKNOWN.",
          "`UNKNOWN OR TRUE` tetap TRUE, `UNKNOWN AND FALSE` tetap FALSE, sisanya UNKNOWN. Aturan penting dari slide: **WHERE hanya meloloskan baris yang bernilai TRUE**."
        ],
        callout: { type: "ANALOGI", text: "Ditanya \"apakah nilai ujian Dian di atas 80?\" padahal ujiannya belum dikoreksi. Jawaban jujurnya bukan ya atau tidak, melainkan \"belum tahu\"." },
        changed: [["+", "Tabel kebenaran TRUE / FALSE / UNKNOWN"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "IS NULL", title: "IS NULL, bukan = NULL",
        text: [
          "Mencari pelaut tanpa rating dengan `rating = NULL` menghasilkan **0 baris**. Membandingkan apa pun dengan NULL, bahkan NULL sendiri, hasilnya UNKNOWN.",
          "Slide menyebut perlu operator khusus: `IS NULL` dan `IS NOT NULL`. Dengan `IS NULL`, Dian ditemukan."
        ],
        changed: [["+", "= NULL: 0 baris"], ["+", "IS NULL: Dian"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Agregat", title: "Agregat dan NULL",
        text: [
          "`COUNT(*)` menghitung baris: **11**. `COUNT(rating)` hanya menghitung rating yang terisi: **10**.",
          "`AVG(rating)` juga mengabaikan NULL: jumlah rating 66 dibagi **10** orang = **6.6**, bukan dibagi 11."
        ],
        changed: [["+", "11 · 10 · 6.6"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "CHECK", title: "CHECK constraint",
        text: [
          "**Integrity constraint** adalah aturan yang wajib dipenuhi setiap baris. Contoh slide: `CHECK (rating >= 1 AND rating <= 10)`.",
          "Saat ada yang mencoba memasukkan Eko dengan rating 11, database **menolak** INSERT itu. Data salah tidak pernah masuk tabel."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Aturan yang melibatkan beberapa tabel (misalnya jumlah pelaut + kapal < 100) lebih tepat ditulis sebagai `CREATE ASSERTION`, bukan CHECK di satu tabel. CHECK di tabel Sailors tidak diperiksa saat Sailors kosong." },
        changed: [["+", "INSERT rating 11 ditolak"]],
        frames: steps[5]
      },
      {
        kind: "TEKNIK", short: "Trigger", title: "Trigger: event, condition, action",
        text: [
          "**Trigger** adalah prosedur yang **berjalan sendiri** ketika data berubah. Slide menyebut tiga bagian: **event** (pemicu), **condition** (syarat), dan **action** (yang dikerjakan).",
          "Di sini: event = ada INSERT ke Sailors; condition = umurnya ≤ 18; action = salin ke tabel YoungSailors. Saat Budi (17) dan Citra (20) dimasukkan, hanya **Budi** yang otomatis tersalin."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Kode trigger ditulis dalam sintaks SQL Server: tabel sementara `inserted` berisi baris-baris yang baru masuk. Sistem lain (PostgreSQL, MySQL) memakai sintaks berbeda dengan ide yang sama." },
        changed: [["+", "Budi, Citra masuk Sailors"], ["+", "Budi tersalin ke YoungSailors"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["NULL membuat logika perlu ekstra hati-hati; constraint menjaga data tetap benar; trigger membuat database bereaksi otomatis."],
        bullets: [
          "NULL = tidak diketahui atau tidak berlaku.",
          "Perbandingan dengan NULL menghasilkan UNKNOWN; WHERE hanya meloloskan TRUE.",
          "Gunakan IS NULL / IS NOT NULL.",
          "COUNT(kolom), AVG, SUM mengabaikan NULL; COUNT(*) tidak.",
          "CHECK menolak data yang melanggar aturan; trigger = event + condition + action."
        ],
        quiz: [
          { q: "rating bernilai NULL. `WHERE rating > 8` untuk baris itu menghasilkan…", options: ["TRUE", "FALSE", "UNKNOWN, baris tidak ikut", "Error"], answer: 2, why: "Perbandingan dengan NULL bernilai UNKNOWN, dan WHERE hanya meloloskan TRUE." },
          { q: "Cara yang benar mencari baris tanpa rating adalah…", options: ["rating = NULL", "rating IS NULL", "rating = 0", "rating = ''"], answer: 1, why: "= NULL selalu UNKNOWN; gunakan IS NULL." },
          { q: "Tiga bagian sebuah trigger adalah…", options: ["SELECT, FROM, WHERE", "Event, condition, action", "Insert, update, delete", "Key, index, view"], answer: 1, why: "Event memicu, condition memeriksa, action mengerjakan." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Latihan dari slide: **kenapa trigger merespons perubahan pada basis data?** Diskusikan dengan contoh lain, misalnya mencatat log setiap penghapusan data."
  });
})();
