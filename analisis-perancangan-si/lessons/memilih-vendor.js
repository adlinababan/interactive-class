/* Pelajaran: Memilih Vendor (Modul 09 · Sesi 17–18 · Bab 10 · LO 3)
 * Mengikuti slide "Software Acquisition (1–8 of 8)". Skor tanpa bobot memakai Table 10-3 di slide
 * (Vendor A 26, B 24, C 25). Bobot, benchmark, dan TCO adalah ilustrasi studi kasus MartKita.
 */
(function () {
  const VENDORS = ["A", "B", "C"];
  const CRIT = [
    { id: "harga", name: "Harga", theme: "blue" },
    { id: "tanggal", name: "Tanggal selesai", theme: "violet" },
    { id: "desain", name: "Layout/Desain", theme: "teal" },
    { id: "ref", name: "Referensi", theme: "sand" }
  ];
  // Table 10-3 (slide 50): skor 1–10 per kategori
  const SCORE = { A: [6, 2, 8, 10], B: [5, 5, 8, 6], C: [9, 8, 5, 3] };
  // bobot MartKita (total 100): tanggal selesai paling penting karena tenggat Lebaran
  const WEIGHT = [25, 35, 15, 25];
  const unweighted = (v) => SCORE[v].reduce((a, b) => a + b, 0);
  const weightedSeg = (v, i) => (SCORE[v][i] * WEIGHT[i]) / 10;
  const weighted = (v) => SCORE[v].reduce((a, s, i) => a + (s * WEIGHT[i]) / 10, 0);
  const best = (fn) => VENDORS.slice().sort((a, b) => fn(b) - fn(a))[0];
  const BENCH = { A: 42, B: 55, C: 48 }, BENCH_MAX = 60;           // detik untuk 10.000 transaksi
  const PRICE = { A: 450, B: 380, C: 300 }, SUPPORT = { A: 90, B: 110, C: 140 }, SUPPORT_C_DEAL = 95, YEARS = 5;
  const tco = (v, sup) => PRICE[v] + YEARS * (sup == null ? SUPPORT[v] : sup);
  const n1 = (v) => (Math.round(v * 10) / 10).toLocaleString("id-ID");
  const U = { A: -2.6, B: 0, C: 2.6 };

  const UW = Object.fromEntries(VENDORS.map((v) => [v, unweighted(v)]));
  const WT = Object.fromEntries(VENDORS.map((v) => [v, weighted(v)]));
  const BEST_U = best(unweighted), BEST_W = best(weighted);

  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  // tampilkan diagram dulu tanpa kartu, lalu kartu tabel di tengah panggung
  const snap2 = (o) => { S.snap(Object.assign({}, o, { card: null, dur: 2400 })); S.snap(Object.assign({}, o, { dur: 2600 })); };
  const steps = [];
  const M = (o) => Object.assign({ prop: undefined, top: undefined, bench: undefined, tco: undefined }, o);

  // batang bertumpuk: satu segmen per kriteria
  const stack = (v, segVal, scale, labelSub, extra) => {
    let z = 0;
    return CRIT.map((c, i) => {
      const h = segVal(v, i) * scale;
      const top = i === CRIT.length - 1;
      const seg = { id: v + "-" + c.id, kind: "bar", n: h, z0: z, theme: c.theme, label: top ? "Vendor " + v : "", sub: top ? labelSub : null, u: U[v], v: 0, w: 1.0 };
      if (top && extra) Object.assign(seg, extra);
      z += h;
      return seg;
    });
  };
  const single = (v, val, scale, theme, sub, extra) => Object.assign({ id: "s-" + v, kind: "bar", n: val * scale, theme, label: "Vendor " + v, sub, u: U[v], v: 0, w: 1.0 }, extra || {});

  // 1 — MASALAH
  S.s.nodes = [
    { id: "mk", kind: "box", theme: "sand", label: "MartKita", sub: "butuh paket member & poin", u: -5.4, v: 0 },
    { id: "A", kind: "server", label: "Vendor A", u: 1.6, v: -2.8 },
    { id: "B", kind: "server", label: "Vendor B", u: 3.2, v: 0 },
    { id: "C", kind: "server", label: "Vendor C", u: 1.6, v: 2.8 }
  ];
  S.snap({ note: "Tiga vendor, satu pilihan. Bagaimana memilih dengan adil?", tone: "alert", metrics: M({ prop: 0 }), dur: 2400 });
  steps.push(S.take());

  // 2 — RFP
  S.s.edges = VENDORS.map((v) => ({ a: "mk", b: v, kind: "logic" }));
  S.snap({ note: "Request for proposal (RFP) dikirim ke calon vendor", flows: VENDORS.map((v, i) => ({ path: ["mk", v], kind: "req", dur: 1.4, delay: i * 0.3 })), metrics: M({ prop: 0 }), dur: 2300 });
  VENDORS.forEach((v) => S.set(v, { sub: "proposal masuk", subTone: "ok" }));
  S.snap({ note: "Tiga proposal masuk: perlu model evaluasi yang seragam", tone: "keep", flows: VENDORS.map((v, i) => ({ path: [v, "mk"], kind: "res", dur: 1.4, delay: i * 0.3 })), metrics: M({ prop: 3 }), dur: 2300 });
  steps.push(S.take());

  // 3 — model tanpa bobot (Table 10-3)
  const SC_U = 0.21;
  S.s.edges = [];
  S.s.nodes = [].concat(...VENDORS.map((v) => stack(v, (vv, i) => SCORE[vv][i], SC_U, UW[v] + " poin")));
  S.snap({ note: "Skor 1–10 per kategori, lalu dijumlahkan", metrics: M({ prop: 3 }), dur: 2600 });
  S.s.nodes = [].concat(...VENDORS.map((v) => stack(v, (vv, i) => SCORE[vv][i], SC_U, UW[v] + " poin", v === BEST_U ? { subTone: "ok", sparkle: true } : null)));
  snap2({
    note: "Tanpa bobot: Vendor A unggul tipis (26 · 25 · 24)", tone: "done", metrics: M({ prop: 3, top: UW[BEST_U] }), dur: 2400,
    card: {
      type: "table", at: "center", title: "Table 10-3 · Model tanpa bobot",
      cols: ["Kategori", "A", "B", "C"],
      rows: CRIT.map((c, i) => [c.name].concat(VENDORS.map((v) => SCORE[v][i]))).concat([["**Total**"].concat(VENDORS.map((v) => "**" + UW[v] + "**"))]),
      rowTone: { 4: "ok" }
    }
  });
  steps.push(S.take());

  // 4 — bobot sesuai prioritas
  snap2({
    note: "Tapi apakah keempat kategori sama penting bagi MartKita?", tone: "keep", metrics: M({ prop: 3, top: UW[BEST_U] }), dur: 2600,
    card: {
      type: "table", at: "center", title: "Bobot kategori MartKita",
      cols: ["Kategori", "Bobot", "Alasan"],
      rows: CRIT.map((c, i) => [c.name, WEIGHT[i] + "%", ["Anggaran terbatas", "Tenggat Lebaran", "Penting, bukan utama", "Bukti pengalaman"][i]]),
      hl: { row: 1, col: 1 }
    }
  });
  steps.push(S.take());

  // 5 — model berbobot
  const SC_W = 0.083;
  S.s.nodes = [].concat(...VENDORS.map((v) => stack(v, weightedSeg, SC_W, n1(WT[v]) + " poin")));
  S.snap({ note: "Skor × bobot: segmen tanggal selesai membesar", card: null, metrics: M({ prop: 3, top: UW[BEST_U] }), dur: 2600 });
  S.s.nodes = [].concat(...VENDORS.map((v) => stack(v, weightedSeg, SC_W, n1(WT[v]) + " poin", v === BEST_W ? { subTone: "ok", sparkle: true } : null)));
  snap2({
    note: "Dengan bobot, Vendor C yang unggul (" + n1(WT.C) + " · " + n1(WT.A) + " · " + n1(WT.B) + ")", tone: "done", metrics: M({ prop: 3, top: WT[BEST_W] }), dur: 2400,
    card: {
      type: "table", at: "center", title: "Model berbobot (skor × bobot ÷ 10)",
      cols: ["Kategori", "A", "B", "C"],
      rows: CRIT.map((c, i) => [c.name + " (" + WEIGHT[i] + "%)"].concat(VENDORS.map((v) => n1(weightedSeg(v, i))))).concat([["**Total**"].concat(VENDORS.map((v) => "**" + n1(WT[v]) + "**"))]),
      rowTone: { 4: "ok" }
    }
  });
  steps.push(S.take());

  // 6 — riset vendor & VRA
  S.s.nodes = S.s.nodes.map((n) => (n.id === "C-ref" ? Object.assign({}, n, { state: "hl", sub: "referensi 3/10: periksa!" }) : n));
  snap2({
    note: "Skor referensi C rendah: lakukan vendor risk assessment", tone: "alert", metrics: M({ prop: 3, top: WT[BEST_W] }), dur: 2600,
    card: {
      type: "table", at: "center", title: "Vendor risk assessment · Vendor C",
      cols: ["Aspek", "Hasil"],
      rows: [["Keamanan", "Lulus (ISO 27001)"], ["Kepatuhan", "Lulus (UU PDP)"], ["Stabilitas keuangan", "Sehat, 4 tahun beroperasi"], ["Reputasi", "Klien masih sedikit"]],
      rowTone: { 0: "ok", 1: "ok", 2: "ok" },
      foot: "Gunakan **vendor risk assessment (VRA)** dan **third-party risk management (TPRM)** agar penilaian vendor sistematis."
    }
  });
  steps.push(S.take());

  // 7 — uji & benchmark
  const SC_B = 0.09;
  S.s.nodes = VENDORS.map((v) => single(v, BENCH[v], SC_B, BENCH[v] + " detik", null));
  S.snap({ note: "Benchmark: waktu memproses 10.000 transaksi (makin pendek makin baik)", card: null, metrics: M({ prop: 3, top: WT[BEST_W] }), dur: 2400 });
  const fastest = VENDORS.slice().sort((a, b) => BENCH[a] - BENCH[b])[0];
  S.s.nodes = VENDORS.map((v) => single(v, BENCH[v], SC_B, BENCH[v] + " detik", { theme: BENCH[v] <= BENCH_MAX ? "ok" : "rose", state: v === fastest ? "ok" : null }));
  S.snap({ note: "Semua di bawah batas " + BENCH_MAX + " detik; A tercepat, C cukup", tone: "done", metrics: M({ prop: 3, top: WT[BEST_W], bench: BENCH[fastest] }), dur: 2400 });
  steps.push(S.take());

  // 8 — SOLUSI: TCO
  const SC_T = 0.0052;
  S.s.nodes = VENDORS.map((v) => single(v, tco(v), SC_T, "TCO Rp " + tco(v).toLocaleString("id-ID") + " jt", { theme: "violet" }));
  S.snap({ note: "TCO 5 tahun = harga + 5 × biaya dukungan per tahun", metrics: M({ prop: 3, top: WT[BEST_W], bench: BENCH[fastest], tco: tco(BEST_W) }), dur: 2400 });
  S.s.nodes = VENDORS.map((v) => single(v, tco(v), SC_T, "TCO Rp " + tco(v).toLocaleString("id-ID") + " jt", { theme: v === "C" ? "rose" : "violet", state: v === "C" ? "err" : null }));
  snap2({
    note: "Harga C termurah, tetapi TCO-nya paling mahal", tone: "alert", metrics: M({ prop: 3, top: WT[BEST_W], bench: BENCH[fastest], tco: tco(BEST_W) }), dur: 2600,
    card: {
      type: "table", at: "center", title: "Total cost of ownership (5 tahun)",
      cols: ["", "A", "B", "C"],
      rows: [["Harga paket"].concat(VENDORS.map((v) => PRICE[v])), ["Dukungan / tahun"].concat(VENDORS.map((v) => SUPPORT[v])), ["**TCO**"].concat(VENDORS.map((v) => "**" + tco(v).toLocaleString("id-ID") + "**"))],
      hl: { row: 2, col: 3 },
      foot: "Dalam juta rupiah. Selain harga beli, hitung juga biaya **dukungan pengguna** selama umur sistem."
    }
  });
  steps.push(S.take());

  // 9 — KASUS: kontrak pemeliharaan tambahan
  S.s.nodes = VENDORS.map((v) => single(v, v === "C" ? tco(v, SUPPORT_C_DEAL) : tco(v), SC_T, "TCO Rp " + (v === "C" ? tco(v, SUPPORT_C_DEAL) : tco(v)).toLocaleString("id-ID") + " jt", { theme: v === "C" ? "ok" : "violet", state: v === "C" ? "ok" : null, sparkle: v === "C" }));
  S.snap({ note: "Negosiasi supplemental maintenance agreement: dukungan C turun ke Rp " + SUPPORT_C_DEAL + " jt/tahun", tone: "done", card: null, metrics: M({ prop: 3, top: WT[BEST_W], bench: BENCH[fastest], tco: tco("C", SUPPORT_C_DEAL) }), dur: 2800 });
  steps.push(S.take());

  // 10 — RANGKUMAN: laporan rekomendasi
  S.snap({
    note: null, metrics: M({ prop: 3, top: WT[BEST_W], bench: BENCH[fastest], tco: tco("C", SUPPORT_C_DEAL) }), dur: 900,
    card: {
      type: "table", at: "center", title: "Laporan rekomendasi akuisisi",
      cols: ["", "Vendor A", "Vendor B", "Vendor C"],
      rows: [
        ["Skor tanpa bobot", UW.A, UW.B, UW.C],
        ["Skor berbobot", n1(WT.A), n1(WT.B), "**" + n1(WT.C) + "**"],
        ["Benchmark", BENCH.A + " dtk", BENCH.B + " dtk", BENCH.C + " dtk"],
        ["TCO 5 tahun", tco("A").toLocaleString("id-ID") + " jt", tco("B").toLocaleString("id-ID") + " jt", "**" + tco("C", SUPPORT_C_DEAL).toLocaleString("id-ID") + " jt**"],
        ["Catatan", "Tercepat, referensi kuat", "Di tengah", "Tenggat terpenuhi, klien sedikit"]
      ],
      hl: { col: 3 },
      foot: "Rekomendasi: **Vendor C** dengan kontrak pemeliharaan tambahan; **Vendor A** sebagai alternatif. Keputusan akhir ada di manajemen."
    }
  });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "memilih-vendor",
    renderer: "net",
    title: "Memilih Vendor: Dari RFP ke Rekomendasi",
    subtitle: "Tiga vendor menawarkan paket member dan poin untuk MartKita. Lihat bagaimana bobot, uji benchmark, dan TCO mengubah siapa yang tampak terbaik.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Analisis kebutuhan dan RFP/RFQ", at: 1 },
      { text: "Model evaluasi tanpa bobot (Table 10-3)", at: 2 },
      { text: "Model evaluasi berbobot", at: 4 },
      { text: "Riset vendor, VRA/TPRM, dan benchmark", at: 6 },
      { text: "TCO dan laporan rekomendasi", at: 9 }
    ],
    metrics: [
      { key: "prop", label: "Proposal masuk", icon: "✉" },
      { key: "top", label: "Skor tertinggi", dec: 1, icon: "★" },
      { key: "bench", label: "Benchmark terbaik", unit: "dtk", icon: "⏱" },
      { key: "tco", label: "TCO pilihan", unit: "jt", icon: "Σ", total: true }
    ],
    legend: CRIT.map((c) => ({ color: { blue: "#38bdf8", violet: "#d65ee9", teal: "#2dd4bf", sand: "#f5c542" }[c.theme], label: c.name })),
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Tiga vendor", title: "Tiga vendor, satu pilihan",
        text: [
          "MartKita memutuskan membeli paket aplikasi member dan poin. Tiga vendor tertarik: A, B, dan C.",
          "Tugas analis sistem: menyingkirkan alternatif yang tidak memenuhi kebutuhan, mengurutkan yang layak, lalu menyerahkan rekomendasi kepada manajemen."
        ],
        changed: [["+", "Vendor A, B, C"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "RFP", title: "Analisis kebutuhan dan RFP",
        text: [
          "Tahap pertama akuisisi adalah **menganalisis kebutuhan sistem**, termasuk isu jaringan dan web. Kebutuhan itu ditulis dalam **request for proposal (RFP)** dan dikirim ke vendor.",
          "Jika produknya sudah jelas dan yang dicari adalah harga, dipakai **request for quotation (RFQ)**. Begitu proposal masuk dari beberapa vendor, dibutuhkan **model evaluasi** yang seragam."
        ],
        changed: [["+", "RFP dikirim"], ["~", "Proposal masuk 0 → 3"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Tanpa bobot", title: "Model tanpa bobot (Table 10-3)",
        text: [
          "Setiap vendor dinilai 1–10 pada empat kategori: harga, tanggal selesai, layout/desain, dan referensi. Skor dijumlahkan dan ditumpuk menjadi satu batang.",
          "Hasilnya sesuai slide: **Vendor A 26 poin**, C 25 poin, B 24 poin. Vendor A unggul tipis, terutama karena referensinya 10/10."
        ],
        changed: [["+", "Skor A 26 · B 24 · C 25"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Bobot", title: "Tidak semua kategori sama penting",
        text: [
          "Model tanpa bobot menganggap keempat kategori sama penting. Padahal bagi MartKita, **tanggal selesai** sangat penting karena tenggat Lebaran.",
          "Tim evaluasi menetapkan bobot: harga 25%, tanggal selesai **35%**, desain 15%, referensi 25%. Totalnya 100%."
        ],
        changed: [["+", "Bobot kategori"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Berbobot", title: "Model berbobot",
        text: [
          "Setiap skor dikalikan bobotnya. Segmen tanggal selesai membesar, segmen desain mengecil. Vendor C yang tanggal selesainya 8/10 kini unggul.",
          "Hasil berbobot: **C " + n1(WT.C) + "**, A " + n1(WT.A) + ", B " + n1(WT.B) + ". Peringkatnya berubah walaupun skor mentahnya sama persis."
        ],
        callout: { type: "IDE KUNCI", text: "Model evaluasi harus mencerminkan prioritas organisasi. Bobot yang berbeda bisa menghasilkan pemenang yang berbeda." },
        changed: [["~", "Pemenang A → C"], ["~", "Skor tertinggi 26 → " + n1(WT.C) + " (skala 100)"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Riset vendor", title: "Riset vendor dan VRA",
        text: [
          "Referensi Vendor C hanya 3/10. Sebelum memutuskan, analis meriset vendor lewat Internet, jurnal industri, forum, atau konsultan, dan meminta pendapat pengguna yang sudah memakainya.",
          "**Vendor risk assessment (VRA)** dan **third-party risk management (TPRM)** memeriksa keamanan, kepatuhan, stabilitas keuangan, dan reputasi. C lulus tiga aspek; kliennya memang masih sedikit."
        ],
        changed: [["~", "Vendor C: VRA lulus 3 dari 4 aspek"]],
        frames: steps[5]
      },
      {
        kind: "TEKNIK", short: "Benchmark", title: "Uji dan benchmark",
        text: [
          "Aplikasi harus **diuji** dan **di-benchmark**. Benchmark memberi ukuran kinerja yang bisa dihitung, yaitu waktu memproses sejumlah transaksi tertentu.",
          "Untuk 10.000 transaksi: A **" + BENCH.A + " detik**, C " + BENCH.C + " detik, B " + BENCH.B + " detik. Ketiganya di bawah batas " + BENCH_MAX + " detik."
        ],
        changed: [["+", "Benchmark A " + BENCH.A + " · B " + BENCH.B + " · C " + BENCH.C + " dtk"]],
        frames: steps[6]
      },
      {
        kind: "SOLUSI", short: "TCO", title: "Total cost of ownership",
        text: [
          "Harga beli bukan satu-satunya biaya. **TCO** menghitung harga paket ditambah biaya dukungan selama 5 tahun.",
          "Harga C paling murah (Rp " + PRICE.C + " jt), tetapi biaya dukungannya Rp " + SUPPORT.C + " jt per tahun, sehingga TCO-nya **paling mahal**: Rp " + tco("C").toLocaleString("id-ID") + " jt."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Susun TCO dalam spreadsheet lengkap dengan grafiknya, agar perbandingan mudah dipahami manajemen." },
        changed: [["+", "TCO A " + tco("A") + " · B " + tco("B") + " · C " + tco("C") + " jt"]],
        frames: steps[7]
      },
      {
        kind: "KASUS", short: "Negosiasi", title: "Kasus: kontrak pemeliharaan tambahan",
        text: [
          "Slide menyebut **supplemental maintenance agreement** saat membeli paket. Analis menegosiasikannya dengan Vendor C: biaya dukungan turun dari Rp " + SUPPORT.C + " jt menjadi Rp " + SUPPORT_C_DEAL + " jt per tahun.",
          "TCO C turun ke **Rp " + tco("C", SUPPORT_C_DEAL).toLocaleString("id-ID") + " jt**, kini yang termurah. C unggul pada skor berbobot dan TCO."
        ],
        changed: [["~", "Dukungan C " + SUPPORT.C + " → " + SUPPORT_C_DEAL + " jt/tahun"], ["~", "TCO C " + tco("C").toLocaleString("id-ID") + " → " + tco("C", SUPPORT_C_DEAL).toLocaleString("id-ID") + " jt"]],
        frames: steps[8]
      },
      {
        kind: "RANGKUMAN", short: "Rekomendasi", title: "Laporan rekomendasi",
        text: ["Analis menyusun **laporan rekomendasi akuisisi**: deskripsi setiap alternatif, kelebihan dan kekurangannya, disertai grafik, lalu mempresentasikannya dengan jelas."],
        bullets: [
          "Analisis kebutuhan → RFP/RFQ → model evaluasi.",
          "Model tanpa bobot bisa menyesatkan jika prioritas berbeda.",
          "Riset vendor, VRA/TPRM, uji, dan benchmark.",
          "Bandingkan TCO, bukan hanya harga beli.",
          "Laporan rekomendasi untuk keputusan manajemen."
        ],
        quiz: [
          { q: "Dalam Table 10-3, kenapa Vendor A menang pada model tanpa bobot?", options: ["Harganya paling murah", "Total skornya tertinggi (26)", "Tanggal selesainya terbaik", "Bobot referensi paling besar"], answer: 1, why: "Model tanpa bobot hanya menjumlahkan skor: A 26, C 25, B 24." },
          { q: "Alat evaluasi yang mengukur waktu software memproses sejumlah transaksi disebut…", options: ["RFP", "Benchmark", "TCO", "VRA"], answer: 1, why: "Benchmark memberi ukuran kinerja yang dapat dihitung." },
          { q: "Harga paket murah tetapi biaya dukungannya mahal. Ukuran mana yang memperlihatkannya?", options: ["Skor tanpa bobot", "Total cost of ownership", "Jumlah proposal", "Referensi"], answer: 1, why: "TCO menjumlahkan harga beli dan biaya selama umur sistem." }
        ],
        changed: [],
        frames: steps[9]
      }
    ],
    next: "Modul berikutnya: **Implementasi Sistem**, yaitu pengujian dan strategi konversi ke sistem baru."
  });
})();
