/* Pelajaran: Indeks Komposit & Tuning Query (Modul 08 · LO 2)
 * Mengikuti slide "Multi-Attribute Index Keys", "Index-Only Plans", "Tuning Queries and Views", "More Guidelines for Query Tuning".
 * Angka halaman diukur di PostgreSQL 16 (tabel Emp 100.000 baris, urutan fisik acak).
 * Entri indeks yang ditampilkan adalah potongan contoh untuk menjelaskan urutan.
 */
(function () {
  const bars = (items, title) => ({ id: "cmp", type: "bars", title: title || "Halaman dibaca (tabel + indeks)", unit: "halaman", max: 830, items });
  const badge = (v, tone, unit) => ({ id: "badge", type: "badge", title: "Halaman dibaca", value: v, unit: unit || "halaman", tone });
  const entries = (title, cols, rows, state) => ({ id: "ix", type: "table", title, cap: "potongan entri indeks", cols, rows, keys: rows.map((r) => r.join("-")), state });
  const AGE_SAL = [[29, 9900], [30, 2000], [30, 2900], [30, 3000], [30, 3800], [30, 4500], [30, 5000], [30, 5100], [31, 2000]];
  const SAL_AGE = [[3000, 18], [3000, 29], [3000, 30], [3000, 31], [3000, 65], [3100, 18], [3100, 30], [3100, 47], ["…", "…"], [5000, 30]];
  const hitIf = (rows, fn) => Object.fromEntries(rows.map((r, i) => [i, fn(r) ? "ok" : "dim"]));

  // ---------- kode ----------
  const COMP = [["q1", "SELECT eid"], ["q2", "FROM   Emp"], ["q3", "WHERE  age = 30"], ["q4", "  AND  sal BETWEEN 3000 AND 5000;"]];
  const CODE = {
    age: [["mk", "CREATE INDEX emp_age ON Emp(age);"], ["", ""], ...COMP],
    agesal: [["+mk", "CREATE INDEX emp_age_sal ON Emp(age, sal);"], ["", ""], ...COMP],
    salage: [["+mk", "CREATE INDEX emp_sal_age ON Emp(sal, age);"], ["", ""], ...COMP],
    only: [
      ["mk", "CREATE INDEX emp_age_sal ON Emp(age, sal);"], ["", ""],
      ["q1", "SELECT AVG(sal)"], ["q2", "FROM   Emp"], ["q3", "WHERE  age = 25"], ["q4", "  AND  sal BETWEEN 3000 AND 5000;"]
    ],
    grp: [["mk", "CREATE INDEX emp_dno ON Emp(dno);"], ["", ""], ["q1", "SELECT dno, COUNT(*)"], ["q2", "FROM   Emp"], ["q3", "GROUP BY dno;"]],
    having: [
      ["h0", "-- Versi 1: menyaring setelah dikelompokkan"],
      ["h1", "SELECT MIN(age) FROM Emp"], ["h2", "GROUP BY dno"], ["h3", "HAVING dno = 102;"], ["", ""],
      ["w0", "-- Versi 2: menyaring sebelum dikelompokkan"],
      ["w1", "SELECT MIN(age) FROM Emp"], ["w2", "WHERE dno = 102;"]
    ]
  };

  const metricsOf = (f) => ({ pages: f.pg, rows: f.rows, wasted: f.waste });
  const S = DBStory({ items: [], sql: "age", out: [] }, metricsOf);
  const steps = [];

  // 1 — MASALAH: indeks satu kolom
  S.s.items = [badge(764, "bad"), bars([{ label: "indeks age saja", value: 764, tone: "bad" }])];
  S.s.pg = 764; S.s.rows = 492; S.s.waste = 1554;
  S.s.out = ["#Bitmap Index Scan on emp_age: 2.046 baris", "#  Rows Removed by Filter: 1554", "#  Buffers: 764 halaman", "492 baris"];
  S.snap({ line: ["q3", "q4"], note: "Indeks age menemukan 2.046 orang, 1.554 lalu dibuang", tone: "alert", dur: 2800 });
  steps.push(S.take());

  // 2 — indeks komposit <age, sal>
  S.s.sql = "agesal";
  S.s.items = [entries("emp_age_sal (age, sal)", ["age", "sal"], AGE_SAL), bars([{ label: "indeks age saja", value: 764, tone: "bad" }])];
  S.snap({ line: "mk", note: "Indeks 2 kolom: urut menurut age, lalu sal", dur: 2000 });
  S.s.items = [entries("emp_age_sal (age, sal)", ["age", "sal"], AGE_SAL, hitIf(AGE_SAL, (r) => r[0] === 30 && r[1] >= 3000 && r[1] <= 5000)),
    bars([{ label: "indeks age saja", value: 764, tone: "bad" }, { label: "indeks (age, sal)", value: 366, tone: "ok" }])];
  S.s.pg = 366; S.s.waste = 0;
  S.s.out = ["#Bitmap Index Scan on emp_age_sal: 492 baris", "#  Buffers indeks: 2 · tabel: 364", "492 baris"];
  S.snap({ line: ["q3", "q4"], note: "Entri yang cocok berderet: tidak ada yang dibuang", tone: "done", dur: 2800 });
  steps.push(S.take());

  // 3 — KASUS: urutan kolom terbalik
  S.s.sql = "salage";
  S.s.items = [entries("emp_sal_age (sal, age)", ["sal", "age"], SAL_AGE, hitIf(SAL_AGE, (r) => r[1] === 30)),
    bars([{ label: "indeks age saja", value: 764, tone: "bad" }, { label: "indeks (age, sal)", value: 366, tone: "ok" }, { label: "indeks (sal, age)", value: 390, tone: "warn" }])];
  S.s.pg = 390;
  S.s.out = ["#Bitmap Index Scan on emp_sal_age: 492 baris", "#  Buffers indeks: 26 · tabel: 364", "492 baris"];
  S.snap({ line: "mk", note: "Urutan dibalik: age = 30 tercecer di antara umur lain", tone: "keep", dur: 2800 });
  steps.push(S.take());

  // 4 — index-only plan
  S.s.sql = "only";
  S.s.items = [{ id: "pages", type: "pages", title: "Tabel Emp di disk", cap: "830 halaman", n: 83, cols: 14, scale: 10, total: 830, read: [], count: 0 }, badge(4, "ok")];
  S.s.pg = 4; S.s.rows = 1; S.s.waste = undefined;
  S.s.out = ["#Index Only Scan using emp_age_sal", "#  Heap Fetches: 0", "#  Buffers: shared hit=2 read=2"];
  S.snap({ line: ["q1", "q3", "q4"], note: "Semua kolom yang dibutuhkan ada di indeks: tabel tidak disentuh", tone: "done", dur: 2800 });
  steps.push(S.take());

  // 5 — index-only untuk GROUP BY
  S.s.sql = "grp";
  S.s.items = [bars([{ label: "baca seluruh tabel", value: 830, tone: "bad" }], "SELECT dno, COUNT(*) … GROUP BY dno")];
  S.s.pg = 830; S.s.rows = 100;
  S.s.out = ["#Seq Scan on emp · 830 halaman", "100 baris (satu per departemen)"];
  S.snap({ line: ["q1", "q3"], note: "Menghitung karyawan per departemen", dur: 2000 });
  S.s.items = [bars([{ label: "baca seluruh tabel", value: 830, tone: "bad" }, { label: "Index Only Scan emp_dno", value: 91, tone: "ok" }], "SELECT dno, COUNT(*) … GROUP BY dno")];
  S.s.pg = 91;
  S.s.out = ["#Index Only Scan using emp_dno", "#  Heap Fetches: 0 · 91 halaman", "100 baris (satu per departemen)"];
  S.snap({ line: "mk", note: "Cukup membaca indeks dno: 91 halaman", tone: "done", dur: 2600 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 6 — tuning query: HAVING → WHERE
  S.s.sql = "having";
  S.s.items = [{ id: "plan", type: "table", title: "EXPLAIN di PostgreSQL", cols: ["Versi", "Rencana eksekusi"],
    rows: [["HAVING dno = 102", "Index Scan emp_dno · Index Cond: dno = 102"], ["WHERE dno = 102", "Index Scan emp_dno · Index Cond: dno = 102"]] }];
  S.s.pg = undefined; S.s.rows = undefined;
  S.s.out = [];
  S.snap({ line: ["h1", "h2", "h3"], note: "HAVING tanpa agregat sebaiknya ditulis sebagai WHERE", tone: "keep", dur: 2400 });
  S.s.items[0].state = { 0: "ok", 1: "ok" };
  S.s.out = ["#EXPLAIN: kedua versi memakai Index Scan yang sama"];
  S.snap({ line: ["w1", "w2"], note: "PostgreSQL sudah menulis ulang otomatis; cek selalu dengan EXPLAIN", tone: "done", dur: 2600 });
  steps.push(S.take());

  // 7 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "mk", note: "Indeks yang tepat bisa menjawab query tanpa membuka tabel", tone: "done", dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "indeks-komposit-tuning",
    renderer: "db",
    title: "Indeks Komposit & Tuning Query",
    subtitle: "Indeks dua kolom, urutan kolom yang tepat, query yang dijawab langsung dari indeks, dan cara memeriksa rencana eksekusi.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 2",
    learn: [
      { text: "Indeks komposit (multi-kolom)", at: 1 },
      { text: "Urutan kolom indeks itu penting", at: 2 },
      { text: "Index-only plan: tabel tidak perlu dibuka", at: 3 },
      { text: "Menulis ulang query & memeriksa dengan EXPLAIN", at: 5 }
    ],
    metrics: [
      { key: "pages", label: "Halaman dibaca", icon: "▤" },
      { key: "rows", label: "Baris hasil", icon: "≡" },
      { key: "wasted", label: "Baris terbuang", icon: "✕" }
    ],
    legend: [
      { color: "#10b981", label: "Entri yang cocok" },
      { color: "#f59e0b", label: "Halaman dibaca" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Dua syarat", title: "Dua syarat, indeks satu kolom",
        text: [
          "Query mencari karyawan berumur **30** dengan gaji **3000–5000**. Hasilnya 492 orang. Yang tersedia hanya indeks pada `age`.",
          "Indeks itu menemukan semua 2.046 orang berumur 30, lalu database mengecek gajinya satu per satu dan **membuang 1.554**. Total **764 halaman** dibaca."
        ],
        changed: [["+", "764 halaman, 1.554 baris terbuang"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "(age, sal)", title: "Indeks komposit",
        text: [
          "**Indeks komposit** memakai lebih dari satu kolom: `Emp(age, sal)`. Isinya diurutkan menurut `age`, lalu untuk age yang sama diurutkan menurut `sal`.",
          "Akibatnya, semua entri `age = 30` dengan gaji 3000–5000 **berderet rapi**. Database langsung mengambil 492 entri itu tanpa membuang apa pun: **366 halaman**."
        ],
        callout: { type: "ANALOGI", text: "Buku telepon diurutkan menurut kota, lalu nama. Mencari \"Medan, nama A–C\" cukup membuka satu bagian yang berurutan." },
        changed: [["+", "Indeks emp_age_sal"], ["~", "Halaman 764 → 366"], ["~", "Baris terbuang 1.554 → 0"]],
        frames: steps[1]
      },
      {
        kind: "KASUS", short: "(sal, age)", title: "Kasus: urutan kolom dibalik",
        text: [
          "Bagaimana kalau indeksnya `Emp(sal, age)`? Sekarang urutan utamanya gaji. Karyawan berumur 30 **tercecer** di antara umur lain pada setiap nilai gaji 3000, 3100, … 5000.",
          "Bagian indeks yang dibaca naik dari 2 menjadi **26 halaman** (total 390). Slide menyimpulkan: untuk `age = 30 AND sal BETWEEN …`, indeks `<age, sal>` lebih baik."
        ],
        callout: { type: "IDE KUNCI", text: "Taruh kolom dengan syarat **sama dengan (=)** di depan, dan kolom dengan syarat **rentang** di belakang." },
        changed: [["+", "Indeks emp_sal_age: 390 halaman"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Index-only", title: "Index-only plan",
        text: [
          "`SELECT AVG(sal) … WHERE age = 25 AND sal BETWEEN …` hanya membutuhkan kolom `age` dan `sal`, dan keduanya **sudah ada di dalam indeks**.",
          "Database cukup membaca indeks: **4 halaman**, tanpa membuka satu pun halaman tabel (`Heap Fetches: 0`). Ini disebut **index-only plan**."
        ],
        changed: [["+", "Index Only Scan: 4 halaman, tabel tidak disentuh"]],
        frames: steps[3]
      },
      {
        kind: "SOLUSI", short: "GROUP BY", title: "Index-only untuk GROUP BY",
        text: [
          "Menghitung jumlah karyawan per departemen biasanya membaca seluruh tabel: 830 halaman.",
          "Dengan indeks `Emp(dno)`, setiap entri indeks sudah berisi `dno`, dan entri dengan dno sama sudah berdekatan. Database cukup membaca indeks: **91 halaman**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Angka 91 diukur dengan Seq Scan dinonaktifkan. Pada data kecil yang sudah ada di memori, PostgreSQL kadang tetap memilih Seq Scan karena menilai membaca berurutan lebih murah." },
        changed: [["~", "Halaman 830 → 91"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Tuning", title: "Menulis ulang query",
        text: [
          "Slide memberi pedoman: kurangi `GROUP BY … HAVING` yang sebenarnya bisa ditulis sebagai `WHERE`, dan hindari `DISTINCT` kalau hasilnya sudah unik (misalnya berisi kunci).",
          "Selalu periksa dengan **EXPLAIN**. Di PostgreSQL, kedua versi ternyata menghasilkan rencana yang sama, karena optimizer sudah menulis ulang `HAVING dno = 102` menjadi syarat indeks. Sistem lain belum tentu."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Optimizer juga bisa bingung pada NULL, ekspresi aritmetika, OR, dan subquery rumit. Kalau query lambat, lihat rencananya dulu, baru ubah indeks atau query-nya." },
        changed: [["+", "HAVING → WHERE"], ["+", "EXPLAIN: rencana sama"]],
        frames: steps[5]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Indeks yang dirancang sesuai query bisa mengurangi halaman yang dibaca, bahkan menjawab query tanpa membuka tabel."],
        bullets: [
          "Indeks komposit cocok untuk WHERE dengan beberapa syarat.",
          "Kolom dengan syarat = di depan, kolom rentang di belakang.",
          "Index-only plan: semua kolom yang dibutuhkan ada di indeks.",
          "Tulis ulang HAVING tanpa agregat menjadi WHERE; hindari DISTINCT yang tidak perlu.",
          "Gunakan EXPLAIN untuk melihat rencana yang benar-benar dipakai."
        ],
        quiz: [
          { q: "Untuk WHERE age = 30 AND sal BETWEEN 3000 AND 5000, indeks mana yang terbaik?", options: ["(sal, age)", "(age, sal)", "(sal) saja", "Tanpa indeks"], answer: 1, why: "Kolom dengan syarat = di depan membuat entri yang cocok berderet." },
          { q: "Apa itu index-only plan?", options: ["Query tanpa WHERE", "Query dijawab hanya dari indeks, tanpa membuka tabel", "Indeks tanpa tabel", "Query yang memakai semua indeks"], answer: 1, why: "Semua kolom yang dibutuhkan sudah ada di indeks." },
          { q: "Alat untuk melihat rencana eksekusi query adalah…", options: ["DISTINCT", "EXPLAIN", "GROUP BY", "TRIGGER"], answer: 1, why: "EXPLAIN menampilkan langkah yang dipilih optimizer." }
        ],
        changed: [],
        frames: steps[6]
      }
    ],
    next: "Modul berikutnya: **SQL Queries**, mulai dari urutan kerja SELECT–FROM–WHERE."
  });
})();
