/* Pelajaran: Payback, ROI, NPV (Modul 09 · Sesi 17–18 · Bab 10 · LO 3)
 * Mengikuti slide "Selecting a Development Strategy (2 of 3)": payback analysis, ROI, NPV.
 * Arus kas MartKita adalah ilustrasi; semua hasil (payback, ROI, NPV) dihitung dengan rumus di bawah.
 */
(function () {
  const COST = [400, 80, 80, 80, 80, 80];          // biaya per tahun (juta), tahun 0 = investasi
  const BENEFIT = [0, 180, 260, 300, 320, 320];    // manfaat per tahun (juta)
  const RATE = 0.10, RATE2 = 0.15;
  const SC = 1 / 120;                              // juta → unit tinggi batang
  const YU = (i) => -5 + i * 2;                    // posisi tahun di panggung

  // ---------- rumus ----------
  const net = (cost, ben) => cost.map((c, i) => ben[i] - c);
  const cumul = (arr) => arr.reduce((acc, v, i) => (acc.push((i ? acc[i - 1] : 0) + v), acc), []);
  const payback = (cum) => {
    for (let i = 1; i < cum.length; i++) if (cum[i - 1] < 0 && cum[i] >= 0) return i - 1 + -cum[i - 1] / (cum[i] - cum[i - 1]);
    return null;
  };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const roi = (cost, ben) => ((sum(ben) - sum(cost)) / sum(cost)) * 100;
  const pv = (v, i, r) => v / Math.pow(1 + r, i);
  const npv = (n, r) => sum(n.map((v, i) => pv(v, i, r)));
  const r1 = (v) => (Math.round(v * 10) / 10).toLocaleString("id-ID");
  const r2 = (v) => (Math.round(v * 100) / 100).toLocaleString("id-ID");
  const jt = (v) => (v < 0 ? "−" : "+") + Math.abs(Math.round(v)).toLocaleString("id-ID") + " jt";
  const bulan = (y) => Math.floor(y) + " tahun " + Math.round((y - Math.floor(y)) * 12) + " bulan";

  const NET = net(COST, BENEFIT), CUM = cumul(NET);
  const PB = payback(CUM), ROI = roi(COST, BENEFIT), NPV = npv(NET, RATE), NPV15 = npv(NET, RATE2);
  // kasus: implementasi terlambat satu tahun (manfaat bergeser satu tahun)
  const BEN_LATE = [0, 0, 180, 260, 300, 320];
  const NET_L = net(COST, BEN_LATE), CUM_L = cumul(NET_L);
  const PB_L = payback(CUM_L), ROI_L = roi(COST, BEN_LATE), NPV_L = npv(NET_L, RATE);

  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  const steps = [];
  const zone = { id: "zero", label: "GARIS NOL", u0: YU(0) - 2.6, v0: -1.0, u1: YU(5) + 1.2, v1: 1.0, theme: "blue" };
  const bar = (i, val, theme, sub) => ({ id: "y" + i, kind: "bar", n: val * SC, theme, label: "Tahun " + i, sub: sub == null ? jt(val) : sub, subTone: val < 0 ? "err" : "ok", u: YU(i), v: 0, w: 0.9 });
  const cumTheme = (v) => (v < 0 ? "rose" : "ok");
  const M = (o) => Object.assign({ cum: undefined, pb: undefined, roi: undefined, npv: undefined }, o);

  // 1 — MASALAH: investasi awal
  S.s.zones = [zone];
  S.s.nodes = [bar(0, NET[0], "rose", jt(NET[0]) + " · investasi")];
  S.snap({ note: "Direksi: \"Rp 400 jt keluar sekarang. Kapan kembali?\"", tone: "alert", metrics: M({ cum: CUM[0] }), dur: 2400 });
  steps.push(S.take());

  // 2 — arus kas bersih per tahun
  for (let i = 1; i <= 5; i++) {
    S.s.nodes.push(bar(i, NET[i], "blue", jt(NET[i]) + " / tahun"));
    S.snap({ note: "Tahun " + i + ": manfaat " + BENEFIT[i] + " − biaya " + COST[i] + " = " + NET[i] + " jt", metrics: M({ cum: CUM[0] }), dur: 1100 });
  }
  steps.push(S.take());

  // 3 — arus kas kumulatif
  S.s.nodes = S.s.nodes.map((n) => (n.id === "y0" ? bar(0, CUM[0], "rose", jt(CUM[0])) : bar(+n.id.slice(1), 0, "board", "…")));
  S.snap({ note: "Jumlahkan dari tahun ke tahun: arus kas kumulatif", metrics: M({ cum: CUM[0] }), dur: 1500 });
  for (let i = 1; i <= 5; i++) {
    S.s.nodes[i] = Object.assign(bar(i, CUM[i], cumTheme(CUM[i]), jt(CUM[i])), CUM[i] >= 0 && CUM[i - 1] < 0 ? { sparkle: true, state: "ok" } : {});
    S.snap({
      note: "Kumulatif tahun " + i + ": " + jt(CUM[i - 1]) + " " + (NET[i] < 0 ? "−" : "+") + " " + Math.abs(NET[i]) + " = " + jt(CUM[i]),
      tone: CUM[i] >= 0 && CUM[i - 1] < 0 ? "done" : "", metrics: M({ cum: CUM[i] }), dur: 1400
    });
  }
  steps.push(S.take());

  // 4 — payback
  const pbIdx = Math.floor(PB);
  S.s.nodes.push({ id: "pb", kind: "token", label: "balik modal: " + r2(PB) + " tahun", u: YU(pbIdx) + (PB - pbIdx) * 2, v: 1.6 });
  S.set("y" + (pbIdx + 1), { state: "ok" });
  S.snap({ note: "Payback: " + pbIdx + " + 120/220 = " + r2(PB) + " tahun (" + bulan(PB) + ")", tone: "done", metrics: M({ cum: CUM[5], pb: PB }), dur: 2400 });
  steps.push(S.take());

  // 5 — ROI
  S.snap({
    note: "ROI = (total manfaat − total biaya) ÷ total biaya", metrics: M({ cum: CUM[5], pb: PB, roi: ROI }), dur: 2400,
    card: {
      type: "table", at: "center", title: "Return on investment",
      cols: ["", "Juta rupiah"],
      rows: [["Total manfaat (5 th)", sum(BENEFIT).toLocaleString("id-ID")], ["Total biaya (5 th)", sum(COST).toLocaleString("id-ID")], ["Manfaat bersih", (sum(BENEFIT) - sum(COST)).toLocaleString("id-ID")], ["**ROI**", "**" + r1(ROI) + "%**"]],
      rowTone: { 3: "ok" },
      foot: "ROI = " + (sum(BENEFIT) - sum(COST)) + " ÷ " + sum(COST) + " = **" + r1(ROI) + "%** selama 5 tahun."
    }
  });
  steps.push(S.take());

  // 6 — nilai uang terhadap waktu
  S.s.nodes = S.s.nodes.filter((n) => n.id !== "pb");
  for (let i = 0; i <= 5; i++) S.s.nodes[i] = bar(i, NET[i], NET[i] < 0 ? "rose" : "blue", jt(NET[i]));
  S.snap({ note: "Kembali ke arus kas per tahun", card: null, metrics: M({ cum: CUM[5], pb: PB, roi: ROI }), dur: 1300 });
  for (let i = 0; i <= 5; i++) S.s.nodes[i] = bar(i, pv(NET[i], i, RATE), NET[i] < 0 ? "rose" : "violet", jt(pv(NET[i], i, RATE)));
  S.snap({ note: "Diskon 10%: Rp 240 jt di tahun 5 hanya bernilai Rp " + Math.round(pv(240, 5, RATE)) + " jt hari ini", tone: "keep", metrics: M({ cum: CUM[5], pb: PB, roi: ROI }), dur: 2800 });
  S.snap({
    note: "Diskon 10%: Rp 240 jt di tahun 5 hanya bernilai Rp " + Math.round(pv(240, 5, RATE)) + " jt hari ini", tone: "keep", metrics: M({ cum: CUM[5], pb: PB, roi: ROI }), dur: 2600,
    card: {
      type: "table", at: "center", title: "Present value (r = 10%)",
      cols: ["Tahun", "Arus kas", "÷ (1,1)ⁿ", "Nilai hari ini"],
      rows: NET.map((v, i) => [String(i), jt(v), r2(Math.pow(1 + RATE, i)), "**" + jt(pv(v, i, RATE)) + "**"]),
      foot: "Uang di masa depan dibagi faktor diskonto (1 + r)ⁿ karena uang hari ini bisa diinvestasikan."
    }
  });
  steps.push(S.take());

  // 7 — SOLUSI: NPV
  S.snap({
    note: "NPV = jumlah semua nilai hari ini = " + jt(NPV), tone: "done", metrics: M({ cum: CUM[5], pb: PB, roi: ROI, npv: NPV }), dur: 2600,
    card: {
      type: "table", at: "center", title: "Net present value",
      cols: ["Tahun", "Nilai hari ini"],
      rows: NET.map((v, i) => [String(i), jt(pv(v, i, RATE))]).concat([["**NPV**", "**" + jt(NPV) + "**"]]),
      rowTone: { 6: "ok" },
      foot: "NPV positif: setelah memperhitungkan nilai waktu uang, proyek tetap menghasilkan **" + jt(NPV) + "**."
    }
  });
  steps.push(S.take());

  // 8 — KASUS: implementasi terlambat satu tahun
  for (let i = 0; i <= 5; i++) S.s.nodes[i] = bar(i, CUM[i], cumTheme(CUM[i]), jt(CUM[i]));
  S.snap({ note: "Rencana awal: kumulatif seperti ini", card: null, metrics: M({ cum: CUM[5], pb: PB, roi: ROI, npv: NPV }), dur: 1500 });
  for (let i = 0; i <= 5; i++) S.s.nodes[i] = Object.assign(bar(i, CUM_L[i], cumTheme(CUM_L[i]), jt(CUM_L[i])), CUM_L[i] >= 0 && CUM_L[i - 1] < 0 ? { sparkle: true } : {});
  S.snap({ note: "Implementasi telat 1 tahun: manfaat bergeser, biaya tetap jalan", tone: "alert", metrics: M({ cum: CUM_L[5], pb: PB_L, roi: ROI_L, npv: NPV_L }), dur: 2600 });
  S.snap({ note: "Coba sendiri: ubah tingkat diskonto dan keterlambatan", tone: "keep", card: { type: "lab", at: "center", lab: "fin", title: "Lab: payback, ROI, NPV", sub: "Investasi **Rp 400 jt**, biaya **Rp 80 jt/tahun**, manfaat 180–320 jt/tahun." }, metrics: M({ cum: CUM_L[5], pb: PB_L, roi: ROI_L, npv: NPV_L }), dur: 800 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  for (let i = 0; i <= 5; i++) S.s.nodes[i] = bar(i, CUM[i], cumTheme(CUM[i]), jt(CUM[i]));
  S.snap({
    note: null, metrics: M({ cum: CUM[5], pb: PB, roi: ROI, npv: NPV }), dur: 900,
    card: {
      type: "table", at: "center", title: "Tiga alat analisis finansial",
      cols: ["Alat", "Pertanyaan", "Tepat waktu", "Telat 1 tahun"],
      rows: [
        ["Payback", "Kapan modal kembali?", r2(PB) + " th", r2(PB_L) + " th"],
        ["ROI", "Berapa persen keuntungannya?", r1(ROI) + "%", r1(ROI_L) + "%"],
        ["NPV (10%)", "Berapa nilainya hari ini?", jt(NPV), jt(NPV_L)]
      ],
      foot: "Ketiganya dipakai bersama dalam **cost-benefit checklist** sebelum laporan ke manajemen."
    }
  });
  steps.push(S.take());

  // ---------- lab interaktif ----------
  function labFin(el, { h, chart }) {
    const rate = h("input", { type: "range", min: 0, max: 25, value: 10, "aria-label": "Tingkat diskonto" });
    const late = h("input", { type: "range", min: 0, max: 2, value: 0, "aria-label": "Keterlambatan (tahun)" });
    const oRate = h("output"), oLate = h("output");
    const badge = h("div", { class: "lab-badge" });
    const c = h("div", { class: "net-chart" });
    el.append(h("div", { class: "lab-row" }, h("label", null, "Tingkat diskonto"), rate, oRate), h("div", { class: "lab-row" }, h("label", null, "Terlambat"), late, oLate), badge, c);
    const update = () => {
      const r = +rate.value / 100, d = +late.value;
      const ben = COST.map((_, i) => (i - d >= 1 ? BENEFIT[i - d] : 0));
      const n = net(COST, ben), cum = cumul(n), p = payback(cum), v = npv(n, r), o = roi(COST, ben);
      oRate.textContent = rate.value + "%"; oLate.textContent = d + " tahun";
      badge.className = "lab-badge t-" + (v >= 0 ? "ok" : "err");
      badge.textContent = "Payback " + (p == null ? "> 5 tahun" : r2(p) + " th") + " · ROI " + r1(o) + "% · NPV " + jt(v) + (v >= 0 ? "  →  layak" : "  →  tidak layak");
      chart(c, {
        x: { min: 0, max: 5, ticks: [0, 1, 2, 3, 4, 5], label: "Tahun" },
        y: { min: -600, max: 700, ticks: [-600, -300, 0, 300, 600], label: "Kumulatif (Rp juta)" },
        series: [{ name: "Arus kas kumulatif", color: "#6366f1", points: cum.map((y, i) => [i, y]) },
          { name: "Kumulatif nilai hari ini", color: "#a855f7", dash: "6 5", points: cumul(n.map((y, i) => pv(y, i, r))).map((y, i) => [i, y]) }],
        hlines: [{ y: 0, label: "balik modal" }],
        markers: p == null ? [] : [{ x: p, y: 0, label: r2(p) + " th", tone: "ok" }]
      });
    };
    rate.addEventListener("input", update); late.addEventListener("input", update);
    update();
    return () => { rate.removeEventListener("input", update); late.removeEventListener("input", update); };
  }

  Kelas.registerLesson({
    slug: "payback-roi-npv",
    renderer: "net",
    title: "Payback, ROI, NPV: Apakah Paketnya Layak?",
    subtitle: "Paket software MartKita butuh Rp 400 jt di awal. Ikuti arus kasnya tahun demi tahun sampai balik modal, lalu hitung ROI dan nilai hari ininya.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Arus kas bersih: manfaat − biaya per tahun", at: 1 },
      { text: "Payback analysis: kapan sistem membayar dirinya sendiri", at: 3 },
      { text: "Return on investment (ROI)", at: 4 },
      { text: "Present value dan net present value (NPV)", at: 6 },
      { text: "Dampak keterlambatan dan tingkat diskonto", at: 7 }
    ],
    metrics: [
      { key: "cum", label: "Kumulatif", unit: "jt", icon: "Σ" },
      { key: "pb", label: "Payback", unit: "th", dec: 2, icon: "⏱" },
      { key: "roi", label: "ROI", unit: "%", dec: 1, icon: "%" },
      { key: "npv", label: "NPV (10%)", unit: "jt", icon: "Rp", total: true }
    ],
    legend: [
      { color: "#fb7185", label: "Belum balik modal" },
      { color: "#34d399", label: "Sudah balik modal" },
      { color: "#38bdf8", label: "Arus kas per tahun" },
      { color: "#d65ee9", label: "Nilai hari ini" }
    ],
    labs: { fin: labFin },
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Investasi", title: "Rp 400 juta, kapan kembali?",
        text: [
          "Strategi terpilih dari pelajaran sebelumnya: **membeli paket**. Tahun 0 MartKita mengeluarkan **Rp 400 jt** untuk lisensi dan implementasi. Batang merah turun di bawah garis nol.",
          "Direksi bertanya tiga hal: kapan uangnya kembali, berapa keuntungannya, dan apakah tetap untung jika nilai uang di masa depan diperhitungkan."
        ],
        changed: [["+", "Tahun 0: −400 jt"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Per tahun", title: "Arus kas bersih per tahun",
        text: [
          "Setiap tahun ada **biaya** pemeliharaan Rp 80 jt dan **manfaat**: penjualan member naik dan kehilangan stok berkurang. Manfaatnya naik dari Rp 180 jt ke Rp 320 jt per tahun.",
          "Arus kas bersih = manfaat − biaya: +100, +180, +220, +240, dan +240 juta."
        ],
        changed: [["+", "Arus kas tahun 1–5"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Kumulatif", title: "Arus kas kumulatif",
        text: [
          "Untuk tahu kapan modal kembali, jumlahkan arus kas dari tahun ke tahun. Kumulatif bergerak dari −400 ke −300, lalu −120.",
          "Di tahun 3 kumulatifnya menjadi **+100**: batangnya naik melewati garis nol dan berubah hijau. Sistem sudah membayar dirinya sendiri."
        ],
        changed: [["~", "Kumulatif −400 → +" + CUM[5]]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Payback", title: "Payback analysis",
        text: [
          "**Payback analysis** menghitung berapa lama sistem membayar dirinya sendiri lewat pengurangan biaya dan kenaikan manfaat.",
          "Di akhir tahun 2 masih kurang Rp 120 jt, dan tahun 3 menghasilkan Rp 220 jt. Jadi payback = 2 + 120 ÷ 220 = **" + r2(PB) + " tahun**, sekitar " + bulan(PB) + "."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Payback hanya menjawab \"kapan\", tidak \"berapa banyak\". Arus kas setelah balik modal tidak ikut dihitung." },
        changed: [["+", "Payback " + r2(PB) + " tahun"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "ROI", title: "Return on investment",
        text: [
          "**ROI** membandingkan total manfaat bersih dengan total biaya. Selama 5 tahun: manfaat Rp " + sum(BENEFIT).toLocaleString("id-ID") + " jt, biaya Rp " + sum(COST) + " jt.",
          "ROI = (" + sum(BENEFIT).toLocaleString("id-ID") + " − " + sum(COST) + ") ÷ " + sum(COST) + " = **" + r1(ROI) + "%**. Setiap Rp 1 yang dikeluarkan kembali Rp " + r2(1 + ROI / 100) + "."
        ],
        changed: [["+", "ROI " + r1(ROI) + "%"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Nilai waktu", title: "Nilai uang terhadap waktu",
        text: [
          "Rp 240 jt di tahun ke-5 tidak sama nilainya dengan Rp 240 jt hari ini, karena uang hari ini bisa diinvestasikan. Dengan tingkat diskonto 10%, setiap arus kas dibagi (1,1)ⁿ.",
          "Batangnya mengecil makin jauh ke masa depan: Rp 240 jt di tahun 5 hanya bernilai **Rp " + Math.round(pv(240, 5, RATE)) + " jt** hari ini."
        ],
        changed: [["~", "Arus kas → nilai hari ini (present value)"]],
        frames: steps[5]
      },
      {
        kind: "SOLUSI", short: "NPV", title: "Net present value",
        text: [
          "**NPV** menjumlahkan semua nilai hari ini, termasuk investasi awal: −400 + 90,9 + 148,8 + 165,3 + 163,9 + 149,0.",
          "Hasilnya **" + jt(NPV) + "**. NPV positif berarti proyek layak bahkan setelah nilai waktu uang diperhitungkan. Dengan diskonto 15%, NPV turun menjadi " + jt(NPV15) + ", tetapi tetap positif."
        ],
        callout: { type: "IDE KUNCI", text: "Payback menjawab kapan, ROI menjawab berapa persen, NPV menjawab berapa nilainya hari ini." },
        changed: [["+", "NPV " + jt(NPV)]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "Telat 1 tahun", title: "Kasus: implementasi terlambat",
        text: [
          "Misalkan go-live mundur satu tahun. Biaya pemeliharaan tetap berjalan, tetapi manfaatnya baru dimulai di tahun 2.",
          "Payback mundur dari " + r2(PB) + " ke **" + r2(PB_L) + " tahun**, ROI turun dari " + r1(ROI) + "% ke **" + r1(ROI_L) + "%**, dan NPV anjlok dari " + jt(NPV) + " ke **" + jt(NPV_L) + "**. Di frame terakhir, coba sendiri tingkat diskonto dan keterlambatan lainnya."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Keterlambatan dua tahun membuat proyek ini tidak balik modal dalam 5 tahun. Coba di lab." },
        changed: [["~", "Payback " + r2(PB) + " → " + r2(PB_L) + " th"], ["~", "ROI " + r1(ROI) + "% → " + r1(ROI_L) + "%"], ["~", "NPV " + jt(NPV) + " → " + jt(NPV_L)]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Tiga pertanyaan direksi terjawab",
        text: ["Paket Rp 400 jt balik modal dalam " + r2(PB) + " tahun, memberi ROI " + r1(ROI) + "%, dan bernilai " + jt(NPV) + " hari ini. Asalkan implementasinya tepat waktu."],
        bullets: [
          "Arus kas bersih = manfaat − biaya, per tahun.",
          "Payback: kapan kumulatif melewati nol.",
          "ROI = (total manfaat − total biaya) ÷ total biaya.",
          "NPV = jumlah arus kas yang dibagi (1 + r)ⁿ.",
          "Keterlambatan menurunkan ketiganya."
        ],
        quiz: [
          { q: "Kumulatif akhir tahun 1 = −50 jt, arus kas tahun 2 = +200 jt. Berapa payback-nya?", options: ["1,25 tahun", "2 tahun", "0,25 tahun", "1,5 tahun"], answer: 0, why: "1 + 50 ÷ 200 = 1,25 tahun." },
          { q: "Total manfaat 900 jt dan total biaya 600 jt. Berapa ROI-nya?", options: ["33%", "50%", "150%", "300 jt"], answer: 1, why: "(900 − 600) ÷ 600 = 0,5 = 50%." },
          { q: "Jika tingkat diskonto dinaikkan, NPV proyek yang manfaatnya di masa depan akan…", options: ["Naik", "Turun", "Tetap", "Menjadi nol"], answer: 1, why: "Manfaat masa depan dibagi faktor diskonto yang lebih besar, sehingga nilai hari ininya mengecil." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "**Memilih Vendor**: tiga vendor menawarkan paket. Mana yang dipilih, dan kenapa skor tanpa bobot bisa menyesatkan?"
  });
})();
