/* Pelajaran: Pemrosesan Online vs Batch (Modul 08 · Sesi 15–16 · Bab 9 · LO 3)
 * Mengikuti slide "System Architecture" bagian Processing Methods dan Figure 9-11:
 * POS memproses penjualan secara online; program batch membuat laporan harian dan memperbarui akuntansi.
 * Angka transaksi dan stok adalah ilustrasi.
 */
(function () {
  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  const steps = [];
  const M = (trx, stock, pending, report) => ({ trx, stock, pending, report });

  S.s.zones = [
    { id: "on", label: "ONLINE · SAAT TRANSAKSI TERJADI", u0: -7.2, v0: -3.6, u1: 0.4, v1: 4.6, theme: "blue" },
    { id: "ba", label: "BATCH · TERJADWAL", u0: 2.4, v0: -3.0, u1: 9.2, v1: 4.2, theme: "sand" }
  ];
  S.s.nodes = [
    { id: "pos1", kind: "pc", label: "POS 1", u: -5.6, v: 2.6 },
    { id: "srv", kind: "server", label: "Sistem online", u: -2.4, v: 0.1 },
    { id: "item", kind: "db", label: "Item file", sub: "stok kopi: 120", u: -5.0, v: -1.8 },
    { id: "sales", kind: "stack", n: 1, label: "Sales file", sub: "0 transaksi", u: 1.0, v: -0.6 },
    { id: "batch", kind: "app", theme: "sand", label: "Program batch", sub: "⏰ 23.00", u: 4.8, v: 1.2, state: "off" },
    { id: "rep", kind: "printer", label: "Laporan harian", u: 7.6, v: -1.2, state: "off" },
    { id: "acct", kind: "db", label: "Sistem akuntansi", u: 7.4, v: 2.8, state: "off" }
  ];
  S.s.edges = [{ a: "pos1", b: "srv" }, { a: "srv", b: "item" }, { a: "srv", b: "sales" }, { a: "sales", b: "batch", kind: "logic" }, { a: "batch", b: "rep", kind: "logic" }, { a: "batch", b: "acct", kind: "logic" }];

  // 1 — MASALAH
  S.snap({ note: "Dua kebutuhan: stok selalu akurat, dan laporan penjualan harian", tone: "keep", metrics: M(0, 120, 0, 0), dur: 2400 });
  steps.push(S.take());

  // 2 — online: satu penjualan
  S.snap({ note: "Kasir memindai kopi sachet: transaksi dikirim saat itu juga", flows: [{ path: ["pos1", "srv"], kind: "req", dur: 1 }], marks: {}, metrics: M(0, 120, 0, 0), dur: 1600 });
  S.set("item", { sub: "stok kopi: 119", subTone: "warn", state: "hl" });
  S.snap({ note: "Sistem online membaca item file dan langsung mengurangi stok", flows: [{ path: ["srv", "item"], kind: "req", dur: 0.9 }, { path: ["item", "srv"], kind: "res", dur: 0.9, delay: 0.45 }], metrics: M(1, 119, 0, 0), dur: 1800 });
  S.set("item", { state: null, subTone: null });
  S.set("sales", { sub: "1 transaksi" });
  S.snap({ note: "Catatan penjualan disimpan, struk kembali ke kasir dalam sekejap", tone: "done", flows: [{ path: ["srv", "sales"], kind: "data", dur: 1 }, { path: ["srv", "pos1"], kind: "res", dur: 1, delay: 0.3 }], metrics: M(1, 119, 1, 0), dur: 2000 });
  steps.push(S.take());

  // 3 — banyak kasir sekaligus
  S.s.nodes.push({ id: "pos2", kind: "pc", label: "POS 2", u: -3.6, v: 3.4 }, { id: "pos3", kind: "pc", label: "POS 3", u: -1.4, v: 3.8 });
  S.s.edges.push({ a: "pos2", b: "srv" }, { a: "pos3", b: "srv" });
  S.set("item", { sub: "stok kopi: 116" });
  S.set("sales", { sub: "4 transaksi", n: 2 });
  S.snap({ note: "Tiga kasir bersamaan: sistem online melayani pengguna konkuren", flows: [{ path: ["pos1", "srv"], kind: "req", dur: 0.9 }, { path: ["pos2", "srv"], kind: "req", dur: 0.9, delay: 0.3 }, { path: ["pos3", "srv"], kind: "req", dur: 0.9, delay: 0.6 }, { path: ["srv", "item"], kind: "req", dur: 0.8, delay: 0.5 }], metrics: M(4, 116, 4, 0), dur: 2600 });
  steps.push(S.take());

  // 4 — batch: kumpulkan dulu
  S.set("item", { sub: "stok kopi: 38" });
  S.set("sales", { sub: "1.240 transaksi", n: 6, subTone: "warn" });
  S.set("batch", { state: null, sub: "⏰ 23.00 · menunggu" });
  S.snap({ note: "Sepanjang hari, catatan penjualan menumpuk di sales file", flows: [{ path: ["srv", "sales"], kind: "data", dur: 0.8, count: 3 }], metrics: M(1240, 38, 1240, 0), dur: 2600 });
  steps.push(S.take());

  // 5 — batch berjalan 23.00
  S.set("batch", { sub: "⏰ 23.00 · berjalan", subTone: "info", state: "hl" });
  S.s.nodes.forEach((n) => { if (n.id.startsWith("pos")) n.state = "off"; });
  S.snap({ note: "Pukul 23.00: toko tutup, program batch membaca semua catatan sekaligus", flows: [{ path: ["sales", "batch"], kind: "file", dur: 1.6 }], metrics: M(1240, 38, 1240, 0), dur: 2400 });
  S.set("rep", { state: "ok", sub: "Rp 18,6 jt · 1.240 trx", subTone: "ok" });
  S.set("acct", { state: "ok", sub: "jurnal diperbarui", subTone: "ok" });
  S.set("sales", { sub: "diarsipkan", n: 1, subTone: null });
  S.set("batch", { state: null, sub: "selesai 23.07", subTone: "ok" });
  S.snap({ note: "Laporan harian dicetak dan sistem akuntansi diperbarui", tone: "done", flows: [{ path: ["batch", "rep"], kind: "data", dur: 1 }, { path: ["batch", "acct"], kind: "data", dur: 1, delay: 0.4 }], metrics: M(1240, 38, 0, 1), dur: 2400 });
  steps.push(S.take());

  // 6 — SOLUSI: gabungan
  S.s.nodes.forEach((n) => { if (n.id.startsWith("pos")) n.state = null; });
  S.snap({ note: "Online untuk melayani transaksi, batch untuk mengolah semuanya di malam hari", tone: "done", flows: [{ path: ["pos1", "srv", "item"], kind: "req", dur: 1.4 }, { path: ["srv", "sales"], kind: "data", dur: 1, delay: 0.7 }, { path: ["sales", "batch", "rep"], kind: "file", dur: 2.4, delay: 1.2 }], metrics: M(1240, 38, 0, 1), dur: 2800 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 7 — KASUS: sistem online mati
  S.set("srv", { state: "err", sub: "mati 14.00", subTone: "err" });
  S.s.nodes.forEach((n) => { if (n.id.startsWith("pos")) n.sub = "tidak bisa menjual"; });
  S.snap({ note: "Pukul 14.00 server online mati: kasir berhenti, antrean menumpuk", tone: "alert", flows: [{ path: ["pos1", "srv"], kind: "err", dur: 1 }, { path: ["pos3", "srv"], kind: "err", dur: 1, delay: 0.4 }], metrics: M(1240, 38, 0, 1), dur: 2600 });
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.set("batch", { state: "err", sub: "gagal 23.00", subTone: "err" });
  S.snap({ note: "Bandingkan: batch gagal pukul 23.00 tidak menghentikan toko", tone: "alert", metrics: M(1240, 38, 1240, 0), dur: 2000 });
  S.set("batch", { state: "ok", sub: "diulang 05.00 · sukses", subTone: "ok" });
  S.snap({ note: "Batch diulang subuh, laporan siap sebelum toko buka", tone: "done", flows: [{ path: ["sales", "batch", "rep"], kind: "file", dur: 2 }], metrics: M(1240, 38, 0, 1), dur: 2400 });
  steps.push(S.take());

  // 8 — KASUS: laporan dibutuhkan siang hari
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.set("rep", { sub: "data kemarin", subTone: "warn", state: "hl" });
  S.set("sales", { sub: "620 transaksi hari ini", n: 4, subTone: "warn" });
  S.snap({ note: "Pukul 14.00 manajer minta penjualan hari ini: laporan batch masih data kemarin", tone: "alert", metrics: M(620, 79, 620, 1), dur: 2600 });
  S.s.nodes.push({ id: "dash", kind: "laptop", label: "Dasbor manajer", sub: "real-time", subTone: "info", u: -0.6, v: -2.8, sparkle: true });
  S.s.edges.push({ a: "dash", b: "srv" });
  S.snap({ note: "Kebutuhan real-time dipenuhi dengan kueri online, bukan batch", tone: "done", flows: [{ path: ["dash", "srv", "sales"], kind: "req", dur: 1.4 }, { path: ["sales", "srv", "dash"], kind: "res", dur: 1.4, delay: 0.7 }], metrics: M(620, 79, 620, 1), dur: 2600 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({
    note: null, metrics: M(1240, 38, 0, 1), dur: 900,
    card: {
      type: "table", at: "center", title: "Online vs batch",
      cols: ["", "Online", "Batch"],
      rows: [
        ["Kapan diproses", "Saat transaksi terjadi (real-time)", "Terjadwal, dalam kelompok"],
        ["Data", "Satu per satu, akses acak", "Banyak sekaligus"],
        ["Output", "Langsung ke pengguna", "Tertunda (delayed output)"],
        ["Tuntutan", "Ketersediaan tinggi, respons cepat, banyak pengguna", "Efisien sumber daya, mudah diulang bila gagal"],
        ["Contoh MartKita", "Kasir & stok", "Laporan harian & akuntansi"]
      ],
      foot: "Banyak retailer memakai **gabungan** keduanya, seperti di Figure 9-11."
    }
  });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "online-batch",
    renderer: "net",
    title: "Pemrosesan Online vs Batch",
    subtitle: "Ikuti satu sachet kopi dari pemindai kasir sampai ke laporan malam hari, lalu lihat apa yang terjadi jika salah satu sistem gagal.",
    minutes: 13,
    level: "Pemula",
    lo: "LO 3",
    learn: [
      { text: "Ciri pemrosesan online: real-time, konkuren, respons cepat", at: 2 },
      { text: "Ciri pemrosesan batch: terjadwal, data banyak, output tertunda", at: 4 },
      { text: "Menggabungkan online dan batch (Figure 9-11)", at: 5 },
      { text: "Dampak kegagalan pada masing-masing metode", at: 6 },
      { text: "Memilih metode sesuai kebutuhan waktu informasi", at: 7 }
    ],
    metrics: [
      { key: "stock", label: "Stok kopi", icon: "▤" },
      { key: "pending", label: "Menunggu batch", icon: "⧗" },
      { key: "report", label: "Laporan selesai", icon: "✓" },
      { key: "trx", label: "Transaksi online", icon: "◆", total: true }
    ],
    legend: [
      { color: "#6366f1", round: true, label: "Transaksi" },
      { color: "#10b981", round: true, label: "Catatan / hasil" },
      { color: "#f97316", round: true, label: "Batch (sekaligus)" },
      { color: "#e11d48", round: true, label: "Gagal" }
    ],
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Dua kebutuhan", title: "Stok akurat dan laporan harian",
        text: [
          "Manajer MartKita punya dua kebutuhan. Pertama, stok di sistem harus **selalu akurat**, setiap kali barang terjual. Kedua, setiap hari ia butuh **laporan penjualan** dan jurnal akuntansi yang lengkap.",
          "Apakah keduanya harus diproses dengan cara yang sama? Ternyata tidak."
        ],
        changed: [["+", "POS, sistem online, item file, sales file"], ["+", "Program batch, laporan, akuntansi (belum aktif)"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Online", title: "Online: diproses saat terjadi",
        text: [
          "Saat kasir memindai kopi sachet, transaksi langsung dikirim ke sistem online. Sistem membaca **item file**, mengurangi stok dari 120 menjadi **119**, menyimpan catatan penjualan, lalu mengirim struk ke kasir.",
          "Semua terjadi **saat dan di tempat transaksi berlangsung**, dan hasilnya langsung diterima pengguna."
        ],
        changed: [["~", "Stok kopi 120 → 119"], ["+", "1 catatan di sales file"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Konkuren", title: "Banyak kasir sekaligus",
        text: [
          "Tiga kasir melayani pembeli pada saat bersamaan. Sistem online harus mendukung **pengguna konkuren**, memberi **respons cepat**, dan **selalu tersedia** saat toko buka.",
          "Stok turun ke 116 tanpa ada kasir yang menunggu kasir lain."
        ],
        callout: { type: "IDE KUNCI", text: "Ciri online processing: real-time, ketersediaan dan keandalan tinggi, mendukung banyak pengguna, respons cepat, interaksi dinamis." },
        changed: [["+", "POS 2 dan POS 3"], ["~", "Stok 119 → 116"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Kumpulkan", title: "Batch: kumpulkan dulu",
        text: [
          "Laporan dan jurnal akuntansi tidak perlu dibuat setiap kali ada penjualan. Catatan penjualan cukup **dikumpulkan** di sales file sepanjang hari.",
          "Menjelang tutup, sudah ada **1.240 transaksi** yang menunggu diproses."
        ],
        changed: [["~", "Sales file 4 → 1.240 catatan"], ["~", "Stok 116 → 38"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "23.00", title: "Batch: diproses terjadwal",
        text: [
          "Pukul 23.00, saat toko tutup dan server tidak sibuk, **program batch** membaca seluruh 1.240 catatan dalam satu kali jalan.",
          "Hasilnya: **laporan penjualan harian** dicetak dan **sistem akuntansi** diperbarui. Selesai dalam 7 menit."
        ],
        callout: { type: "IDE KUNCI", text: "Ciri batch processing: terjadwal, menangani data dalam jumlah besar, efisien memakai sumber daya, output tertunda, mudah ditangani bila ada kesalahan." },
        changed: [["~", "Menunggu batch 1.240 → 0"], ["+", "Laporan harian & jurnal akuntansi"]],
        frames: steps[4]
      },
      {
        kind: "SOLUSI", short: "Gabungan", title: "Online + batch (Figure 9-11)",
        text: [
          "Gabungan keduanya: **online** untuk hal yang harus tepat saat itu juga (penjualan dan stok), **batch** untuk pekerjaan berulang dalam jumlah besar (laporan dan akuntansi).",
          "Ini pola yang dipakai banyak retailer, persis seperti Figure 9-11 di slide."
        ],
        changed: [["~", "Baseline: 1.240 transaksi online, 1 laporan batch"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "Gagal", title: "Kasus: ketika sistem gagal",
        text: [
          "Pukul 14.00 server online mati. Kasir **langsung berhenti menjual**, dan antrean menumpuk. Inilah kenapa online processing menuntut ketersediaan tinggi.",
          "Bandingkan dengan program batch yang gagal pukul 23.00: toko tidak terganggu, batch cukup **diulang subuh**, dan laporan tetap siap sebelum toko buka."
        ],
        changed: [["+", "Server online mati: kasir berhenti"], ["~", "Batch gagal → diulang 05.00"]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "Laporan siang", title: "Kasus: laporan pukul 14.00",
        text: [
          "Manajer ingin tahu penjualan **hari ini** pukul 14.00. Laporan batch hanya berisi data kemarin, karena output batch memang tertunda.",
          "Kebutuhan informasi real-time dipenuhi dengan kueri **online** ke sales file lewat dasbor manajer, bukan dengan mempercepat batch."
        ],
        changed: [["+", "Dasbor manajer (online)"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Pilih sesuai kapan informasi dibutuhkan",
        text: ["Online dipakai untuk transaksi yang harus tepat saat itu juga, batch untuk mengolah banyak data secara terjadwal. Sistem MartKita memakai keduanya."],
        quiz: [
          { q: "Memperbarui stok setiap kali barang terjual adalah contoh…", options: ["Batch processing", "Online processing", "Offshoring", "Middleware"], answer: 1, why: "Transaksi diproses saat dan di tempat terjadinya, dan hasilnya langsung tersedia." },
          { q: "Mengapa laporan penjualan harian cocok diproses secara batch?", options: ["Harus muncul dalam 1 detik", "Datanya banyak, berulang, dan boleh tertunda", "Kasir membutuhkannya saat transaksi", "Batch tidak bisa gagal"], answer: 1, why: "Batch efisien untuk data besar dan tugas berulang yang hasilnya boleh tertunda." },
          { q: "Server online mati pukul 14.00. Apa dampak langsungnya?", options: ["Laporan besok terlambat", "Kasir tidak bisa memproses penjualan", "Tidak ada dampak", "Stok bertambah"], answer: 1, why: "Online processing harus selalu tersedia; jika mati, transaksi berhenti saat itu juga." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "**Topologi & Perangkat Jaringan**: apa yang terjadi saat satu kabel putus di bus, ring, star, dan mesh."
  });
})();
