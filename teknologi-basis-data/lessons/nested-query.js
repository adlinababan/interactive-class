/* Pelajaran: Nested Query (Modul 09 · LO 2)
 * Mengikuti slide "Nested Queries", "Nested Queries with Correlation", "More on Set-Comparison Operators",
 * "Rewriting INTERSECT Queries Using IN". Data: Sailors (S3), Boats, Reserves dari buku Ramakrishnan & Gehrke.
 * Semua hasil dicocokkan dengan PostgreSQL 16.
 */
(function () {
  const SAILORS = [[22, "Dustin", 7, "45.0"], [29, "Brutus", 1, "33.0"], [31, "Lubber", 8, "55.5"], [32, "Andy", 8, "25.5"], [58, "Rusty", 10, "35.0"],
    [64, "Horatio", 7, "35.0"], [71, "Zorba", 10, "16.0"], [74, "Horatio", 9, "35.0"], [85, "Art", 3, "25.5"], [95, "Bob", 3, "63.5"]];
  const RES = [[22, 101], [22, 102], [22, 103], [22, 104], [31, 102], [31, 103], [31, 104], [64, 101], [64, 102], [74, 103]];
  const SCOLS = ["sid", "sname", "rating", "age"];
  const T = (id, title, cols, rows, extra) => Object.assign({ id, type: "table", title, cols, rows }, extra || {});
  const st = (rows, fn) => Object.fromEntries(rows.map((r, i) => [i, fn(r, i)]).filter((e) => e[1]));
  const B103 = [22, 31, 74];
  const sail = (fn, title) => T("s", title || "Sailors S", SCOLS, SAILORS, { state: fn ? st(SAILORS, fn) : undefined });
  const res = (fn) => T("r", "Reserves R", ["sid", "bid"], RES, { state: fn ? st(RES, fn) : undefined });
  const names = (fn) => SAILORS.filter(fn).map((s) => [s[1]]);

  // ---------- kode ----------
  const CODE = {
    in: [["o1", "SELECT S.sname"], ["o2", "FROM   Sailors S"], ["o3", "WHERE  S.sid IN (SELECT R.sid"], ["i1", "                  FROM   Reserves R"], ["i2", "                  WHERE  R.bid = 103);"]],
    notin: [["o1", "SELECT S.sname"], ["o2", "FROM   Sailors S"], ["+o3", "WHERE  S.sid NOT IN (SELECT R.sid"], ["i1", "                      FROM   Reserves R"], ["i2", "                      WHERE  R.bid = 103);"]],
    exists: [["o1", "SELECT S.sname"], ["o2", "FROM   Sailors S"], ["o3", "WHERE  EXISTS (SELECT *"], ["i1", "                FROM   Reserves R"], ["i2", "                WHERE  R.bid = 103 AND S.sid = R.sid);"]],
    any: [["o1", "SELECT *"], ["o2", "FROM   Sailors S"], ["o3", "WHERE  S.rating > ANY (SELECT S2.rating"], ["i1", "                        FROM   Sailors S2"], ["i2", "                        WHERE  S2.sname = 'Horatio');"]],
    all: [["o1", "SELECT *"], ["o2", "FROM   Sailors S"], ["+o3", "WHERE  S.rating > ALL (SELECT S2.rating"], ["i1", "                        FROM   Sailors S2"], ["i2", "                        WHERE  S2.sname = 'Horatio');"]],
    inter: [["o1", "SELECT S.sid"], ["o2", "FROM   Sailors S, Boats B, Reserves R"], ["o3", "WHERE  S.sid = R.sid AND R.bid = B.bid AND B.color = 'red'"],
      ["o4", "  AND  S.sid IN (SELECT S2.sid"], ["i1", "                  FROM   Sailors S2, Boats B2, Reserves R2"], ["i2", "                  WHERE  S2.sid = R2.sid AND R2.bid = B2.bid"], ["i3", "                    AND  B2.color = 'green');"]]
  };

  const metricsOf = (f) => ({ sub: f.subRuns, rows: f.result ? f.result.rows.length : undefined });
  const S = DBStory({ items: [], sql: "in", out: [] }, metricsOf);
  const steps = [];

  // 1 — MASALAH
  S.s.items = [sail(), res()];
  S.snap({ line: ["o1", "o2"], note: "Siapa nama pelaut yang pernah menyewa kapal 103?", dur: 2200 });
  steps.push(S.take());

  // 2 — subquery dikerjakan dulu
  S.s.items = [sail(), res((r) => (r[1] === 103 ? "ok" : "dim"))];
  S.snap({ line: ["i1", "i2"], note: "Query dalam (subquery): sid yang menyewa kapal 103", dur: 2000 });
  S.s.items = [sail(), res((r) => (r[1] === 103 ? "ok" : "dim")), { id: "fl", type: "flow", text: "→" }, T("set", "Hasil subquery", ["sid"], B103.map((x) => [x]), { state: { 0: "ok", 1: "ok", 2: "ok" } })];
  S.s.subRuns = 1;
  S.snap({ line: "i2", note: "Hasilnya sebuah daftar: {22, 31, 74}", tone: "done", dur: 2200 });
  steps.push(S.take());

  // 3 — SOLUSI: IN
  S.s.items = [sail((s) => (B103.includes(s[0]) ? "ok" : "dim")), T("set", "Hasil subquery", ["sid"], B103.map((x) => [x]), { state: { 0: "ok", 1: "ok", 2: "ok" } })];
  S.s.result = { cols: ["sname"], rows: names((s) => B103.includes(s[0])) };
  S.snap({ line: "o3", note: "IN: ambil pelaut yang sid-nya ada di daftar", tone: "done", dur: 2600 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 4 — KASUS: NOT IN
  S.s.sql = "notin";
  S.s.items = [sail((s) => (B103.includes(s[0]) ? "out" : "ok")), T("set", "Hasil subquery", ["sid"], B103.map((x) => [x]), { state: { 0: "err", 1: "err", 2: "err" } })];
  S.s.result = { cols: ["sname"], rows: names((s) => !B103.includes(s[0])), state: { 3: "ok" } };
  S.snap({ line: "o3", note: "NOT IN: 7 pelaut. Horatio muncul lagi? Itu sid 64, orang yang berbeda", tone: "keep", dur: 2800 });
  steps.push(S.take());

  // 5 — EXISTS berkorelasi
  S.s.sql = "exists";
  S.s.result = { cols: ["sname"], rows: [] };
  S.s.subRuns = 0;
  const ex = (sid, k) => {
    const found = RES.some((r) => r[0] === sid && r[1] === 103);
    S.s.items = [sail((s) => (s[0] === sid ? (found ? "ok" : "err") : SAILORS.findIndex((x) => x[0] === s[0]) < k ? (B103.includes(s[0]) ? "ok" : "out") : null)),
      res((r) => (r[0] === sid ? (r[1] === 103 ? "ok" : "hl") : "dim"))];
    S.s.subRuns = k + 1;
    if (found) S.s.result = { cols: ["sname"], rows: S.s.result.rows.concat([[SAILORS[k][1]]]) };
    S.snap({ line: "i2", note: "Baris sid " + sid + ": subquery dijalankan → " + (found ? "ada → TRUE" : "kosong → FALSE"), tone: found ? "done" : "alert", dur: 1900 });
  };
  ex(22, 0); ex(29, 1); ex(31, 2);
  S.s.items = [sail((s) => (B103.includes(s[0]) ? "ok" : "out")), res((r) => (r[1] === 103 ? "ok" : "dim"))];
  S.s.subRuns = 10;
  S.s.result = { cols: ["sname"], rows: names((s) => B103.includes(s[0])) };
  S.snap({ line: "o3", note: "Diulang untuk 10 pelaut: subquery dijalankan 10 kali", tone: "done", dur: 2400 });
  steps.push(S.take());

  // 6 — ANY
  S.s.sql = "any";
  S.s.subRuns = 1;
  const HOR = st(SAILORS, (s) => (s[1] === "Horatio" ? "hl" : null));
  S.s.items = [sail((s) => (s[1] === "Horatio" ? "hl" : null), "Sailors S2"), { id: "fl", type: "flow", text: "rating Horatio = {7, 9}" }];
  S.s.result = null;
  S.snap({ line: ["i1", "i2"], note: "Ada dua Horatio: rating 7 dan 9", dur: 2000 });
  S.s.items = [sail((s) => (s[2] > 7 ? "ok" : "dim")), { id: "fl", type: "flow", text: "> ANY {7, 9}  ⇔  > 7" }];
  S.s.result = { cols: ["sid", "sname", "rating"], rows: SAILORS.filter((s) => s[2] > 7).map((s) => s.slice(0, 3)) };
  S.snap({ line: "o3", note: "> ANY: cukup lebih besar dari SALAH SATU nilai → rating > 7", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 7 — KASUS: ALL
  S.s.sql = "all";
  S.s.items = [sail((s) => (s[2] > 9 ? "ok" : "dim")), { id: "fl", type: "flow", text: "> ALL {7, 9}  ⇔  > 9" }];
  S.s.result = { cols: ["sid", "sname", "rating"], rows: SAILORS.filter((s) => s[2] > 9).map((s) => s.slice(0, 3)) };
  S.snap({ line: "o3", note: "> ALL: harus lebih besar dari SEMUA nilai → rating > 9", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 8 — KASUS: INTERSECT ditulis dengan IN
  S.s.sql = "inter";
  S.s.items = [T("red", "Penyewaan kapal merah", ["sid"], [[22], [22], [31], [31], [64]], { state: { 0: "hl", 1: "hl", 2: "hl", 3: "hl", 4: "out" } }), { id: "fl", type: "flow", text: "sid IN {22, 31, 74}" }];
  S.s.result = { cols: ["sid"], rows: [[22], [22], [31], [31]], state: { 1: "ok", 3: "ok" } };
  S.snap({ line: ["o4", "i3"], note: "Hasil 22, 22, 31, 31: berbeda dengan INTERSECT, duplikat tidak dibuang", tone: "keep", dur: 2800 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "o3", note: "Query di dalam query: hasil dalam dipakai oleh query luar", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "nested-query",
    renderer: "db",
    title: "Nested Query: Query di Dalam Query",
    subtitle: "WHERE boleh berisi query lain. Lihat bagaimana hasil query dalam dipakai query luar, dan kenapa subquery berkorelasi dijalankan berulang kali.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 2",
    learn: [
      { text: "Subquery dan operator IN", at: 1 },
      { text: "NOT IN", at: 3 },
      { text: "EXISTS dan subquery berkorelasi", at: 4 },
      { text: "Perbandingan dengan ANY dan ALL", at: 5 },
      { text: "Menulis ulang INTERSECT dengan IN", at: 7 }
    ],
    metrics: [
      { key: "sub", label: "Subquery dijalankan", icon: "↻" },
      { key: "rows", label: "Baris hasil", icon: "✓" }
    ],
    legend: [
      { color: "#10b981", label: "Memenuhi" },
      { color: "#f59e0b", label: "Sedang diperiksa" },
      { color: "#fb7185", label: "Tidak memenuhi" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Kapal 103", title: "Siapa yang menyewa kapal 103?",
        text: [
          "Nama pelaut ada di tabel **Sailors**, sedangkan siapa menyewa kapal apa ada di tabel **Reserves**.",
          "Kita bisa menjawabnya dengan join seperti pelajaran sebelumnya. Kali ini kita pakai cara lain: **query di dalam query** (*nested query* atau *subquery*)."
        ],
        changed: [["+", "Sailors dan Reserves"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Subquery", title: "Kerjakan query dalam dulu",
        text: [
          "Bagian di dalam kurung, `SELECT R.sid FROM Reserves R WHERE R.bid = 103`, adalah **subquery**.",
          "Subquery ini berdiri sendiri, jadi bisa dikerjakan lebih dulu. Hasilnya sebuah daftar sid: **{22, 31, 74}**."
        ],
        changed: [["+", "Hasil subquery: {22, 31, 74}"]],
        frames: steps[1]
      },
      {
        kind: "SOLUSI", short: "IN", title: "IN: cocokkan dengan daftar",
        text: [
          "`WHERE S.sid IN (…)` memeriksa setiap pelaut: apakah sid-nya ada di daftar {22, 31, 74}?",
          "Yang lolos: **Dustin, Lubber, Horatio**. Slide menyebut fitur ini sangat kuat: WHERE (juga FROM dan HAVING) boleh berisi query SQL lain."
        ],
        callout: { type: "ANALOGI", text: "Satpam memegang daftar tamu (hasil subquery) dan memeriksa setiap orang di pintu: namanya ada di daftar atau tidak?" },
        changed: [["+", "Hasil: 3 nama"]],
        frames: steps[2]
      },
      {
        kind: "KASUS", short: "NOT IN", title: "Kasus: NOT IN",
        text: [
          "`NOT IN` membalik logikanya: ambil pelaut yang sid-nya **tidak** ada di daftar. Hasilnya 7 nama.",
          "Nama Horatio muncul di kedua hasil. Bukan salah: ada **dua Horatio** dengan sid berbeda (64 dan 74). Inilah kenapa kita membandingkan **sid** (kunci), bukan nama."
        ],
        changed: [["+", "Hasil: 7 nama"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "EXISTS", title: "EXISTS: subquery berkorelasi",
        text: [
          "Di versi `EXISTS`, subquery memakai `S.sid` dari query luar. Subquery seperti ini disebut **berkorelasi**: hasilnya bergantung pada baris luar yang sedang diperiksa.",
          "Karena itu subquery dijalankan **ulang untuk setiap pelaut**: untuk 22 ada baris → TRUE, untuk 29 kosong → FALSE, dan seterusnya. Total 10 kali, sesuai jumlah pelaut."
        ],
        callout: { type: "IDE KUNCI", text: "EXISTS hanya bertanya \"ada isinya atau tidak?\". Kolom yang dipilih subquery (`SELECT *`) tidak penting." },
        changed: [["~", "Subquery dijalankan 1 → 10 kali"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "ANY", title: "Perbandingan dengan ANY",
        text: [
          "Cari pelaut yang rating-nya lebih tinggi dari **salah satu** pelaut bernama Horatio. Subquery mengembalikan rating Horatio: {7, 9}.",
          "`> ANY {7, 9}` berarti cukup lebih besar dari salah satunya, sama dengan **> 7**. Hasilnya 5 pelaut dengan rating 8, 9, dan 10."
        ],
        changed: [["+", "Hasil: 5 pelaut"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "ALL", title: "Kasus: ALL",
        text: [
          "Ganti `ANY` dengan `ALL`: rating harus lebih besar dari **semua** rating Horatio, yaitu > 9.",
          "Hanya **Rusty dan Zorba** (rating 10) yang lolos."
        ],
        changed: [["~", "Hasil: 5 → 2 pelaut"]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "IN ≠ INTERSECT", title: "Kasus: INTERSECT ditulis dengan IN",
        text: [
          "Slide menunjukkan INTERSECT (menyewa merah **dan** hijau) bisa ditulis ulang: penyewa merah yang sid-nya `IN` daftar penyewa hijau.",
          "Hasilnya **22, 22, 31, 31**: isinya benar, tetapi ada duplikat, karena tiap penyewaan merah menghasilkan satu baris. INTERSECT otomatis membuang duplikat; versi IN perlu `SELECT DISTINCT`."
        ],
        changed: [["+", "Hasil: 22, 22, 31, 31"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Nested query memecah pertanyaan sulit menjadi dua: pertanyaan dalam menghasilkan daftar atau nilai, pertanyaan luar memakainya."],
        bullets: [
          "IN / NOT IN: apakah nilai ada di daftar hasil subquery.",
          "EXISTS: apakah subquery punya isi; biasanya berkorelasi.",
          "Subquery berkorelasi dijalankan ulang untuk setiap baris luar.",
          "> ANY: lebih besar dari salah satu; > ALL: lebih besar dari semua.",
          "IN tidak membuang duplikat seperti INTERSECT."
        ],
        quiz: [
          { q: "Subquery yang memakai kolom dari query luar disebut…", options: ["Subquery bebas", "Subquery berkorelasi", "UNION", "Agregat"], answer: 1, why: "Hasilnya bergantung pada baris luar, jadi dijalankan ulang untuk setiap baris." },
          { q: "Rating Horatio {7, 9}. `rating > ALL (...)` sama dengan…", options: ["rating > 7", "rating > 9", "rating > 8", "rating = 9"], answer: 1, why: "Harus lebih besar dari semua nilai, termasuk 9." },
          { q: "Kenapa nama Horatio muncul di hasil IN dan NOT IN?", options: ["Bug SQL", "Ada dua Horatio dengan sid berbeda", "NOT IN salah", "Data ganda"], answer: 1, why: "sid 74 menyewa kapal 103, sid 64 tidak." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "Pelajaran berikutnya: **Agregasi, GROUP BY & HAVING**."
  });
})();
