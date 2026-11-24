/* Pelajaran: Make or Buy (Modul 09 · Sesi 17–18 · Bab 10 · LO 3)
 * Mengikuti slide "Development Strategies": In-House Development Options, Outsourcing, Offshoring, Software as a Service.
 * Angka biaya adalah ilustrasi untuk studi kasus MartKita; TCO dan titik silang model biaya dihitung di bawah.
 */
(function () {
  const YEARS = 5, DEADLINE = 6;
  // biaya dalam juta rupiah
  const OPT = {
    inhouse: { name: "In-house", awal: 900, tahun: 240, live: 9, fit: 100 },
    paket: { name: "Beli paket", awal: 400, tahun: 80, live: 4, fit: 85 },
    kustom: { name: "Paket + kustomisasi berat", awal: 650, tahun: 150, live: 6, fit: 95 },
    outs: { name: "Outsourcing lokal", awal: 300, tahun: 360, live: 6, fit: 95 },
    offs: { name: "Offshoring", awal: 200, tahun: 240, live: 7, fit: 95 },
    saas: { name: "SaaS", awal: 20, tahun: 108, live: 1, fit: 70 }
  };
  const tco = (o) => o.awal + YEARS * o.tahun;
  const M = (k) => { const o = OPT[k]; return { awal: o.awal, tahun: o.tahun, live: o.live, tco: tco(o) }; };
  const rp = (v) => "Rp " + Math.round(v).toLocaleString("id-ID") + " jt";

  // model biaya outsourcing (per bulan, juta rupiah) terhadap jumlah cabang
  const FIXED = 30, SUB_PER_CABANG = 0.4 * 5, USAGE_PER_CABANG = (120 * 13000) / 1e6;
  const fee = { fixed: () => FIXED, sub: (c) => SUB_PER_CABANG * c, usage: (c) => USAGE_PER_CABANG * c };
  const cross = (perCabang) => FIXED / perCabang;
  const XS = cross(SUB_PER_CABANG), XU = cross(USAGE_PER_CABANG);
  const r1 = (v) => (Math.round(v * 10) / 10).toLocaleString("id-ID");
  const cheapest = (c) => [["Fixed fee", fee.fixed(c)], ["Subscription", fee.sub(c)], ["Usage", fee.usage(c)]].sort((a, b) => a[1] - b[1])[0];
  const FEECHART = (cabang, extra) => Object.assign({
    type: "chart", at: "center", title: "Tiga model biaya outsourcing",
    sub: "Biaya per bulan untuk jumlah cabang yang berbeda (5 pengguna dan 13.000 transaksi per cabang per bulan).",
    x: { min: 0, max: 30, ticks: [0, 5, 10, 15, 20, 25, 30], label: "Jumlah cabang" },
    y: { min: 0, max: 60, ticks: [0, 10, 20, 30, 40, 50, 60], label: "Biaya per bulan (Rp juta)" },
    series: [
      { name: "Fixed fee", color: "#6366f1", points: [[0, FIXED], [30, FIXED]] },
      { name: "Subscription (Rp 400 rb/pengguna)", color: "#d946ef", points: [[0, 0], [30, fee.sub(30)]] },
      { name: "Usage (Rp 120/transaksi)", color: "#10b981", points: [[0, 0], [30, fee.usage(30)]] }
    ],
    vlines: cabang != null ? [{ x: cabang, label: cabang + " cabang", tone: "warn" }] : [],
    markers: cabang != null ? [{ x: cabang, y: cheapest(cabang)[1], label: cheapest(cabang)[0] + ": Rp " + r1(cheapest(cabang)[1]) + " jt", tone: "ok" }] : []
  }, extra || {});

  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  const steps = [];
  S.s.nodes = [{ id: "mk", kind: "box", theme: "sand", label: "MartKita", sub: "12 cabang · Medan", u: 0, v: 0.2 }];

  // 1 — MASALAH
  S.s.nodes.push({ id: "q", kind: "token", label: "Aplikasi member & poin: bangun sendiri atau beli?", u: 0, v: -2.6 });
  S.snap({ note: "Harus siap sebelum promo Lebaran: 6 bulan lagi", tone: "alert", metrics: {}, dur: 2400 });
  steps.push(S.take());

  // 2 — in-house
  S.drop("q");
  S.s.nodes.push({ id: "it", kind: "pc", label: "Tim IT internal", sub: "3 programmer · 9 bulan", u: -3.6, v: -1.6, sparkle: true });
  S.s.edges = [{ a: "it", b: "mk" }];
  S.snap({ note: "Make: dibangun sendiri oleh tim IT", flows: [{ path: ["it", "mk"], kind: "data", dur: 1.6 }], metrics: M("inhouse"), dur: 2200 });
  S.set("it", { state: "err", sub: "go-live: bulan ke-9" });
  S.snap({ note: "Sesuai 100%, tetapi baru jadi 3 bulan setelah Lebaran", tone: "alert", metrics: M("inhouse"), dur: 2000 });
  steps.push(S.take());

  // 3 — beli paket
  S.set("it", { state: "off", sub: null });
  S.s.nodes.push({ id: "pkt", kind: "box", theme: "violet", label: "Paket software", sub: "vertical: khusus ritel", u: -3.8, v: 2.6, sparkle: true });
  S.s.edges.push({ a: "pkt", b: "mk" });
  S.snap({ note: "Buy: beli paket dari software vendor", flows: [{ path: ["pkt", "mk"], kind: "data", dur: 1.4 }, { path: ["mk", "pkt"], kind: "res", dur: 1.4, delay: 0.7 }], metrics: M("paket"), dur: 2200 });
  S.set("pkt", { state: "ok", sub: "go-live: bulan ke-4" });
  S.snap({ note: "Lebih murah dan cepat, tetapi hanya 85% kebutuhan terpenuhi", tone: "keep", metrics: M("paket"), dur: 2000 });
  steps.push(S.take());

  // 4 — kustomisasi paket (VAR)
  S.set("pkt", { state: null, sub: "basis paket" });
  S.s.nodes.push({ id: "var", kind: "box", theme: "blue", label: "VAR", sub: "menambah fitur poin khusus", u: -1.0, v: 3.8, sparkle: true });
  S.s.edges.push({ a: "pkt", b: "var" }, { a: "var", b: "mk" });
  S.snap({ note: "Value-added reseller menyesuaikan paket untuk MartKita", flows: [{ path: ["pkt", "var", "mk"], kind: "data", dur: 1.8 }], metrics: M("kustom"), dur: 2300 });
  S.set("var", { state: "hl", sub: "kustomisasi berat" });
  S.snap({ note: "Kustomisasi berat: biaya naik dan dukungan jangka panjang makin rumit", tone: "alert", metrics: M("kustom"), dur: 2200 });
  steps.push(S.take());

  // 5 — outsourcing
  S.set("var", { state: "off" });
  S.set("pkt", { state: "off" });
  S.s.nodes.push({ id: "out", kind: "server", label: "Firma outsourcing", sub: "Medan · fixed fee", u: 3.4, v: -1.8, sparkle: true });
  S.s.edges.push({ a: "mk", b: "out" });
  S.snap({ note: "Outsourcing: pengembangan dan operasi diserahkan ke firma luar", flows: [{ path: ["out", "mk"], kind: "data", dur: 1.4 }, { path: ["mk", "out"], kind: "res", dur: 1.4, delay: 0.7, count: 2 }], metrics: M("outs"), dur: 2400 });
  steps.push(S.take());

  // 6 — offshoring
  S.set("out", { state: "off" });
  S.s.nodes.push({ id: "off", kind: "server", theme: "rose", label: "Firma offshore", sub: "luar negeri · zona waktu +5 jam", u: 6.6, v: -0.2, sparkle: true });
  S.s.edges.push({ a: "mk", b: "off", kind: "wan", label: "lintas negara" });
  S.snap({ note: "Offshoring: dikerjakan di negara lain demi biaya lebih rendah", flows: [{ path: ["off", "mk"], kind: "data", arc: 0.9, dur: 2.2 }], metrics: M("offs"), dur: 2400 });
  S.set("off", { state: "hl" });
  S.snap({ note: "Risiko: kendali proyek, keamanan data, budaya, dan komunikasi", tone: "alert", flows: [{ path: ["mk", "off"], kind: "err", arc: 0.9, dur: 2.2 }], metrics: M("offs"), dur: 2300 });
  steps.push(S.take());

  // 7 — SaaS
  S.set("off", { state: "off" });
  S.s.nodes.push({ id: "saas", kind: "cloud", label: "SaaS", sub: "berlangganan per pengguna", u: 3.6, v: 3.0, sparkle: true });
  S.s.edges.push({ a: "mk", b: "saas", kind: "wan", label: "Internet" });
  S.snap({ note: "SaaS: tidak ada instalasi; aplikasi dipakai lewat Internet", flows: [{ path: ["saas", "mk"], kind: "data", arc: 0.8, dur: 1.6 }, { path: ["mk", "saas"], kind: "res", arc: 0.8, dur: 1.6, delay: 0.8 }], metrics: M("saas"), dur: 2300 });
  S.edge("mk", "saas").state = "cut";
  S.set("mk", { state: "err" });
  S.snap({ note: "Kelemahan: tanpa Internet yang stabil, aplikasi tidak bisa dipakai", tone: "alert", flows: [], metrics: M("saas"), dur: 2200 });
  steps.push(S.take());

  // 8 — SOLUSI: tabel perbandingan TCO
  S.edge("mk", "saas").state = null;
  S.set("mk", { state: null });
  const keys = ["inhouse", "paket", "kustom", "outs", "offs", "saas"];
  const ok = (k) => OPT[k].live <= DEADLINE && OPT[k].fit >= 85;
  const rowTone = {};
  keys.forEach((k, i) => { rowTone[i] = ok(k) ? "ok" : ""; });
  S.snap({
    note: "Saring: siap ≤ 6 bulan dan memenuhi ≥ 85% kebutuhan", tone: "done", metrics: M("paket"), dur: 1200,
    card: {
      type: "table", at: "center", title: "Perbandingan strategi (TCO " + YEARS + " tahun)",
      cols: ["Strategi", "Biaya awal", "Per tahun", "TCO " + YEARS + " th", "Go-live", "Sesuai"],
      rows: keys.map((k) => { const o = OPT[k]; return [o.name, rp(o.awal), rp(o.tahun), "**" + rp(tco(o)) + "**", o.live + " bln", o.fit + "%"]; }),
      rowTone,
      foot: "Tiga strategi lolos saringan. **Beli paket** memiliki TCO terendah di antaranya (" + rp(tco(OPT.paket)) + "), dan menjadi kandidat untuk dianalisis kelayakan finansialnya."
    }
  });
  steps.push(S.take());

  // 9 — KASUS: model biaya outsourcing
  S.snap({ note: "Outsourcing: model biaya mana yang paling murah?", card: FEECHART(12), metrics: M("outs"), dur: 2400 });
  S.snap({ note: "Rencana 3 tahun: 25 cabang. Pemenangnya berganti", tone: "alert", card: FEECHART(25), metrics: M("outs"), dur: 2400 });
  S.snap({ note: "Coba sendiri: geser jumlah cabang", tone: "keep", card: { type: "lab", at: "center", lab: "fee", title: "Lab: model biaya outsourcing", sub: "Fixed **Rp 30 jt/bulan** · Subscription **Rp 400 rb/pengguna** · Usage **Rp 120/transaksi**." }, metrics: M("outs"), dur: 800 });
  steps.push(S.take());

  // 10 — RANGKUMAN: paket ditandai sebagai kandidat
  S.set("pkt", { state: "ok", sub: "kandidat terpilih" });
  S.snap({ note: "Make, buy, atau outsource: sesuaikan dengan kebutuhan, waktu, dan biaya", tone: "done", card: null, flows: [{ path: ["pkt", "mk"], kind: "data", dur: 1.6 }], metrics: M("paket"), dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "make-or-buy",
    renderer: "net",
    title: "Make or Buy: Lima Jalan Membangun Sistem",
    subtitle: "MartKita butuh aplikasi member dan poin sebelum Lebaran. Bandingkan membangun sendiri, membeli paket, outsourcing, offshoring, dan SaaS dari sisi biaya, waktu, dan kesesuaian.",
    minutes: 16,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Make or buy: alasan membangun sendiri vs membeli paket", at: 2 },
      { text: "Kustomisasi paket dan peran VAR", at: 3 },
      { text: "Outsourcing, offshoring, dan risikonya", at: 5 },
      { text: "Kelebihan dan kekurangan SaaS", at: 6 },
      { text: "Model biaya fixed, subscription, dan usage", at: 8 }
    ],
    metrics: [
      { key: "awal", label: "Biaya awal", unit: "jt", icon: "Rp" },
      { key: "tahun", label: "Biaya per tahun", unit: "jt", icon: "↻" },
      { key: "live", label: "Go-live", unit: "bln", icon: "⏱" },
      { key: "tco", label: "TCO 5 tahun", unit: "jt", icon: "Σ", total: true }
    ],
    legend: [
      { color: "#10b981", round: true, label: "Software dikirim" },
      { color: "#f59e0b", round: true, label: "Pembayaran" },
      { color: "#e11d48", round: true, label: "Risiko" }
    ],
    labs: {
      fee(el, { h, chart }) {
        const out = h("output", null, "");
        const input = h("input", { type: "range", min: 1, max: 30, value: 12, "aria-label": "Jumlah cabang" });
        const badge = h("div", { class: "lab-badge" });
        const c = h("div", { class: "net-chart" });
        el.append(h("div", { class: "lab-row" }, h("label", null, "Jumlah cabang"), input, out), badge, c);
        const update = () => {
          const n = +input.value, best = cheapest(n);
          out.textContent = n + " cabang";
          badge.className = "lab-badge t-ok";
          badge.textContent = "Fixed Rp " + r1(fee.fixed(n)) + " jt · Subscription Rp " + r1(fee.sub(n)) + " jt · Usage Rp " + r1(fee.usage(n)) + " jt  →  termurah: " + best[0];
          chart(c, FEECHART(n));
        };
        input.addEventListener("input", update);
        update();
        return () => input.removeEventListener("input", update);
      }
    },
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Make or buy?", title: "Bangun sendiri atau beli?",
        text: [
          "MartKita ingin aplikasi **member dan poin** untuk 12 cabangnya, dan harus siap sebelum promo Lebaran, **6 bulan lagi**.",
          "Pilihan antara mengembangkan sendiri dan membeli software disebut keputusan **make or buy** (build or buy). Ada lima jalan yang akan kita bandingkan dengan empat ukuran: biaya awal, biaya per tahun, waktu go-live, dan total biaya 5 tahun (TCO)."
        ],
        changed: [["+", "Kebutuhan: aplikasi member & poin"], ["+", "Tenggat: 6 bulan"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "In-house", title: "Make: dikembangkan sendiri",
        text: [
          "Tim IT internal membangun aplikasi dari nol. Alasan memilih in-house: kebutuhan yang **unik**, tidak ada paket yang cocok, prosedur bisnis tidak perlu berubah, dan kemampuan internal ikut tumbuh.",
          "Hasilnya 100% sesuai, tetapi butuh **9 bulan** dan biaya awal Rp 900 jt. Tenggat Lebaran terlewat."
        ],
        changed: [["+", "Tim IT internal"], ["~", "TCO → " + rp(tco(OPT.inhouse))]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Beli paket", title: "Buy: membeli paket software",
        text: [
          "Perusahaan yang membuat software untuk dijual disebut **software vendor**. Paket untuk satu jenis bisnis (misalnya ritel) disebut **vertical application**; paket umum yang dipakai banyak jenis bisnis disebut **horizontal application**.",
          "Paket ritel ini lebih murah (Rp 400 jt), siap dalam **4 bulan**, sudah teruji, dan diperbarui vendor. Kekurangannya: hanya **85%** kebutuhan MartKita terpenuhi."
        ],
        changed: [["+", "Paket software (vertical)"], ["~", "TCO " + rp(tco(OPT.inhouse)) + " → " + rp(tco(OPT.paket))], ["~", "Go-live 9 → 4 bulan"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Kustomisasi", title: "Menyesuaikan paket",
        text: [
          "Untuk menutup 15% sisanya, paket bisa disesuaikan: vendor yang menyesuaikan, membayar vendor untuk tambahan fitur, atau memodifikasinya sendiri. Perusahaan yang menambah fitur dan mengonfigurasi paket untuk industri tertentu disebut **value-added reseller (VAR)**.",
          "Hati-hati: kustomisasi berat membuat biaya awal naik ke Rp 650 jt dan biaya tahunan hampir dua kali lipat, karena setiap pembaruan vendor harus diuji ulang terhadap kustomisasinya."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Manfaat membeli paket berkurang jika kustomisasinya besar, dan dukungan jangka panjangnya menjadi masalah tersendiri." },
        changed: [["+", "VAR"], ["~", "Sesuai 85% → 95%"], ["~", "TCO " + rp(tco(OPT.paket)) + " → " + rp(tco(OPT.kustom))]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Outsourcing", title: "Outsourcing",
        text: [
          "**Outsourcing** memindahkan pengembangan, operasi, atau pemeliharaan sistem ke firma luar. Jika yang diserahkan adalah seluruh proses bisnis, misalnya layanan pelanggan, disebut **business process outsourcing (BPO)**.",
          "Biaya awalnya kecil (Rp 300 jt), tetapi MartKita membayar biaya layanan **Rp 30 jt per bulan**, sehingga TCO 5 tahunnya menjadi " + rp(tco(OPT.outs)) + "."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Sebelum outsourcing, periksa riwayat dan kondisi keuangan firma, serta dampaknya pada staf dan budaya internal." },
        changed: [["+", "Firma outsourcing"], ["~", "TCO → " + rp(tco(OPT.outs))]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Offshoring", title: "Offshoring",
        text: [
          "**Offshoring** (offshore atau global outsourcing) memindahkan pekerjaan IT ke negara lain, terutama untuk menekan biaya. Biaya per tahun di sini Rp 240 jt, lebih rendah dari firma lokal.",
          "Risikonya menurut slide: dampak ekonomi, kendali proyek, keamanan, perbedaan budaya, dan komunikasi (zona waktu berbeda 5 jam). Sebagian perusahaan kini melakukan **reshoring**, yaitu menarik kembali pekerjaan itu."
        ],
        changed: [["+", "Firma offshore"], ["~", "Biaya per tahun " + rp(OPT.outs.tahun) + " → " + rp(OPT.offs.tahun)], ["~", "Go-live 6 → 7 bulan"]],
        frames: steps[5]
      },
      {
        kind: "TEKNIK", short: "SaaS", title: "Software as a Service",
        text: [
          "Dengan **SaaS**, MartKita tidak membeli atau memasang software, hanya berlangganan dan memakainya lewat Internet. Tidak ada instalasi rumit, selalu versi terbaru, dan bisa dipakai dari mana saja.",
          "Siap dalam **1 bulan** dengan TCO terendah (" + rp(tco(OPT.saas)) + "). Kekurangannya: kendali keamanan dan privasi lebih kecil, butuh Internet yang stabil, dan sulit disesuaikan. Hanya **70%** kebutuhan terpenuhi."
        ],
        changed: [["+", "SaaS di cloud"], ["~", "Go-live → 1 bulan"], ["~", "TCO → " + rp(tco(OPT.saas))]],
        frames: steps[6]
      },
      {
        kind: "SOLUSI", short: "Bandingkan", title: "Bandingkan dengan saringan",
        text: [
          "Tim evaluasi pertama-tama **menyingkirkan alternatif yang tidak memenuhi syarat**: harus siap dalam 6 bulan dan memenuhi minimal 85% kebutuhan.",
          "Tiga strategi lolos: beli paket, paket + kustomisasi, dan outsourcing lokal. **Beli paket** paling hemat dengan TCO " + rp(tco(OPT.paket)) + ", sehingga dibawa ke analisis finansial di pelajaran berikutnya."
        ],
        callout: { type: "IDE KUNCI", text: "Biaya awal yang paling murah belum tentu paling murah. Bandingkan **total biaya** selama umur sistem (TCO)." },
        changed: [["~", "Kandidat: beli paket"]],
        frames: steps[7]
      },
      {
        kind: "KASUS", short: "Model biaya", title: "Kasus: fixed, subscription, atau usage?",
        text: [
          "Firma outsourcing menawarkan tiga model biaya: **fixed fee** (tetap Rp 30 jt/bulan), **subscription** (per pengguna), dan **usage/transaction** (per transaksi).",
          "Untuk 12 cabang, usage paling murah. Tetapi MartKita berencana punya 25 cabang dalam 3 tahun. Garis fixed dilewati subscription pada " + r1(XS) + " cabang dan oleh usage pada " + r1(XU) + " cabang, sehingga fixed fee menjadi pilihan termurah."
        ],
        callout: { type: "IDE KUNCI", text: "Pertimbangkan **pertumbuhan di masa depan**, bukan hanya kondisi hari ini. Ini salah satu butir cost-benefit checklist di slide." },
        changed: [["~", "12 cabang → usage termurah"], ["~", "25 cabang → fixed fee termurah"]],
        frames: steps[8]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Tidak ada jalan yang selalu benar",
        text: ["In-house paling sesuai tapi paling lama. Paket paling cepat dari yang sesuai. Outsourcing dan offshoring memindahkan pekerjaan, sekaligus risikonya. SaaS paling murah dan cepat, dengan kendali paling kecil."],
        bullets: [
          "Make or buy: kebutuhan unik → in-house; kebutuhan umum → paket.",
          "Kustomisasi berat mengurangi manfaat paket.",
          "Outsourcing: fixed, subscription, atau usage. Hitung dengan pertumbuhan.",
          "Offshoring lebih murah, tetapi berisiko pada kendali, keamanan, dan komunikasi.",
          "SaaS: tanpa instalasi, tetapi bergantung pada Internet dan vendor."
        ],
        quiz: [
          { q: "MartKita punya proses poin yang sangat unik dan tidak ada paket yang cocok. Strategi apa yang paling tepat?", options: ["SaaS", "In-house", "Beli paket tanpa perubahan", "Offshoring BPO"], answer: 1, why: "Kebutuhan unik yang tidak bisa dipenuhi paket standar adalah alasan utama mengembangkan sendiri." },
          { q: "Biaya outsourcing yang bergantung pada jumlah transaksi disebut…", options: ["Fixed fee", "Subscription", "Usage/transaction model", "Reshoring"], answer: 2, why: "Model usage atau transaction mengenakan biaya sesuai volume transaksi." },
          { q: "Kelemahan SaaS menurut slide adalah…", options: ["Instalasi rumit", "Harus membeli server", "Butuh Internet stabil dan kendali keamanan lebih kecil", "Tidak bisa diakses dari luar kantor"], answer: 2, why: "SaaS bergantung pada koneksi Internet dan vendor, sehingga kendali atas keamanan dan privasi berkurang." }
        ],
        changed: [],
        frames: steps[9]
      }
    ],
    next: "**Payback, ROI, NPV**: apakah paket seharga Rp 400 jt itu layak, dan kapan modalnya kembali?"
  });
})();
