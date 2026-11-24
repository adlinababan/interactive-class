/* Pelajaran: Client/Server (Modul 08 · Sesi 15–16 · Bab 9 · LO 3)
 * Mengikuti slide "System Architecture" bagian Client/Server Architecture (1–8 of 8).
 * Model waktu respons: R = S / (1 − ρ), S = 0,25 dtk, kapasitas 100 transaksi/menit (ilustrasi antrean).
 */
(function () {
  const SVC = 0.25, CAP = 100;
  const resp = (load) => SVC / (1 - Math.min(load, 99) / 100);
  const r2 = (x) => Math.round(x * 100) / 100;
  const curve = () => { const pts = []; for (let l = 0; l <= 97; l += 1) pts.push([l, resp(l)]); return pts; };
  const KNEE = (markers, extra) => Object.assign({
    type: "chart", at: "center", title: "Knee of the curve",
    sub: "Waktu respons naik pelan, lalu melonjak saat beban mendekati kapasitas.",
    x: { min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100], label: "Beban server (%)" },
    y: { min: 0, max: 6, ticks: [0, 1, 2, 3, 4, 5, 6], label: "Waktu respons (detik)", fmt: (v) => v },
    series: [{ name: "Waktu respons", color: "#6366f1", points: curve() }],
    hlines: [{ y: 2, label: "batas sabar kasir: 2 dtk" }],
    markers
  }, extra || {});
  const mk = (load, label, tone) => ({ x: load, y: resp(load), label: label || r2(resp(load)).toLocaleString("id-ID") + " dtk", tone });
  const M = (resp, load, kb, upd) => ({ resp, load, kb, upd });

  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  const steps = [];
  const K = [[-4.6, 2.2], [-2.4, 3.1]];
  const base = () => {
    S.s.nodes = [
      { id: "k1", kind: "pc", label: "Kasir 1", u: K[0][0], v: K[0][1] },
      { id: "k2", kind: "pc", label: "Kasir 2…20", u: K[1][0], v: K[1][1] },
      { id: "sw", kind: "switch", label: "Switch", u: -1.2, v: 0.6 },
      { id: "srv", kind: "server", label: "Server database", u: 3.2, v: -0.9 },
      { id: "db", kind: "db", label: "Data barang", u: 5.6, v: 0.6 }
    ];
    S.s.edges = [{ a: "k1", b: "sw" }, { a: "k2", b: "sw" }, { a: "sw", b: "srv" }, { a: "srv", b: "db" }];
  };

  // 1 — MASALAH
  base();
  S.s.nodes.push({ id: "logic", kind: "token", label: "Hitung diskon & pajak", u: 0.6, v: -2.4 });
  S.snap({ note: "Logika ini dijalankan di kasir atau di server?", tone: "keep", metrics: {}, dur: 2200 });
  steps.push(S.take());

  // 2 — fat client
  S.set("logic", { u: -3.6, v: -2.2, label: "Logika di klien" });
  S.set("k1", { sub: "PC kuat · Rp 9 jt", state: "hl" });
  S.set("k2", { sub: "PC kuat · Rp 9 jt" });
  S.snap({ note: "Fat client: logika aplikasi berjalan di PC kasir", metrics: M(0.6, 25, 120, 20), dur: 1800 });
  S.snap({ note: "Klien harus menarik tabel harga & diskon (120 KB) untuk menghitung sendiri", tone: "alert", flows: [{ path: ["db", "srv", "sw", "k1"], kind: "file", dur: 2 }], metrics: M(0.6, 25, 120, 20), dur: 2400 });
  steps.push(S.take());

  // 3 — thin client
  S.set("logic", { u: 3.2, v: -3.2, label: "Logika di server" });
  S.set("k1", { sub: "hanya UI · Rp 4 jt", state: null });
  S.set("k2", { sub: "hanya UI · Rp 4 jt" });
  S.set("srv", { sub: "CPU 55%", subTone: "warn" });
  S.snap({ note: "Thin client: logika pindah ke server, klien hanya antarmuka", metrics: M(0.45, 55, 6, 0), dur: 1800 });
  S.snap({ note: "Kiriman kecil (6 KB), tapi setiap aksi menunggu perjalanan bolak-balik ke server", flows: [{ path: ["k1", "sw", "srv"], kind: "req", dur: 1.1 }, { path: ["srv", "sw", "k1"], kind: "res", dur: 1.1, delay: 0.55 }], metrics: M(0.45, 55, 6, 0), dur: 2400 });
  steps.push(S.take());

  // 4 — two-tier
  S.s.zones = [
    { id: "t1", label: "TIER 1 · KLIEN: ANTARMUKA", u0: -6.4, v0: 0.6, u1: -0.4, v1: 4.4, theme: "blue" },
    { id: "t2", label: "TIER 2 · SERVER: DATA", u0: 1.6, v0: -2.8, u1: 7.0, v1: 2.2, theme: "teal" }
  ];
  S.set("logic", { u: 0.6, v: -2.6, label: "Logika: di klien, server, atau dibagi" });
  S.snap({ note: "Two-tier: antarmuka di klien, data di server", metrics: M(0.45, 55, 6, 0), dur: 2200 });
  steps.push(S.take());

  // 5 — three-tier
  S.s.nodes = S.s.nodes.filter((n) => n.id !== "logic");
  S.set("srv", { u: 5.0, v: -1.6, sub: "CPU 30%", subTone: "ok" });
  S.set("db", { u: 7.2, v: 0.2 });
  S.s.nodes.push({ id: "app", kind: "app", label: "Application server", sub: "logika bisnis", u: 1.6, v: -0.6 });
  S.s.edges = [{ a: "k1", b: "sw" }, { a: "k2", b: "sw" }, { a: "sw", b: "app" }, { a: "app", b: "srv" }, { a: "srv", b: "db" }];
  S.s.zones = [
    { id: "t1", label: "TIER 1 · KLIEN", u0: -6.4, v0: 0.4, u1: -0.4, v1: 4.4, theme: "blue" },
    { id: "t2", label: "TIER 2 · APLIKASI", u0: 0.2, v0: -2.6, u1: 3.2, v1: 1.4, theme: "violet" },
    { id: "t3", label: "TIER 3 · DATA", u0: 3.8, v0: -3.4, u1: 8.6, v1: 1.8, theme: "teal" }
  ];
  S.snap({ note: "Three-tier: lapisan tengah (application server) menjalankan logika", metrics: M(0.36, 30, 6, 0), dur: 2000 });
  S.snap({ note: "Kasir → application server → database, lalu kembali", flows: [{ path: ["k1", "sw", "app"], kind: "req", dur: 1 }, { path: ["app", "srv"], kind: "req", dur: 0.7, delay: 0.6 }, { path: ["srv", "app"], kind: "res", dur: 0.7, delay: 1.1 }, { path: ["app", "sw", "k1"], kind: "res", dur: 1, delay: 1.6 }], metrics: M(0.36, 30, 6, 0), dur: 2600 });
  steps.push(S.take());

  // 6 — middleware
  S.s.nodes.push(
    { id: "mw", kind: "box", theme: "violet", label: "Middleware", sub: "menerjemahkan format", u: 3.6, v: 2.8 },
    { id: "leg", kind: "mainframe", label: "Sistem gudang lama", sub: "format COBOL", u: 7.0, v: 3.6 }
  );
  S.s.edges.push({ a: "app", b: "mw" }, { a: "mw", b: "leg" });
  S.snap({ note: "Middleware menghubungkan aplikasi baru dengan sistem lama", flows: [{ path: ["app", "mw", "leg"], kind: "req", dur: 1.6 }, { path: ["leg", "mw", "app"], kind: "res", dur: 1.6, delay: 0.8 }], metrics: M(0.36, 30, 6, 0), dur: 2600 });
  steps.push(S.take());

  // 7 — SOLUSI: baseline 30% beban
  S.drop("mw", "leg");
  S.snap({ note: "20 kasir · 30 transaksi/menit: beban 30%, respons 0,36 dtk", tone: "done", flows: [{ path: ["k1", "sw", "app", "srv"], kind: "req", dur: 1.6 }, { path: ["srv", "app", "sw", "k1"], kind: "res", dur: 1.6, delay: 0.8 }], card: KNEE([mk(30)]), metrics: M(r2(resp(30)), 30, 6, 0), dur: 2600 });
  steps.push(S.take());

  // 8 — KASUS: knee of the curve
  const peak = (load, tone, note) => {
    S.set("srv", { sub: "CPU " + load + "%", subTone: tone === "err" ? "err" : tone === "warn" ? "warn" : "ok", state: tone === "err" ? "busy" : null });
    S.snap({ note, tone: tone === "ok" ? "" : "alert", flows: [{ path: ["k1", "sw", "app", "srv"], kind: "req", dur: 1.2, count: Math.max(1, Math.round(load / 25)) }], card: KNEE([mk(load, null, tone)]), metrics: M(r2(resp(load)), load, 6, 0), dur: 2000 });
  };
  peak(50, "ok", "Promo gajian: 50 transaksi/menit → 0,5 dtk");
  peak(70, "warn", "70 transaksi/menit → 0,83 dtk, masih wajar");
  peak(90, "err", "90 transaksi/menit → 2,5 dtk: kasir mulai menunggu");
  peak(97, "err", "97% kapasitas → 8,3 dtk: antrean mengular");
  S.snap({ note: "Coba sendiri: geser jumlah transaksi per menit", tone: "keep", flows: [], card: { type: "lab", at: "center", lab: "knee", title: "Lab: knee of the curve", sub: "Kapasitas server **100 transaksi/menit**. Geser beban dan amati waktu respons." }, metrics: M(r2(resp(97)), 97, 6, 0), dur: 800 });
  steps.push(S.take());

  // 9 — KASUS: memperbaiki kinerja
  S.set("srv", { sub: "CPU 60%", subTone: "warn", state: null, label: "Server Setiabudi" });
  S.set("k1", { sub: "cache daftar harga" });
  S.s.nodes.push({ id: "srv2", kind: "server", label: "Server Marelan", sub: "DDBMS", subTone: "info", u: 5.4, v: 3.2, sparkle: true });
  S.s.edges.push({ a: "srv2", b: "app" }, { a: "srv2", b: "db", kind: "logic" });
  S.snap({ note: "Daftar harga disimpan di kasir, data dibagi per cabang (DDBMS)", tone: "done", flows: [{ path: ["k1", "sw", "app", "srv"], kind: "req", dur: 1.6 }, { path: ["app", "srv2"], kind: "req", dur: 0.9, delay: 0.8 }], card: KNEE([mk(97, "sebelum", "err"), mk(60, "sesudah: " + r2(resp(60)).toLocaleString("id-ID") + " dtk", "ok")]), metrics: M(r2(resp(60)), 60, 6, 0), dur: 2600 });
  steps.push(S.take());

  // 10 — RANGKUMAN
  S.snap({
    note: null, flows: [], metrics: M(r2(resp(60)), 60, 6, 0), dur: 900,
    card: {
      type: "table", at: "center", title: "Membagi pekerjaan klien dan server",
      cols: ["Pilihan", "Kelebihan", "Kekurangan"],
      rows: [
        ["Fat client", "Server ringan, klien bisa bekerja mandiri", "PC mahal; 20 PC di-update tiap ada perubahan"],
        ["Thin client", "PC murah; cukup update server", "Beban server & latensi jaringan naik"],
        ["Two-tier", "Sederhana: UI di klien, data di server", "Logika bercampur, sulit diskalakan"],
        ["Three-tier", "Logika terpusat di application server, mudah diskalakan", "Lebih banyak komponen"],
        ["Middleware", "Menghubungkan sistem baru dan sistem lama", "Lapisan tambahan yang perlu dikelola"]
      ],
      rowTone: { 3: "ok" },
      foot: "Rancang klien agar **menghubungi server hanya bila perlu**, karena waktu respons melonjak setelah melewati *knee of the curve*."
    }
  });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "client-server",
    renderer: "net",
    title: "Client/Server: Membagi Pekerjaan",
    subtitle: "Putuskan di mana logika aplikasi kasir MartKita dijalankan, lalu lihat kenapa server tiba-tiba melambat ketika bebannya mendekati kapasitas.",
    minutes: 16,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Fat client vs thin client", at: 2 },
      { text: "Two-tier vs three-tier", at: 4 },
      { text: "Peran middleware", at: 5 },
      { text: "Knee of the curve dan waktu respons", at: 7 },
      { text: "Cara meningkatkan kinerja client/server (cache, DDBMS)", at: 8 }
    ],
    metrics: [
      { key: "load", label: "Beban server", unit: "%", icon: "◔" },
      { key: "kb", label: "Data per transaksi", unit: "KB", icon: "⇅" },
      { key: "upd", label: "PC di-update", icon: "⟳" },
      { key: "resp", label: "Waktu respons", unit: "dtk", dec: 2, icon: "⏱", total: true }
    ],
    legend: [
      { color: "#6366f1", round: true, label: "Permintaan" },
      { color: "#f59e0b", round: true, label: "Balasan" },
      { color: "#f97316", round: true, label: "Data besar" }
    ],
    labs: {
      knee(el, { h, chart }) {
        const out = h("output", null, "");
        const input = h("input", { type: "range", min: 0, max: 98, value: 70, "aria-label": "Transaksi per menit" });
        const badge = h("div", { class: "lab-badge" });
        const c = h("div", { class: "net-chart" });
        el.append(h("div", { class: "lab-row" }, h("label", null, "Transaksi per menit"), input, out), badge, c);
        const update = () => {
          const load = +input.value, r = resp(load);
          out.textContent = load + " / 100";
          const tone = r > 2 ? "err" : r > 0.8 ? "warn" : "ok";
          badge.className = "lab-badge t-" + tone;
          badge.textContent = "Beban " + load + "% → respons " + r2(r).toLocaleString("id-ID") + " detik" + (tone === "err" ? " · kasir mengantre!" : tone === "warn" ? " · mulai terasa" : " · lancar");
          chart(c, KNEE([mk(load, null, tone)]));
        };
        input.addEventListener("input", update);
        update();
        return () => input.removeEventListener("input", update);
      }
    },
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Siapa kerja?", title: "Klien atau server?",
        text: [
          "MartKita memakai arsitektur client/server: 20 PC kasir (klien) dan satu server database. Ada logika yang harus ditempatkan: **menghitung diskon dan pajak** setiap belanjaan.",
          "Hubungan client/server harus menetapkan **bagaimana pemrosesan dibagi**. Pilihan ini memengaruhi harga PC, beban server, lalu lintas jaringan, dan kecepatan kasir."
        ],
        changed: [["+", "20 kasir, switch, server database"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Fat client", title: "Fat client (thick client)",
        text: [
          "**Fat client** menempatkan semua atau sebagian besar logika di klien. Server cukup menyimpan data, sehingga bebannya ringan (25%).",
          "Akibatnya, setiap kasir butuh PC yang kuat (Rp 9 juta), harus menarik tabel harga dan diskon (**120 KB**), dan **20 PC harus di-update** setiap kali aturan diskon berubah."
        ],
        changed: [["+", "Logika di PC kasir"], ["~", "Data per transaksi → 120 KB"], ["~", "PC di-update → 20"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Thin client", title: "Thin client",
        text: [
          "**Thin client** memindahkan logika ke server. Kasir cukup menampilkan antarmuka, PC-nya murah (Rp 4 juta), dan perubahan aturan cukup dilakukan sekali di server.",
          "Kirimannya kecil (6 KB), tetapi beban server naik ke 55% dan setiap aksi harus menunggu perjalanan bolak-balik di jaringan. Slide menyebut ini masalah **latency**."
        ],
        changed: [["~", "Logika pindah ke server"], ["~", "Data per transaksi 120 → 6 KB"], ["~", "PC di-update 20 → 0"], ["~", "Beban server 25% → 55%"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Two-tier", title: "Two-tier",
        text: [
          "Dalam desain **two-tier**, antarmuka berada di klien dan semua data di server. Logika aplikasi bisa berjalan di server, di klien, atau dibagi keduanya.",
          "Desain ini sederhana, tetapi logika bisnis bercampur dengan antarmuka atau database, sehingga sulit dikembangkan saat sistem tumbuh."
        ],
        changed: [["+", "Tier 1: klien · Tier 2: server"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Three-tier", title: "Three-tier: lapisan tengah",
        text: [
          "**Three-tier** menambahkan lapisan tengah, yaitu **application server**, yang menjalankan logika bisnis. Klien menangani antarmuka, server database menyimpan data.",
          "Beban terbagi: server database turun ke 30%, dan respons menjadi **0,36 detik**. Jika transaksi bertambah, cukup tambah application server."
        ],
        callout: { type: "IDE KUNCI", text: "Pada three-tier, perubahan aturan bisnis cukup dilakukan di satu tempat: application server." },
        changed: [["+", "Application server (tier 2)"], ["~", "Beban server database 55% → 30%"], ["~", "Respons 0,45 → 0,36 dtk"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Middleware", title: "Middleware",
        text: [
          "Gudang MartKita masih memakai sistem lama dengan format data berbeda. **Middleware** menjembatani keduanya: menerjemahkan permintaan dari application server ke format sistem lama, lalu sebaliknya.",
          "Slide menyebut middleware menghubungkan dua atau lebih komponen software dalam arsitektur *federated*."
        ],
        changed: [["+", "Middleware + sistem gudang lama"]],
        frames: steps[5]
      },
      {
        kind: "SOLUSI", short: "Baseline", title: "Three-tier untuk 20 kasir",
        text: [
          "Pada hari biasa: 20 kasir, **30 transaksi per menit**, sementara kapasitas server 100 transaksi per menit. Beban 30% dan waktu respons **0,36 detik**.",
          "Grafik di kanan memperlihatkan hubungan beban dan waktu respons. Titiknya kini berada di bagian yang masih landai."
        ],
        changed: [["~", "Baseline: beban 30%, respons 0,36 dtk"]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "Knee", title: "Kasus: promo gajian",
        text: [
          "Promo gajian menaikkan transaksi. Dari 30% ke 70%, respons hanya naik dari 0,36 menjadi 0,83 detik. Dari 90% ke 97%, respons melonjak dari 2,5 menjadi **8,3 detik**.",
          "Titik tempat kurva tiba-tiba menanjak disebut **knee of the curve**. Di frame terakhir, geser slider dan rasakan sendiri seberapa curam lonjakannya."
        ],
        callout: { type: "IDE KUNCI", text: "Waktu respons client/server naik tajam saat sistem mendekati kapasitasnya, bukan naik merata." },
        changed: [["~", "Beban 30% → 97%"], ["~", "Respons 0,36 → 8,33 dtk"]],
        frames: steps[7]
      },
      {
        kind: "KASUS", short: "Perbaikan", title: "Kasus: kurangi panggilan ke server",
        text: [
          "Dua perbaikan sesuai slide: klien dirancang agar **menghubungi server hanya bila perlu** (daftar harga disimpan di kasir dan diperbarui tiap malam), dan data dibagi ke lebih dari satu lokasi dengan **DDBMS**.",
          "Beban turun dari 97% ke 60%, dan respons kembali ke **0,63 detik**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Distributed DBMS (DDBMS) menyimpan data di lebih dari satu lokasi sehingga beban tidak menumpuk di satu server." },
        changed: [["+", "Cache harga di kasir"], ["+", "Server Marelan (DDBMS)"], ["~", "Beban 97% → 60%"], ["~", "Respons 8,33 → 0,63 dtk"]],
        frames: steps[8]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Membagi pekerjaan dengan bijak",
        text: ["Fat client meringankan server tetapi mahal di sisi klien. Thin client sebaliknya. Three-tier memisahkan logika agar mudah dikelola, dan kinerja dijaga dengan menjauhi knee of the curve."],
        bullets: [
          "Client/server membagi pemrosesan antara klien dan server.",
          "Fat client: logika di klien. Thin client: logika di server.",
          "Two-tier: UI di klien, data di server. Three-tier: tambah application server.",
          "Middleware menghubungkan komponen dan sistem lama.",
          "Waktu respons melonjak setelah knee of the curve; kurangi panggilan ke server."
        ],
        quiz: [
          { q: "Aturan diskon berubah setiap bulan. Desain mana yang paling sedikit memerlukan pembaruan di PC kasir?", options: ["Fat client", "Thin client atau three-tier", "PC mandiri", "Mainframe tanpa jaringan"], answer: 1, why: "Logikanya berada di server (atau application server), jadi cukup diubah di satu tempat." },
          { q: "Beban server naik dari 30% ke 60%, lalu dari 60% ke 90%. Kenaikan mana yang menambah waktu respons paling banyak?", options: ["30% → 60%", "60% → 90%", "Sama saja", "Tidak berubah"], answer: 1, why: "Di dekat kapasitas, kurva menanjak tajam: 0,36 → 0,63 detik, lalu 0,63 → 2,5 detik." },
          { q: "Lapisan tengah pada desain three-tier disebut…", options: ["Middleware", "Application server", "Switch", "Terminal"], answer: 1, why: "Three-tier memiliki application server di antara klien dan server data." }
        ],
        changed: [],
        frames: steps[9]
      }
    ],
    next: "**Pemrosesan Online vs Batch**: kasir yang langsung memperbarui stok, dan laporan yang diproses malam hari."
  });
})();
