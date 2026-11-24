/* Pelajaran: Evolusi Arsitektur Sistem (Modul 08 · Sesi 15–16 · Bab 9 · LO 3)
 * Mengikuti slide "System Architecture": The Evolution of System Architecture, Client/Server,
 * dan The Impact of the Internet (Tilley, 2025). Angka KB dan jumlah pengguna adalah ilustrasi.
 */
(function () {
  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  const steps = [];
  const M = (users, central, kb) => ({ users, central, kb });

  // 1 — MASALAH: tiga fungsi, di mana dijalankan?
  S.s.nodes = [
    { id: "ui", kind: "token", label: "Antarmuka pengguna", u: -3.4, v: 0.4 },
    { id: "logic", kind: "token", label: "Logika aplikasi", u: 0, v: -0.6 },
    { id: "data", kind: "token", label: "Penyimpanan data", u: 3.4, v: 0.4 }
  ];
  S.snap({ note: "Setiap sistem informasi menjalankan 3 fungsi", metrics: {}, dur: 1800 });
  S.snap({ note: "Pertanyaan arsitektur: di komputer mana masing-masing dijalankan?", tone: "keep", metrics: {}, dur: 1600 });
  steps.push(S.take());

  // 2 — mainframe & terminal
  const T = [[-4.2, 2.8], [-1.5, 3.3], [1.5, 3.3], [4.2, 2.8]];
  S.s.nodes = [{ id: "mf", kind: "mainframe", label: "Mainframe", sub: "UI · logika · data", u: 0, v: -0.4 }]
    .concat(T.map(([u, v], i) => ({ id: "t" + i, kind: "terminal", label: "Terminal " + (i + 1), u, v })));
  S.s.zones = [{ id: "dpc", label: "PUSAT PENGOLAHAN DATA", u0: -1.9, v0: -2.2, u1: 1.9, v1: 1.3, theme: "violet" }];
  S.s.edges = T.map((_, i) => ({ a: "t" + i, b: "mf" }));
  S.snap({ note: "Semua pemrosesan terjadi di mainframe", metrics: M(20, 3, 2), dur: 1800 });
  S.snap({ note: "Terminal hanya mengirim ketikan dan menampilkan layar", flows: [{ path: ["t0", "mf"], kind: "req" }, { path: ["mf", "t0"], kind: "res", delay: 0.6 }, { path: ["t3", "mf"], kind: "req", delay: 0.3 }, { path: ["mf", "t3"], kind: "res", delay: 0.9 }], metrics: M(20, 3, 2), dur: 2200 });
  steps.push(S.take());

  // 3 — PC mandiri
  const P = [[-4.6, 0.6], [-1.6, 0.6], [1.6, 0.6], [4.6, 0.6]];
  const stok = ["120", "118", "121", "120"];
  S.s.zones = [];
  S.s.edges = [];
  S.s.nodes = P.map(([u, v], i) => ({ id: "pc" + i, kind: "pc", label: "Kasir " + (i + 1), sub: "stok kopi: " + stok[i], u, v }));
  S.snap({ note: "Setiap PC bekerja sendiri dengan datanya sendiri", metrics: M(1, 0, 0), dur: 1800 });
  P.forEach((_, i) => S.set("pc" + i, { subTone: stok[i] === "120" ? null : "err" }));
  S.snap({ note: "Datanya tidak sinkron: stok yang sama tercatat berbeda", tone: "alert", metrics: M(1, 0, 0), dur: 2000 });
  steps.push(S.take());

  // 4 — LAN: berbagi data dan printer
  const L = [[-4.6, 2.9], [-1.6, 3.3], [1.6, 3.3], [4.6, 2.9]];
  S.s.nodes = [
    { id: "sw", kind: "switch", label: "Switch", u: 0, v: 0.9 },
    { id: "fs", kind: "server", label: "File server", sub: "stok.dbf · 500 KB", u: -2.3, v: -1.6 },
    { id: "pr", kind: "printer", label: "Printer bersama", u: 2.4, v: -1.2 }
  ].concat(L.map(([u, v], i) => ({ id: "pc" + i, kind: "pc", label: "Kasir " + (i + 1), u, v })));
  S.s.zones = [{ id: "lan", label: "LAN TOKO KITA SETIABUDI", u0: -6.3, v0: -3.2, u1: 6.3, v1: 4.4, theme: "blue" }];
  S.s.edges = [{ a: "fs", b: "sw" }, { a: "pr", b: "sw" }].concat(L.map((_, i) => ({ a: "pc" + i, b: "sw" })));
  S.snap({ note: "LAN: satu file data dan satu printer dipakai bersama", metrics: M(20, 1, 0), dur: 1800 });
  S.snap({ note: "Tetapi setiap transaksi memindahkan seluruh file (500 KB)", tone: "alert", flows: [{ path: ["fs", "sw", "pc0"], kind: "file", dur: 1.8 }], marks: {}, metrics: M(20, 1, 500), dur: 2200 });
  steps.push(S.take());

  // 5 — WAN: menghubungkan cabang
  S.s.nodes = [
    { id: "fs", kind: "server", label: "File server", sub: "stok.dbf · 500 KB", u: -4.3, v: -1.5 },
    { id: "ra", kind: "router", label: "Router", u: -2.0, v: 0.9 },
    { id: "a1", kind: "pc", label: "Kasir Setiabudi", u: -5.3, v: 2.5 },
    { id: "a2", kind: "pc", label: "Gudang", u: -2.9, v: 3.2 },
    { id: "rb", kind: "router", label: "Router", u: 2.2, v: 0.9 },
    { id: "b1", kind: "pc", label: "Kasir Marelan", u: 3.3, v: 3.0 },
    { id: "b2", kind: "pc", label: "Kasir Marelan 2", u: 5.5, v: 2.1 }
  ];
  S.s.zones = [
    { id: "za", label: "LAN SETIABUDI", u0: -6.9, v0: -3.1, u1: -0.9, v1: 4.4, theme: "blue" },
    { id: "zb", label: "LAN MARELAN", u0: 1.0, v0: -0.9, u1: 7.0, v1: 4.4, theme: "teal" }
  ];
  S.s.edges = [{ a: "fs", b: "ra" }, { a: "a1", b: "ra" }, { a: "a2", b: "ra" }, { a: "b1", b: "rb" }, { a: "b2", b: "rb" }, { a: "ra", b: "rb", kind: "wan", label: "WAN · 14 km" }];
  S.snap({ note: "WAN menghubungkan LAN yang berjauhan", metrics: M(60, 1, 500), dur: 1900 });
  S.snap({ note: "File 500 KB kini menyeberang WAN untuk setiap transaksi", tone: "alert", flows: [{ path: ["fs", "ra"], kind: "file", dur: 1 }, { path: ["ra", "rb"], kind: "file", arc: 0.9, dur: 1.6, delay: 0.5 }, { path: ["rb", "b1"], kind: "file", dur: 1, delay: 1.2 }], metrics: M(60, 1, 500), dur: 2400 });
  steps.push(S.take());

  // 6 — SOLUSI: client/server
  S.set("fs", { kind: "server", label: "Server database", sub: "DBMS" });
  S.s.nodes.push({ id: "db", kind: "db", label: "Data", u: -6.0, v: 0.6 });
  S.s.edges.push({ a: "db", b: "fs" });
  S.snap({ note: "Server menyimpan data dan menjalankan DBMS", metrics: M(60, 2, 500), dur: 1600 });
  S.snap({ note: "Klien hanya mengirim permintaan; server membalas baris yang diminta (8 KB)", tone: "done", flows: [{ path: ["b1", "rb"], kind: "req", dur: 0.9 }, { path: ["rb", "ra"], kind: "req", arc: 0.9, dur: 1.2, delay: 0.4 }, { path: ["ra", "fs"], kind: "req", dur: 0.8, delay: 1 }, { path: ["fs", "ra"], kind: "res", dur: 0.8, delay: 1.6 }, { path: ["ra", "rb"], kind: "res", arc: 0.9, dur: 1.2, delay: 2 }, { path: ["rb", "b1"], kind: "res", dur: 0.9, delay: 2.6 }], metrics: M(60, 2, 8), dur: 2600 });
  steps.push(S.take());

  // 7 — Internet & web
  S.s.zones = [{ id: "dc", label: "DATA CENTER TOKO KITA", u0: -7.6, v0: -2.8, u1: -1.6, v1: 2.6, theme: "violet" }];
  S.s.nodes = [
    { id: "web", kind: "server", label: "Web server", sub: "membuat halaman", u: -3.2, v: -0.8 },
    { id: "db", kind: "db", label: "Database", u: -6.3, v: 0.7 },
    { id: "net", kind: "cloud", label: "Internet", u: 0.9, v: -0.4 },
    { id: "lap", kind: "laptop", label: "Laptop manajer", u: 4.6, v: -1.8 },
    { id: "hp", kind: "phone", label: "HP pelanggan", u: 5.2, v: 1.6 },
    { id: "ks", kind: "pc", label: "Kasir (browser)", u: 2.2, v: 3.0 }
  ];
  S.s.edges = [{ a: "db", b: "web" }, { a: "web", b: "net", kind: "wan" }, { a: "net", b: "lap", kind: "wifi" }, { a: "net", b: "hp", kind: "wifi" }, { a: "net", b: "ks", kind: "wan" }];
  S.snap({ note: "Antarmuka kini dibuat server; perangkat cukup punya browser", metrics: M(500, 3, 40), dur: 2000 });
  S.snap({ note: "Pelanggan memesan dari HP: halaman web dikirim lewat Internet", flows: [{ path: ["hp", "net"], kind: "req", arc: 0.45, dur: 1 }, { path: ["net", "web"], kind: "req", arc: 0.9, dur: 1.2, delay: 0.5 }, { path: ["web", "net"], kind: "res", arc: 0.9, dur: 1.2, delay: 1.2 }, { path: ["net", "hp"], kind: "res", arc: 0.45, dur: 1, delay: 1.8 }], metrics: M(500, 3, 40), dur: 2400 });
  steps.push(S.take());

  // 8 — KASUS: cloud saat lonjakan
  S.s.zones = [{ id: "dc", label: "CLOUD PROVIDER", u0: -8.4, v0: -3.2, u1: -1.4, v1: 3.2, theme: "teal" }];
  S.set("web", { sub: "CPU 97%", subTone: "err", state: "busy" });
  S.set("hp", { label: "5.000 pelanggan", sub: "Harbolnas 12.12", subTone: "warn" });
  S.snap({ note: "Harbolnas: pengguna 500 → 5.000, server kewalahan", tone: "alert", flows: [{ path: ["hp", "net"], kind: "req", arc: 0.45, dur: 0.7, count: 3 }, { path: ["net", "web"], kind: "req", arc: 0.9, dur: 0.9, count: 3 }], metrics: M(5000, 3, 40), dur: 2200 });
  S.set("web", { sub: "CPU 38%", subTone: "ok", state: null, label: "Web server 1" });
  S.s.nodes.push(
    { id: "web2", kind: "server", label: "Web server 2", sub: "CPU 36%", subTone: "ok", u: -5.6, v: -2.3, sparkle: true },
    { id: "web3", kind: "server", label: "Web server 3", sub: "CPU 40%", subTone: "ok", u: -3.5, v: 2.3, sparkle: true }
  );
  S.s.edges.push({ a: "web2", b: "net", kind: "wan" }, { a: "web3", b: "net", kind: "wan" }, { a: "db", b: "web2" }, { a: "db", b: "web3" });
  S.snap({ note: "Cloud menambah server otomatis (scaling on demand)", tone: "done", flows: [{ path: ["net", "web"], kind: "req", arc: 0.9, dur: 1 }, { path: ["net", "web2"], kind: "req", arc: 0.9, dur: 1, delay: 0.3 }, { path: ["net", "web3"], kind: "req", arc: 0.9, dur: 1, delay: 0.6 }], metrics: M(5000, 3, 40), dur: 2400 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  S.snap({
    note: null, metrics: M(5000, 3, 40), dur: 900, flows: [],
    card: {
      at: "center", type: "table", title: "Di mana tiga fungsi itu dijalankan?",
      sub: "Arsitektur berevolusi dari terpusat, menyebar, lalu kembali terpusat di server/cloud.",
      cols: ["Arsitektur", "Antarmuka", "Logika", "Data"],
      rows: [
        ["Mainframe + terminal", "Pusat", "Pusat", "Pusat"],
        ["PC mandiri", "PC", "PC", "PC (salinan sendiri)"],
        ["LAN (file sharing)", "PC", "PC", "Server (file)"],
        ["Client/server", "Klien", "Dibagi", "Server + DBMS"],
        ["Web & cloud", "Server (browser menampilkan)", "Server", "Server/cloud"]
      ],
      rowTone: { 3: "ok" },
      foot: "Slide: **client/server** membagi pemrosesan antara klien dan server; **Internet** memindahkan tanggung jawab antarmuka dari klien ke server."
    }
  });
  steps.push(S.take());

  const fin = (k) => steps[k][steps[k].length - 1].metrics;

  Kelas.registerLesson({
    slug: "evolusi-arsitektur",
    renderer: "net",
    title: "Evolusi Arsitektur: dari Mainframe ke Cloud",
    subtitle: "Ikuti sistem penjualan MartKita berpindah dari satu mainframe, ke PC dan jaringan, ke client/server, lalu ke Internet dan cloud, dan perhatikan di mana pekerjaan dilakukan.",
    minutes: 15,
    level: "Pemula",
    lo: "LO 3",
    learn: [
      { text: "Tiga fungsi setiap sistem: antarmuka, logika, data", at: 0 },
      { text: "Mainframe dan terminal: semua pemrosesan terpusat", at: 1 },
      { text: "PC, LAN, dan WAN: berbagi data dan perangkat", at: 4 },
      { text: "Client/server: pemrosesan dibagi klien dan server", at: 5 },
      { text: "Dampak Internet dan cloud computing", at: 7 }
    ],
    metrics: [
      { key: "central", label: "Fungsi di pusat", unit: "/ 3", icon: "◎" },
      { key: "kb", label: "Data per transaksi", unit: "KB", icon: "⇅" },
      { key: "users", label: "Pengguna terhubung", icon: "◆", total: true }
    ],
    legend: [
      { color: "#6366f1", round: true, label: "Permintaan" },
      { color: "#f59e0b", round: true, label: "Balasan" },
      { color: "#f97316", round: true, label: "File utuh" },
      { color: "#8b5cf6", label: "WAN / Internet" }
    ],
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "3 fungsi", title: "Di mana sistem bekerja?",
        text: [
          "MartKita, jaringan minimarket di Medan, membutuhkan sistem penjualan. Apa pun bentuknya, setiap sistem informasi menjalankan **tiga fungsi**: menyediakan antarmuka bagi pengguna, menjalankan logika aplikasi, dan menyimpan serta mengakses data.",
          "Tugas analis sistem: menentukan **di mana** setiap fungsi dijalankan, lalu menimbang untung-ruginya. Itulah inti arsitektur sistem."
        ],
        callout: { type: "IDE KUNCI", text: "Arsitektur sistem menerjemahkan desain logis menjadi struktur fisik: hardware, software, data, jaringan, metode pemrosesan, dan keamanan." },
        changed: [["+", "Tiga fungsi: antarmuka, logika, data"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Mainframe", title: "Mainframe dan terminal",
        text: [
          "Arsitektur paling awal: satu **mainframe** di pusat pengolahan data menjalankan ketiga fungsi. Terminal di lokasi lain hanya mengirim ketikan dan menerima tampilan layar.",
          "Hanya sekitar **2 KB** yang lewat jaringan per transaksi, tetapi seluruh beban dan risiko ada di satu mesin."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Server adalah komputer yang menyediakan data atau layanan bagi komputer lain (klien). Mainframe adalah server paling awal." },
        changed: [["+", "Mainframe + 4 terminal (mewakili 20)"], ["~", "Fungsi di pusat → 3/3"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "PC mandiri", title: "PC mandiri: produktif tapi terpisah",
        text: [
          "PC membuat setiap kasir bisa bekerja sendiri tanpa menunggu mainframe. Ketiga fungsi pindah ke masing-masing PC.",
          "Masalahnya, setiap PC menyimpan salinan datanya sendiri. Stok kopi yang sama tercatat **120, 118, dan 121**. Tidak ada satu versi data yang benar."
        ],
        callout: { type: "IDE KUNCI", text: "PC meningkatkan produktivitas, dan justru kebutuhan berbagi data inilah yang mendorong lahirnya jaringan dan arsitektur client/server." },
        changed: [["-", "Mainframe"], ["~", "Fungsi di pusat 3 → 0"], ["+", "Data tidak sinkron"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "LAN", title: "LAN: berbagi data dan perangkat",
        text: [
          "**Local area network (LAN)** menghubungkan PC di satu gedung sehingga satu file data dan satu printer bisa dipakai bersama.",
          "Pada pola berbagi file, server hanya menyimpan file. Setiap kali kasir membuka data stok, **seluruh file 500 KB** berpindah ke PC-nya, karena pemrosesan tetap dilakukan di PC."
        ],
        changed: [["+", "Switch, file server, printer bersama"], ["~", "Data per transaksi 0 → 500 KB"], ["~", "Fungsi di pusat 0 → 1"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "WAN", title: "WAN: menghubungkan cabang",
        text: [
          "MartKita membuka cabang Marelan. **Wide area network (WAN)** menghubungkan LAN Setiabudi dan LAN Marelan yang terpisah 14 km, bahkan bisa lintas benua.",
          "Kini **60 pengguna** berbagi data yang sama. Tetapi file 500 KB yang menyeberang WAN untuk setiap transaksi membuat jaringan lambat."
        ],
        changed: [["+", "LAN Marelan + router + jalur WAN"], ["~", "Pengguna 20 → 60"]],
        frames: steps[4]
      },
      {
        kind: "SOLUSI", short: "Client/server", title: "Client/server: bagi pekerjaannya",
        text: [
          "Dalam **client/server**, klien menangani seluruh antarmuka, sedangkan server menyimpan data dan menjalankan DBMS. Klien cukup mengirim permintaan, dan server mengembalikan hanya baris yang dibutuhkan.",
          "Data per transaksi turun dari 500 KB menjadi **8 KB**, padahal pengguna tetap 60. Logika aplikasi bisa di klien, di server, atau dibagi keduanya."
        ],
        callout: { type: "IDE KUNCI", text: "Client/server membagi pemrosesan antara klien yang terhubung jaringan dan server pusat." },
        changed: [["~", "File server → server database (DBMS)"], ["~", "Data per transaksi 500 → 8 KB"], ["~", "Fungsi di pusat 1 → 2"]],
        frames: steps[5]
      },
      {
        kind: "TEKNIK", short: "Internet", title: "Dampak Internet",
        text: [
          "Dengan arsitektur berbasis Internet, **antarmuka pun dibuat oleh server**. Laptop manajer, HP pelanggan, dan PC kasir cukup memakai browser, tanpa memasang aplikasi.",
          "Satu halaman web berukuran sekitar 40 KB, lebih besar daripada balasan client/server. Sebagai gantinya, perangkat klien jadi lebih murah dan sederhana, dan pengguna bertambah menjadi **500**, termasuk pelanggan."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Memindahkan tanggung jawab antarmuka dari klien ke server menyederhanakan transmisi data dan menurunkan biaya serta kerumitan hardware klien." },
        changed: [["+", "Web server, Internet, laptop & HP"], ["~", "Fungsi di pusat 2 → 3"], ["~", "Pengguna 60 → 500"]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "Lonjakan", title: "Kasus: lonjakan Harbolnas",
        text: [
          "Promo Harbolnas 12.12: pengguna melonjak dari 500 menjadi **5.000**. Satu web server mencapai CPU 97% dan pelanggan mulai menunggu.",
          "Di **cloud computing**, server disewa dari penyedia pihak ketiga dan bisa ditambah sesuai kebutuhan (*scaling on demand*). Dua server baru muncul dan beban turun ke sekitar 40%."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Cloud menghilangkan masalah kompatibilitas dan bisa diskalakan, tetapi bisa membutuhkan bandwidth lebih besar daripada jaringan client/server biasa." },
        changed: [["~", "Pengguna 500 → 5.000"], ["+", "Web server 2 dan 3 (otomatis)"], ["~", "CPU 97% → ±40%"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Dari terpusat, menyebar, lalu terpusat lagi",
        text: ["Dari " + fin(1).users + " pengguna terminal hingga " + fmtN(fin(7).users) + " pengguna web, arsitektur terus memindahkan tiga fungsi yang sama. Data per transaksi sempat 500 KB pada pola berbagi file, lalu turun ke 8 KB berkat client/server."],
        bullets: [
          "Mainframe: semua fungsi di pusat; terminal hanya tampilan.",
          "PC mandiri produktif, tetapi datanya tidak sinkron.",
          "LAN/WAN memungkinkan berbagi data dan perangkat.",
          "Client/server membagi pekerjaan: klien untuk antarmuka, server untuk data.",
          "Internet dan cloud memusatkan kembali pemrosesan di server yang bisa diskalakan."
        ],
        quiz: [
          { q: "Tiga fungsi yang harus dijalankan setiap sistem informasi adalah…", options: ["Input, output, printer", "Antarmuka, logika aplikasi, penyimpanan data", "LAN, WAN, Internet", "Klien, server, router"], answer: 1, why: "Apa pun arsitekturnya, sistem harus menyediakan antarmuka, menjalankan logika pemrosesan, dan menangani penyimpanan serta akses data." },
          { q: "Mengapa client/server mengurangi data yang lewat jaringan dibanding pola berbagi file?", options: ["Karena memakai kabel lebih cepat", "Karena server mengolah permintaan dan hanya mengirim hasilnya", "Karena klien tidak punya layar", "Karena tidak ada server"], answer: 1, why: "Server menjalankan DBMS dan mengembalikan baris yang diminta saja, bukan seluruh file." },
          { q: "Keunggulan utama cloud computing saat terjadi lonjakan pengguna adalah…", options: ["Tidak butuh Internet", "Scaling on demand", "Data disimpan di PC kasir", "Bandwidth lebih kecil"], answer: 1, why: "Cloud bisa menambah sumber daya sesuai kebutuhan, dan pelanggan hanya membayar yang dipakai." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "**Client/Server**: fat vs thin client, 2-tier vs 3-tier, dan kenapa sistem tiba-tiba lambat saat mendekati kapasitasnya."
  });

  function fmtN(n) { return Number(n).toLocaleString("id-ID"); }
})();
