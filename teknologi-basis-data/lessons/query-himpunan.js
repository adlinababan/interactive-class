/* Pelajaran: Query Dasar & Operasi Himpunan (Modul 09 · LO 2)
 * Mengikuti slide "Basic SQL Query", "Find sid's of sailors who've reserved a red or a green boat", "… red and a green boat".
 * Data: instance Sailors (S3), Boats, Reserves dari buku Ramakrishnan & Gehrke. Semua hasil dicocokkan dengan PostgreSQL 16.
 */
(function () {
  const SAILORS = [[22, "Dustin", 7, "45.0"], [29, "Brutus", 1, "33.0"], [31, "Lubber", 8, "55.5"], [32, "Andy", 8, "25.5"], [58, "Rusty", 10, "35.0"],
    [64, "Horatio", 7, "35.0"], [71, "Zorba", 10, "16.0"], [74, "Horatio", 9, "35.0"], [85, "Art", 3, "25.5"], [95, "Bob", 3, "63.5"]];
  const BOATS = [[101, "Interlake", "blue"], [102, "Interlake", "red"], [103, "Clipper", "green"], [104, "Marine", "red"]];
  const RES = [[22, 101, "10/10/98"], [22, 102, "10/10/98"], [22, 103, "10/8/98"], [22, 104, "10/7/98"], [31, 102, "11/10/98"],
    [31, 103, "11/6/98"], [31, 104, "11/12/98"], [64, 101, "9/5/98"], [64, 102, "9/8/98"], [74, 103, "9/8/98"]];
  const color = Object.fromEntries(BOATS.map((b) => [b[0], b[2]]));
  const name = Object.fromEntries(SAILORS.map((s) => [s[0], s[1]]));
  const JOIN = RES.map((r) => [r[0], name[r[0]], r[1], color[r[1]]]);
  const JCOLS = ["S.sid", "S.sname", "R.bid", "B.color"];
  const T = (id, title, cols, rows, extra) => Object.assign({ id, type: "table", title, cols, rows }, extra || {});
  const st = (rows, fn) => Object.fromEntries(rows.map((r, i) => [i, fn(r, i)]).filter((e) => e[1]));
  const sids = (c) => JOIN.filter((r) => r[3] === c).map((r) => [r[0]]);
  const RED = sids("red"), GREEN = sids("green");

  // ---------- kode ----------
  const FROMW = [["f1", "FROM   Sailors S, Boats B, Reserves R"], ["w1", "WHERE  S.sid = R.sid AND R.bid = B.bid"]];
  const PART = (c) => [["s", "SELECT S.sid"], ...FROMW, ["c", "  AND  B.color = '" + c + "'"]];
  const CODE = {
    base: [["s1", "SELECT S.sid"], ...FROMW, ["w2", "  AND  (B.color = 'red' OR B.color = 'green');"]],
    dist: [["+s1", "SELECT DISTINCT S.sid"], ...FROMW, ["w2", "  AND  (B.color = 'red' OR B.color = 'green');"]],
    and: [["s1", "SELECT S.sid"], ...FROMW, ["+w2", "  AND  (B.color = 'red' AND B.color = 'green');"]],
    union: [...PART("red").map(([i, t]) => [i + "a", t]), ["op", "UNION"], ...PART("green").map(([i, t]) => [i + "b", t])],
    inter: [...PART("red").map(([i, t]) => [i + "a", t]), ["op", "INTERSECT"], ...PART("green").map(([i, t]) => [i + "b", t])],
    except: [...PART("red").map(([i, t]) => [i + "a", t]), ["op", "EXCEPT"], ...PART("green").map(([i, t]) => [i + "b", t])]
  };

  const metricsOf = (f) => ({ cand: f.cand, rows: f.result ? f.result.rows.length : undefined });
  const S = DBStory({ items: [], sql: "base", out: [] }, metricsOf);
  const steps = [];
  const tables = () => [T("s", "Sailors", ["sid", "sname", "rating", "age"], SAILORS), T("b", "Boats", ["bid", "bname", "color"], BOATS), T("r", "Reserves", ["sid", "bid", "day"], RES)];

  // 1 — MASALAH
  S.s.items = tables();
  S.snap({ line: ["s1", "f1", "w1", "w2"], note: "Siapa yang pernah menyewa kapal merah atau hijau?", dur: 2400 });
  steps.push(S.take());

  // 2 — FROM lalu WHERE (join)
  S.s.items = [{ id: "x", type: "badge", title: "FROM: semua kombinasi", value: "10 × 4 × 10 = 400", unit: "pasangan baris", tone: "warn" }];
  S.s.cand = 400;
  S.snap({ line: "f1", note: "FROM 3 tabel: setiap baris dipasangkan dengan semua baris lain", tone: "keep", dur: 2400 });
  S.s.items = [{ id: "x", type: "badge", title: "FROM: semua kombinasi", value: "400", unit: "pasangan baris", tone: "warn" }, { id: "fl", type: "flow", text: "WHERE sid = sid AND bid = bid →" }, T("j", "Pasangan yang cocok", JCOLS, JOIN)];
  S.s.cand = 10;
  S.snap({ line: "w1", note: "Syarat join menyisakan 10 pasangan yang benar-benar terkait", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 3 — WHERE warna
  const OUT_BLUE = st(JOIN, (r) => (r[3] === "blue" ? "out" : "hl"));
  S.s.items = [T("j", "Pasangan yang cocok", JCOLS, JOIN, { state: OUT_BLUE })];
  S.s.cand = 8;
  S.snap({ line: "w2", note: "Kapal biru (101) dicoret: tersisa 8 baris", dur: 2400 });
  steps.push(S.take());

  // 4 — SELECT & DISTINCT
  const PROJ = JOIN.filter((r) => r[3] !== "blue").map((r) => [r[0]]);
  S.s.result = { cols: ["sid"], rows: PROJ };
  S.snap({ line: "s1", note: "SELECT S.sid: 8 baris, ada yang kembar (22 tiga kali)", tone: "alert", dur: 2400 });
  S.s.sql = "dist";
  S.s.result = { cols: ["sid"], rows: [[22], [31], [64], [74]] };
  S.snap({ line: "s1", note: "DISTINCT membuang duplikat: 22, 31, 64, 74", tone: "done", dur: 2400 });
  steps.push(S.take());

  // 5 — SOLUSI: UNION
  S.s.sql = "union";
  S.s.cand = undefined;
  S.s.items = [T("red", "Penyewa kapal merah", ["sid"], RED, { state: st(RED, () => "hl") }), { id: "op", type: "flow", text: "UNION" }, T("green", "Penyewa kapal hijau", ["sid"], GREEN, { state: st(GREEN, () => "ok") })];
  S.s.result = null;
  S.snap({ line: ["sa", "ca", "sb", "cb"], note: "Dua query terpisah: merah dan hijau", dur: 2200 });
  S.s.result = { cols: ["sid"], rows: [[22], [31], [64], [74]] };
  S.snap({ line: "op", note: "UNION menggabungkan keduanya dan membuang duplikat", tone: "done", dur: 2400 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 6 — KASUS: OR diganti AND
  S.s.sql = "and";
  S.s.items = [T("j", "Pasangan yang cocok", JCOLS, JOIN, { state: st(JOIN, () => "out") })];
  S.s.result = { cols: ["sid"], rows: [] };
  S.snap({ line: "w2", note: "AND pada kapal yang sama: tidak ada kapal yang merah sekaligus hijau", tone: "alert", dur: 2600 });
  steps.push(S.take());

  // 7 — INTERSECT
  S.s.sql = "inter";
  S.s.items = [T("red", "Penyewa kapal merah", ["sid"], RED, { state: st(RED, (r) => (r[0] === 22 || r[0] === 31 ? "ok" : "dim")) }), { id: "op", type: "flow", text: "INTERSECT" }, T("green", "Penyewa kapal hijau", ["sid"], GREEN, { state: st(GREEN, (r) => (r[0] === 22 || r[0] === 31 ? "ok" : "dim")) })];
  S.s.result = { cols: ["sid"], rows: [[22], [31]] };
  S.snap({ line: "op", note: "INTERSECT: yang ada di kedua daftar → 22 dan 31", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 8 — EXCEPT
  S.s.sql = "except";
  S.s.items = [T("red", "Penyewa kapal merah", ["sid"], RED, { state: st(RED, (r) => (r[0] === 64 ? "ok" : "out")) }), { id: "op", type: "flow", text: "EXCEPT" }, T("green", "Penyewa kapal hijau", ["sid"], GREEN, { state: st(GREEN, () => "dim") })];
  S.s.result = { cols: ["sid"], rows: [[64]] };
  S.snap({ line: "op", note: "EXCEPT: menyewa merah tetapi tidak pernah hijau → 64", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "op", note: "FROM → WHERE → SELECT, lalu gabungkan hasilnya seperti himpunan", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "query-himpunan",
    renderer: "db",
    title: "Query Dasar & Operasi Himpunan",
    subtitle: "Ikuti bagaimana database menjawab \"siapa yang menyewa kapal merah atau hijau\": gabung tabel, saring baris, ambil kolom, lalu gabungkan hasil seperti himpunan.",
    minutes: 15,
    level: "Pemula",
    lo: "LO 2",
    learn: [
      { text: "Urutan kerja: FROM → WHERE → SELECT", at: 1 },
      { text: "Duplikat dan DISTINCT", at: 3 },
      { text: "UNION: gabungan", at: 4 },
      { text: "Jebakan AND pada baris yang sama", at: 5 },
      { text: "INTERSECT dan EXCEPT", at: 6 }
    ],
    metrics: [
      { key: "cand", label: "Baris kandidat", icon: "≡" },
      { key: "rows", label: "Baris hasil", icon: "✓" }
    ],
    legend: [
      { color: "#f59e0b", label: "Dipertimbangkan" },
      { color: "#10b981", label: "Masuk hasil" },
      { color: "#fb7185", label: "Dicoret" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Pertanyaan", title: "Siapa yang menyewa kapal merah atau hijau?",
        text: [
          "Ada tiga tabel: **Sailors** (pelaut), **Boats** (kapal), dan **Reserves** (catatan penyewaan: pelaut mana menyewa kapal mana).",
          "Pertanyaannya: siapa saja (sid) yang pernah menyewa kapal berwarna **merah atau hijau**? Jawabannya tidak ada di satu tabel saja, jadi ketiga tabel harus dihubungkan."
        ],
        changed: [["+", "Sailors 10 · Boats 4 · Reserves 10 baris"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "FROM & join", title: "FROM dulu, lalu WHERE",
        text: [
          "Walau ditulis paling atas, `SELECT` dikerjakan belakangan. Secara konsep, database mulai dari **FROM**: memasangkan setiap baris dari ketiga tabel, 10 × 4 × 10 = **400 pasangan**.",
          "Lalu **WHERE** `S.sid = R.sid AND R.bid = B.bid` hanya menyimpan pasangan yang memang berhubungan. Tersisa **10 baris**, satu untuk setiap penyewaan."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Ini urutan konseptual untuk memahami arti query. Optimizer di database asli memakai cara yang jauh lebih hemat, hasilnya tetap sama." },
        changed: [["+", "400 kombinasi"], ["~", "Baris kandidat 400 → 10"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Saring warna", title: "Saring warna kapal",
        text: [
          "Syarat berikutnya: `B.color = 'red' OR B.color = 'green'`. Dua baris dengan kapal biru (101) **dicoret**.",
          "Tersisa 8 baris penyewaan kapal merah atau hijau."
        ],
        changed: [["~", "Baris kandidat 10 → 8"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "DISTINCT", title: "SELECT dan DISTINCT",
        text: [
          "`SELECT S.sid` hanya mengambil kolom sid. Hasilnya 8 baris dan ada yang **kembar**: Dustin (22) menyewa tiga kapal merah/hijau, jadi 22 muncul tiga kali.",
          "Slide mengingatkan: SQL **tidak** membuang duplikat secara default. Tambahkan `DISTINCT` agar setiap sid muncul sekali: **22, 31, 64, 74**."
        ],
        changed: [["+", "8 baris dengan duplikat"], ["~", "DISTINCT: 8 → 4 baris"]],
        frames: steps[3]
      },
      {
        kind: "SOLUSI", short: "UNION", title: "Cara lain: UNION",
        text: [
          "Pertanyaan yang sama bisa dipecah: query pertama mencari penyewa kapal **merah**, query kedua mencari penyewa kapal **hijau**. Lalu digabung dengan `UNION`.",
          "`UNION` bekerja seperti gabungan himpunan, dan **otomatis membuang duplikat**. Hasilnya sama: 22, 31, 64, 74."
        ],
        callout: { type: "ANALOGI", text: "Dua daftar tamu digabung jadi satu daftar tanpa nama ganda." },
        changed: [["+", "Daftar merah: 22, 22, 31, 31, 64"], ["+", "Daftar hijau: 22, 31, 74"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "AND", title: "Kasus: OR diganti AND",
        text: [
          "Bagaimana mencari yang menyewa **merah dan hijau**? Kalau di query pertama `OR` diganti `AND`, hasilnya **kosong**.",
          "Sebabnya, `B.color = 'red' AND B.color = 'green'` diperiksa pada **satu baris** yang sama, dan tidak ada satu kapal pun yang berwarna merah sekaligus hijau."
        ],
        changed: [["~", "Hasil: 0 baris"]],
        frames: steps[5]
      },
      {
        kind: "TEKNIK", short: "INTERSECT", title: "INTERSECT: ada di keduanya",
        text: [
          "Solusinya: `INTERSECT`, yaitu irisan dua daftar. Hanya sid yang ada di daftar merah **dan** daftar hijau yang lolos.",
          "Hasilnya **22 dan 31**. Perhatikan betapa mirip bentuk query UNION dan INTERSECT; hanya satu kata yang berbeda."
        ],
        changed: [["+", "Hasil: 22, 31"]],
        frames: steps[6]
      },
      {
        kind: "TEKNIK", short: "EXCEPT", title: "EXCEPT: ada di yang pertama saja",
        text: [
          "`EXCEPT` mengambil yang ada di daftar pertama tetapi **tidak** ada di daftar kedua.",
          "Penyewa kapal merah yang tidak pernah menyewa kapal hijau hanya **64**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Ketiga operasi ini butuh dua query yang **union-compatible**: jumlah kolom sama dan tipe datanya cocok." },
        changed: [["+", "Hasil: 64"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Baca query sesuai urutan kerjanya, bukan urutan tulisannya, lalu gunakan operasi himpunan untuk menggabungkan dua hasil."],
        bullets: [
          "Urutan konsep: FROM (gabung) → WHERE (saring) → SELECT (ambil kolom).",
          "Duplikat tidak dibuang kecuali memakai DISTINCT.",
          "UNION = gabungan, INTERSECT = irisan, EXCEPT = selisih.",
          "UNION, INTERSECT, EXCEPT membuang duplikat.",
          "AND pada satu baris berbeda dengan \"menyewa keduanya\"."
        ],
        quiz: [
          { q: "Bagian query yang secara konsep dikerjakan pertama adalah…", options: ["SELECT", "FROM", "WHERE", "DISTINCT"], answer: 1, why: "FROM menentukan baris dari tabel mana yang diproses." },
          { q: "Mencari pelaut yang menyewa kapal merah DAN hijau paling tepat dengan…", options: ["OR", "AND pada baris yang sama", "INTERSECT", "UNION"], answer: 2, why: "INTERSECT mengambil sid yang ada di kedua daftar." },
          { q: "Daftar merah {22, 31, 64}, daftar hijau {22, 31, 74}. Hasil merah EXCEPT hijau?", options: ["{74}", "{22, 31}", "{64}", "{22, 31, 64, 74}"], answer: 2, why: "Hanya 64 yang ada di daftar merah tetapi tidak di daftar hijau." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "Pelajaran berikutnya: **Nested Query**, yaitu query di dalam query."
  });
})();
