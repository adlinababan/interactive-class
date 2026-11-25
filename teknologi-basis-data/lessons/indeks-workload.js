/* Pelajaran: Indeks & Workload (Modul 08 · LO 2)
 * Mengikuti slide "Physical Database Design and Tuning": workload, ISUD chart, index selection, trade-off.
 * Angka halaman diukur di PostgreSQL 16 (EXPLAIN ANALYZE BUFFERS) pada tabel Emp 100.000 baris = 830 halaman.
 * Frekuensi workload adalah ilustrasi. Waktu INSERT = median 5 kali percobaan di mesin uji.
 */
(function () {
  const N = 83, SCALE = 10, PAGE_4242 = 26;           // 830 halaman → 83 kotak; eid 4242 ada di halaman 264
  const ALL = Array.from({ length: N }, (_, i) => i);
  const pages = (read, extra) => Object.assign({ id: "pages", type: "pages", title: "Tabel Emp di disk", cap: "100.000 baris · 830 halaman", n: N, cols: 14, scale: SCALE, total: 830, read }, extra || {});
  const TREE = {
    id: "tree", type: "tree", title: "Indeks B+ tree emp_eid", cap: "276 halaman",
    levels: [
      [{ id: "root", keys: ["akar", "menunjuk 274 daun"] }],
      [{ id: "l1", keys: ["daun 1"], parent: "root" }, { id: "l2", keys: ["…"], parent: "root" }, { id: "l3", keys: ["eid 4242 → hlm 264"], parent: "root" }, { id: "l4", keys: ["…"], parent: "root" }, { id: "l5", keys: ["daun 274"], parent: "root" }]
    ]
  };
  const WORK = {
    id: "work", type: "bars", title: "Workload harian (ISUD)", cap: "ilustrasi", unit: "×/hari",
    items: [
      { label: "Q1 SELECT per eid", value: 5000 },
      { label: "Q2 SELECT dept Toy", value: 50 },
      { label: "U1 INSERT karyawan", value: 200, tone: "warn" },
      { label: "U2 UPDATE gaji", value: 100, tone: "warn" },
      { label: "U3 DELETE karyawan", value: 5, tone: "warn" }
    ]
  };
  const badge = (v, tone) => ({ id: "badge", type: "badge", title: "Halaman dibaca", value: v, unit: "halaman", tone });

  // ---------- kode ----------
  const QUERY = [["q1", "SELECT *"], ["q2", "FROM   Emp"], ["q3", "WHERE  eid = 4242;"]];
  const CODE = {
    scan: [["", "-- Emp: 100.000 karyawan, belum ada indeks"], ...QUERY],
    isud: [
      ["w1", "-- Q1  5.000×/hari: cari satu karyawan"],
      ["w1", "SELECT * FROM Emp WHERE eid = ?;"],
      ["w2", "-- Q2  50×/hari: karyawan departemen 'Toy'"],
      ["w2", "SELECT E.ename, D.mgr FROM Emp E, Dept D"],
      ["w2", "WHERE  E.dno = D.dno AND D.dname = 'Toy';"],
      ["w3", "-- U1  200×/hari: karyawan baru"],
      ["w3", "INSERT INTO Emp VALUES (...);"],
      ["w4", "-- U2  100×/hari: naik gaji"],
      ["w4", "UPDATE Emp SET sal = sal * 1.1 WHERE eid = ?;"]
    ],
    idx: [["+mk", "CREATE INDEX emp_eid ON Emp(eid);"], ["", ""], ...QUERY],
    ins: [
      ["", "-- Salin 100.000 baris ke tabel kosong"],
      ["i0", "INSERT INTO Emp_copy SELECT * FROM Emp;"],
      ["", ""],
      ["i1", "-- percobaan 2: Emp_copy punya 1 indeks (eid)"],
      ["i4", "-- percobaan 3: 4 indeks (eid, age, sal, dno)"]
    ],
    pilih: [
      ["c1", "-- Kandidat kunci indeks = kolom di WHERE"],
      ["c2", "WHERE eid = ?            -- Q1 → indeks Emp(eid)"],
      ["c3", "WHERE D.dname = 'Toy'    -- Q2 → indeks Dept(dname)"],
      ["c4", "  AND E.dno = D.dno      -- Q2 → indeks Emp(dno)"],
      ["c5", "UPDATE ... WHERE eid = ? -- U2 juga terbantu Emp(eid)"]
    ]
  };

  // ---------- metrik ----------
  const metricsOf = (f) => ({ pages: f.pg, idx: f.nidx || 0, ins: f.ins });

  const S = DBStory({ items: [], sql: "scan", out: [], nidx: 0 }, metricsOf);
  const steps = [];

  // 1 — MASALAH: full scan
  S.s.items = [pages([])];
  S.snap({ line: ["q1", "q2", "q3"], note: "Cari 1 karyawan dari 100.000", dur: 1500 });
  S.s.items = [pages(ALL, { hit: [PAGE_4242], count: 830 }), badge(830, "bad")];
  S.s.pg = 830;
  S.s.out = ["#Seq Scan on emp", "#  Rows Removed by Filter: 99999", "#  Buffers: shared hit=830"];
  S.snap({ line: "q3", note: "Tanpa indeks: semua 830 halaman dibaca", tone: "alert", dur: 2600 });
  S.s.result = { cols: ["eid", "ename", "age", "sal", "hobby", "dno"], rows: [[4242, "Emp4242", 53, 9300, "Gaming", 21]] };
  S.snap({ line: "q3", note: "Hasilnya hanya 1 baris dari halaman 264", tone: "alert", dur: 2000 });
  steps.push(S.take());

  // 2 — workload / ISUD
  S.s.sql = "isud";
  S.s.items = [WORK];
  S.s.out = []; delete S.s.result;
  S.snap({ line: "w1", note: "Kenali workload: query apa yang paling sering?", dur: 2400 });
  S.snap({ line: ["w3", "w4"], note: "INSERT dan UPDATE juga dihitung", tone: "keep", dur: 2000 });
  steps.push(S.take());

  // 3 — indeks B+ tree
  S.s.sql = "idx";
  S.s.items = [TREE, pages([])];
  S.s.nidx = 1;
  S.snap({ line: "mk", note: "CREATE INDEX: daftar eid yang terurut + alamat halamannya", dur: 2400 });
  steps.push(S.take());

  // 4 — SOLUSI
  S.s.items = [Object.assign({}, TREE, { path: ["root", "l3"], hit: "l3" }), pages([PAGE_4242], { hit: [PAGE_4242], count: 1 }), badge(3, "ok")];
  S.s.pg = 3;
  S.s.out = ["#Index Scan using emp_eid on emp", "#  Index Cond: (eid = 4242)", "#  Buffers: shared hit=1 read=2"];
  S.s.result = { cols: ["eid", "ename", "age", "sal", "hobby", "dno"], rows: [[4242, "Emp4242", 53, 9300, "Gaming", 21]] };
  S.snap({ line: "q3", note: "Akar → daun → 1 halaman tabel = 3 halaman", tone: "done", dur: 2800 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 5 — KASUS: harga sebuah indeks
  S.s.sql = "ins";
  S.s.out = []; delete S.s.result;
  const INS = { id: "ins", type: "bars", title: "Waktu INSERT 100.000 baris", cap: "PostgreSQL 16, median 5×", unit: "ms", max: 460, items: [{ label: "tanpa indeks", value: 55, tone: "ok" }] };
  const SIZE = { id: "size", type: "bars", title: "Ruang disk untuk indeks", unit: "halaman", max: 600, items: [{ label: "tanpa indeks", value: 0, tone: "ok" }] };
  S.s.items = [INS, SIZE];
  S.s.ins = 55; S.s.nidx = 0; S.s.pg = undefined;
  S.snap({ line: "i0", note: "Tanpa indeks: ±55 ms", dur: 1800 });
  INS.items.push({ label: "1 indeks", value: 173, tone: "warn" }); SIZE.items.push({ label: "1 indeks", value: 314, tone: "warn" });
  S.s.items = [INS, SIZE]; S.s.ins = 173; S.s.nidx = 1;
  S.snap({ line: "i1", note: "1 indeks: ±173 ms, karena indeks juga harus diisi", tone: "keep", dur: 2200 });
  INS.items.push({ label: "4 indeks", value: 455, tone: "bad" }); SIZE.items.push({ label: "4 indeks", value: 599, tone: "bad" });
  S.s.items = [INS, SIZE]; S.s.ins = 455; S.s.nidx = 4;
  S.snap({ line: "i4", note: "4 indeks: ±455 ms dan 599 halaman ekstra", tone: "alert", dur: 2400 });
  steps.push(S.take());

  // 6 — KASUS: memilih indeks
  S.s.sql = "pilih";
  S.s.items = [{ id: "cand", type: "table", title: "Rencana indeks", cols: ["Query", "Kolom di WHERE", "Indeks", "Frekuensi"],
    rows: [["Q1", "eid", "Emp(eid)", "5.000×"], ["U2", "eid", "Emp(eid)", "100×"], ["Q2", "dname", "Dept(dname)", "50×"], ["Q2", "dno (join)", "Emp(dno)", "50×"]] }];
  S.s.ins = undefined; S.s.nidx = 1;
  S.snap({ line: ["c2", "c5"], note: "Satu indeks Emp(eid) membantu 2 pekerjaan sekaligus", tone: "done", marks: null, dur: 2400 });
  S.s.items[0].state = { 0: "ok", 1: "ok", 2: "hl", 3: "hl" };
  S.s.nidx = 3;
  S.snap({ line: ["c3", "c4"], note: "Q2 jarang: pertimbangkan lagi biaya INSERT-nya", tone: "keep", dur: 2400 });
  steps.push(S.take());

  // 7 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "q3", note: "Indeks: pencarian cepat, perubahan data sedikit lebih lambat", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "indeks-workload",
    renderer: "db",
    title: "Indeks & Workload: Dari 830 Halaman Menjadi 3",
    subtitle: "Database menyimpan tabel dalam halaman-halaman di disk. Lihat berapa halaman yang dibaca untuk mencari satu karyawan, sebelum dan sesudah ada indeks.",
    minutes: 14,
    level: "Pemula",
    lo: "LO 2",
    learn: [
      { text: "Tabel disimpan dalam halaman disk", at: 0 },
      { text: "Workload dan ISUD chart", at: 1 },
      { text: "Indeks B+ tree", at: 2 },
      { text: "Harga indeks: INSERT lebih lambat, disk lebih penuh", at: 4 },
      { text: "Memilih kolom yang layak diberi indeks", at: 5 }
    ],
    metrics: [
      { key: "pages", label: "Halaman dibaca", icon: "▤" },
      { key: "idx", label: "Jumlah indeks", icon: "⌗" },
      { key: "ins", label: "Waktu INSERT", unit: "ms", icon: "⏱" }
    ],
    legend: [
      { color: "#f59e0b", label: "Halaman dibaca" },
      { color: "#10b981", label: "Halaman berisi hasil" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Full scan", title: "Mencari satu karyawan",
        text: [
          "Tabel `Emp` berisi 100.000 karyawan. Di disk, tabel ini tidak disimpan sebagai satu lembar panjang, melainkan dipotong menjadi **halaman** (page) berukuran 8 KB. Totalnya **830 halaman**.",
          "Kita mencari karyawan nomor 4242. Tanpa petunjuk apa pun, database harus membuka **semua 830 halaman** satu per satu. Ini disebut *full table scan* atau *Seq Scan*. Padahal hasilnya cuma 1 baris."
        ],
        callout: { type: "ANALOGI", text: "Seperti mencari satu nama di buku tebal yang tidak punya daftar isi: kamu terpaksa membalik setiap halaman." },
        changed: [["+", "830 halaman dibaca"], ["+", "Hasil: 1 baris"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Workload", title: "Kenali workload dulu",
        text: [
          "Sebelum membuat indeks, catat **workload**: query dan perubahan data apa saja yang sering terjadi, dan seberapa sering. Slide menyebutnya **ISUD chart** (*Insert, Select, Update, Delete*).",
          "Di contoh ini, mencari karyawan per `eid` terjadi 5.000 kali sehari. Inilah yang paling layak dipercepat. INSERT dan UPDATE juga dicatat, karena indeks akan memengaruhi mereka."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Angka frekuensi di sini adalah contoh. Di sistem nyata, angka ini diambil dari log aplikasi atau log database." },
        changed: [["+", "ISUD chart: 2 query, 3 perubahan data"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "B+ tree", title: "Indeks B+ tree",
        text: [
          "`CREATE INDEX emp_eid ON Emp(eid)` membuat struktur terpisah bernama **B+ tree**. Isinya daftar semua `eid` yang **sudah terurut**, masing-masing dengan alamat halaman tempat barisnya berada.",
          "Bagian atas disebut **akar** (*root*), bagian bawah disebut **daun** (*leaf*). Akar memberi tahu daun mana yang harus dibuka."
        ],
        callout: { type: "ANALOGI", text: "Persis seperti indeks di halaman belakang buku: \"Basis data … hlm. 264\". Kamu langsung melompat ke halamannya." },
        changed: [["+", "Indeks emp_eid (276 halaman)"]],
        frames: steps[2]
      },
      {
        kind: "SOLUSI", short: "3 halaman", title: "Dari 830 menjadi 3 halaman",
        text: [
          "Dengan indeks, database membaca akar, lalu satu daun yang memuat 4242, lalu langsung **halaman 264** di tabel. Totalnya **3 halaman**.",
          "Angka ini hasil pengukuran sungguhan di PostgreSQL: `Buffers: shared hit=1 read=2` berarti 3 halaman disentuh."
        ],
        callout: { type: "IDE KUNCI", text: "Indeks tidak membuat disk lebih cepat. Indeks mengurangi **jumlah halaman** yang perlu dibaca." },
        changed: [["~", "Halaman dibaca 830 → 3"]],
        frames: steps[3]
      },
      {
        kind: "KASUS", short: "Harga indeks", title: "Kasus: indeks tidak gratis",
        text: [
          "Setiap kali baris baru masuk, indeksnya juga harus diperbarui. Memasukkan 100.000 baris butuh ±55 ms tanpa indeks, ±173 ms dengan 1 indeks, dan ±455 ms dengan 4 indeks.",
          "Indeks juga memakan ruang: 1 indeks = 314 halaman, 4 indeks = 599 halaman. Jadi indeks mempercepat **SELECT**, tetapi memperlambat **INSERT/UPDATE/DELETE**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Waktu diukur di mesin uji dan bisa berbeda di komputer lain. Yang penting polanya: makin banyak indeks, makin berat perubahan data." },
        changed: [["~", "Waktu INSERT 55 → 173 → 455 ms"], ["+", "599 halaman untuk 4 indeks"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Pilih indeks", title: "Kasus: indeks mana yang dibuat?",
        text: [
          "Aturan praktis dari slide: kolom yang muncul di **WHERE** adalah kandidat indeks. Utamakan query yang paling sering, dan pilih indeks yang membantu **sebanyak mungkin** query.",
          "`Emp(eid)` membantu Q1 (5.000×) dan U2 (100×). Indeks untuk Q2 (`dname`, `dno`) hanya membantu 50 query per hari, jadi perlu ditimbang dengan biaya INSERT di langkah sebelumnya."
        ],
        changed: [["+", "Rencana indeks: Emp(eid), Dept(dname), Emp(dno)"]],
        frames: steps[5]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Desain fisik basis data dimulai dari workload: tahu query mana yang penting, lalu memilih indeks yang paling menghemat halaman."],
        bullets: [
          "Tabel disimpan dalam halaman disk; tanpa indeks, semua halaman dibaca.",
          "ISUD chart mencatat seberapa sering Insert, Select, Update, Delete terjadi.",
          "Indeks B+ tree: akar → daun → halaman tabel.",
          "Indeks mempercepat pencarian, tetapi memperlambat perubahan data dan memakan ruang.",
          "Kandidat indeks: kolom di WHERE pada query yang sering."
        ],
        quiz: [
          { q: "Tanpa indeks, mencari 1 baris di tabel 830 halaman membaca berapa halaman?", options: ["1", "3", "Semua 830", "Tergantung baris"], answer: 2, why: "Tanpa petunjuk, database harus memeriksa setiap halaman (full scan)." },
          { q: "Apa kerugian menambah banyak indeks?", options: ["SELECT lebih lambat", "INSERT/UPDATE lebih lambat dan butuh ruang", "Data hilang", "Tidak ada kerugian"], answer: 1, why: "Setiap indeks harus ikut diperbarui saat data berubah." },
          { q: "Kolom mana yang paling layak diberi indeks?", options: ["Kolom yang tidak pernah dipakai", "Kolom di WHERE pada query yang sering", "Semua kolom", "Kolom teks panjang"], answer: 1, why: "Indeks membantu pencarian berdasarkan kondisi WHERE." }
        ],
        changed: [],
        frames: steps[6]
      }
    ],
    next: "Pelajaran berikutnya: **Clustered vs Unclustered**, ketika indeks saja ternyata tidak cukup."
  });
})();
