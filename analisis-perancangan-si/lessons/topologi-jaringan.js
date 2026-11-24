/* Pelajaran: Topologi & Perangkat Jaringan (Modul 08 · Sesi 15–16 · Bab 9 · LO 3)
 * Mengikuti slide "System Architecture": Network Models (topologi, Figure 9-12 s.d. 9-16),
 * Network Devices (router, gateway, proxy server), dan Wireless Networks (BSS & ESS, Figure 9-18).
 */
(function () {
  const S = NetStory({ nodes: [], edges: [], zones: [], flows: [] });
  const steps = [];
  const M = (links, ok, down) => ({ links, ok, down });
  const DEV = [["srv", "server", "Server"], ["pc1", "pc", "PC Kasir"], ["pc2", "pc", "PC Gudang"], ["pc3", "pc", "PC Keuangan"], ["pc4", "laptop", "Laptop Manajer"], ["pr", "printer", "Printer"]];
  const place = (coords) => DEV.map(([id, kind, label], i) => ({ id, kind, label, u: coords[i][0], v: coords[i][1] }));
  const ring = () => DEV.map((_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6; return [Math.round(4.2 * Math.cos(a) * 10) / 10, Math.round(2.9 * Math.sin(a) * 10) / 10 + 0.4]; });

  // 1 — MASALAH
  S.s.nodes = place([[-5.4, 0], [-3, 2.6], [0, 3.2], [3, 2.6], [5.4, 0], [0, -1.6]]);
  S.snap({ note: "Enam perangkat kantor pusat: bagaimana menghubungkannya?", tone: "keep", metrics: M(0, 0, 0), dur: 2200 });
  steps.push(S.take());

  // 2 — hierarchical
  S.s.nodes = [
    { id: "srv", kind: "server", label: "Server pusat", u: 0, v: -2.4 },
    { id: "d1", kind: "server", theme: "violet", label: "Server Penjualan", u: -3.2, v: 0.4 },
    { id: "d2", kind: "server", theme: "violet", label: "Server Gudang", u: 3.2, v: 0.4 },
    { id: "pc1", kind: "pc", label: "PC Kasir", u: -4.8, v: 3.0 },
    { id: "pc2", kind: "pc", label: "PC Kasir 2", u: -1.8, v: 3.4 },
    { id: "pc3", kind: "pc", label: "PC Gudang", u: 1.8, v: 3.4 },
    { id: "pc4", kind: "pc", label: "PC Gudang 2", u: 4.8, v: 3.0 }
  ];
  S.s.edges = [{ a: "srv", b: "d1" }, { a: "srv", b: "d2" }, { a: "d1", b: "pc1" }, { a: "d1", b: "pc2" }, { a: "d2", b: "pc3" }, { a: "d2", b: "pc4" }];
  S.snap({ note: "Hierarchical: server departemen mengendalikan perangkat di bawahnya", flows: [{ path: ["pc1", "d1", "srv"], kind: "req", dur: 1.4 }, { path: ["pc4", "d2", "srv"], kind: "req", dur: 1.4, delay: 0.7 }], metrics: M(6, 7, 0), dur: 2200 });
  S.set("d1", { state: "err", sub: "rusak", subTone: "err" });
  S.set("pc1", { state: "off" }); S.set("pc2", { state: "off" });
  S.snap({ note: "Server Penjualan rusak: semua perangkat di bawahnya ikut terputus", tone: "alert", flows: [{ path: ["pc3", "d2", "srv"], kind: "req", dur: 1.4 }], metrics: M(6, 4, 3), dur: 2400 });
  steps.push(S.take());

  // 3 — bus
  const B = [[-6.2, 0.4], [-3.7, 1.2], [-1.2, 2.0], [1.3, 2.8], [3.8, 3.6], [6.3, 4.4]];
  S.s.nodes = place(B);
  S.s.edges = B.slice(1).map((_, i) => ({ a: DEV[i][0], b: DEV[i + 1][0], label: i === 2 ? "satu jalur bersama" : null }));
  S.snap({ note: "Bus: semua perangkat berbagi satu jalur komunikasi", flows: [{ path: ["pc4", "pc3", "pc2", "pc1", "srv"], kind: "req", dur: 2.4 }], metrics: M(5, 6, 0), dur: 2200 });
  S.edge("pc2", "pc3").state = "cut";
  S.edge("pc2", "pc3").label = null;
  S.s.nodes.forEach((n) => (n.state = "off"));
  S.snap({ note: "Satu titik kabel putus: seluruh jalur bersama terganggu", tone: "alert", flows: [{ path: ["pc4", "pc3"], kind: "err", dur: 1 }], metrics: M(5, 0, 6), dur: 2400 });
  steps.push(S.take());

  // 4 — ring
  const R = ring();
  S.s.nodes = place(R);
  S.s.edges = DEV.map((d, i) => ({ a: d[0], b: DEV[(i + 1) % 6][0] }));
  const loop = DEV.map((d) => d[0]).concat(["srv"]);
  S.snap({ note: "Ring: data berjalan satu arah, dari satu perangkat ke perangkat berikutnya", flows: [{ path: loop, kind: "req", dur: 4 }], metrics: M(6, 6, 0), dur: 2600 });
  S.edge("pc2", "pc3").state = "cut";
  S.s.nodes.forEach((n) => (n.state = "off"));
  S.snap({ note: "Satu sambungan putus: data searah tidak bisa melewatinya", tone: "alert", flows: [{ path: ["srv", "pc1", "pc2"], kind: "err", dur: 1.6 }], metrics: M(6, 0, 6), dur: 2400 });
  steps.push(S.take());

  // 5 — star
  const ST = [[-4.8, -0.6], [-3.4, 2.8], [0, 3.6], [3.4, 2.8], [4.8, -0.6], [0, -2.6]];
  S.s.nodes = place(ST).concat([{ id: "sw", kind: "switch", label: "Switch", u: 0, v: 0.6 }]);
  S.s.edges = DEV.map((d) => ({ a: d[0], b: "sw" }));
  S.snap({ note: "Star: semua lalu lintas lewat switch di tengah", flows: [{ path: ["pc1", "sw", "srv"], kind: "req", dur: 1.4 }, { path: ["srv", "sw", "pr"], kind: "res", dur: 1.4, delay: 0.7 }], metrics: M(6, 6, 0), dur: 2200 });
  S.edge("pc2", "sw").state = "cut";
  S.set("pc2", { state: "off" });
  S.snap({ note: "Satu kabel putus: hanya satu perangkat yang terputus", tone: "done", flows: [{ path: ["pc1", "sw", "srv"], kind: "req", dur: 1.4 }, { path: ["pc3", "sw", "srv"], kind: "req", dur: 1.4, delay: 0.5 }], metrics: M(6, 5, 1), dur: 2400 });
  S.edge("pc2", "sw").state = null;
  S.set("pc2", { state: null });
  S.set("sw", { state: "err", sub: "rusak", subTone: "err" });
  S.s.nodes.forEach((n) => { if (n.id !== "sw") n.state = "off"; });
  S.snap({ note: "Tetapi jika switch rusak, semua terputus", tone: "alert", metrics: M(6, 0, 6), dur: 2400 });
  steps.push(S.take());

  // 6 — mesh
  S.s.nodes = place(R);
  S.s.edges = [];
  DEV.forEach((a, i) => DEV.slice(i + 1).forEach((b) => S.s.edges.push({ a: a[0], b: b[0] })));
  S.snap({ note: "Mesh: setiap perangkat terhubung ke semua perangkat lain", flows: [{ path: ["pc3", "srv"], kind: "req", dur: 1.2 }], metrics: M(15, 6, 0), dur: 2200 });
  S.edge("pc3", "srv").state = "cut";
  S.snap({ note: "Sambungan langsung putus: data dialihkan lewat jalur lain", tone: "done", flows: [{ path: ["pc3", "pc4", "srv"], kind: "req", dur: 1.6 }], metrics: M(15, 6, 0), dur: 2600 });
  steps.push(S.take());

  // 7 — router, gateway, proxy
  S.s.nodes = [
    { id: "pc1", kind: "pc", label: "PC Kasir", u: -5.6, v: 2.4 },
    { id: "pc2", kind: "pc", label: "PC Gudang", u: -3.2, v: 3.4 },
    { id: "srv", kind: "server", label: "Server", u: -5.4, v: -1.4 },
    { id: "sw", kind: "switch", label: "Switch", u: -2.4, v: 0.6 },
    { id: "px", kind: "proxy", label: "Proxy server", sub: "akses Internet staf", subTone: "info", u: 0.6, v: -1.2 },
    { id: "rt", kind: "router", label: "Router (gateway)", u: 2.8, v: 1.0 },
    { id: "net", kind: "cloud", label: "Internet", u: 6.0, v: -0.4 }
  ];
  S.s.zones = [{ id: "lan", label: "LAN KANTOR PUSAT (STAR)", u0: -7.4, v0: -3.4, u1: 1.6, v1: 4.6, theme: "blue" }];
  S.s.edges = [{ a: "pc1", b: "sw" }, { a: "pc2", b: "sw" }, { a: "srv", b: "sw" }, { a: "sw", b: "px" }, { a: "px", b: "rt" }, { a: "rt", b: "net", kind: "wan" }];
  S.snap({ note: "Switch menghubungkan perangkat di dalam satu jaringan", flows: [{ path: ["pc1", "sw", "srv"], kind: "req", dur: 1.4 }], metrics: M(6, 7, 0), dur: 2000 });
  S.snap({ note: "Router menghubungkan LAN ke jaringan lain: Internet (gateway)", flows: [{ path: ["pc2", "sw", "px", "rt"], kind: "req", dur: 1.8 }, { path: ["rt", "net"], kind: "req", arc: 0.9, dur: 1.1, delay: 1.2 }, { path: ["net", "rt"], kind: "res", arc: 0.9, dur: 1.1, delay: 2.1 }, { path: ["rt", "px", "sw", "pc2"], kind: "res", dur: 1.8, delay: 2.8 }], marks: {}, metrics: M(6, 7, 0), dur: 3200 });
  steps.push(S.take());

  // 8 — wireless: BSS → ESS
  S.s.zones = [];
  S.s.nodes = [
    { id: "ap1", kind: "ap", label: "Access point 1", range: 3.0, u: -3.4, v: 0.4 },
    { id: "lap", kind: "laptop", label: "Laptop manajer", u: -3.0, v: 2.2 },
    { id: "rt", kind: "router", label: "Router", u: 0.2, v: -2.4 }
  ];
  S.s.edges = [{ a: "ap1", b: "rt" }, { a: "lap", b: "ap1", kind: "wifi" }];
  S.snap({ note: "BSS: satu access point melayani satu area", flows: [{ path: ["lap", "ap1"], kind: "req", arc: 0.45, dur: 1 }], metrics: M(2, 2, 0), dur: 2000 });
  S.set("lap", { u: 5.4, v: 1.4, state: "err", sub: "sinyal hilang", subTone: "err" });
  S.edge("lap", "ap1").state = "cut";
  S.snap({ note: "Manajer berjalan ke ruang rapat: keluar jangkauan, koneksi putus", tone: "alert", metrics: M(2, 1, 1), dur: 2600 });
  S.s.nodes.push({ id: "ap2", kind: "ap", label: "Access point 2", range: 3.0, u: 3.6, v: 0.4, sparkle: true });
  S.s.edges = [{ a: "ap1", b: "rt" }, { a: "ap2", b: "rt" }, { a: "lap", b: "ap2", kind: "wifi" }];
  S.set("lap", { state: null, sub: "roaming mulus", subTone: "ok" });
  S.snap({ note: "ESS: dua access point, laptop berpindah tanpa terputus", tone: "done", flows: [{ path: ["lap", "ap2"], kind: "req", arc: 0.45, dur: 1 }, { path: ["ap2", "rt"], kind: "req", dur: 1, delay: 0.6 }], metrics: M(3, 3, 0), dur: 2600 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  S.snap({
    note: null, flows: [], metrics: M(3, 3, 0), dur: 900,
    card: {
      type: "table", at: "center", title: "Topologi saat terjadi gangguan (6 perangkat)",
      cols: ["Topologi", "Kabel", "1 kabel putus", "Titik pusat rusak"],
      rows: [
        ["Hierarchical", "6", "Cabang di bawahnya terputus", "Server pusat rusak: semua"],
        ["Bus", "5", "Seluruh jalur terganggu", "—"],
        ["Ring", "6", "Aliran searah terhenti", "—"],
        ["Star", "6", "Hanya 1 perangkat", "Switch rusak: semua"],
        ["Mesh", "15", "Dialihkan, tetap jalan", "Tidak ada titik pusat"]
      ],
      rowTone: { 3: "ok" },
      foot: "Mesh paling tahan gangguan, tetapi **15 kabel** untuk 6 perangkat membuatnya mahal dipasang dan dirawat."
    }
  });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "topologi-jaringan",
    renderer: "net",
    title: "Topologi & Perangkat Jaringan",
    subtitle: "Hubungkan enam perangkat kantor pusat MartKita dengan lima cara berbeda, lalu putuskan satu kabel dan lihat siapa yang masih bisa bekerja.",
    minutes: 15,
    level: "Pemula",
    lo: "LO 3",
    learn: [
      { text: "Topologi hierarchical, bus, ring, star, dan mesh", at: 5 },
      { text: "Dampak satu kabel putus pada tiap topologi", at: 5 },
      { text: "Switch, router, gateway, dan proxy server", at: 6 },
      { text: "Wireless LAN: BSS dan ESS (roaming)", at: 7 },
      { text: "Menimbang ketahanan dan biaya", at: 8 }
    ],
    metrics: [
      { key: "links", label: "Kabel / sambungan", icon: "⌇" },
      { key: "down", label: "Terputus", icon: "✕" },
      { key: "ok", label: "Perangkat terhubung", icon: "◆", total: true }
    ],
    legend: [
      { color: "#6366f1", round: true, label: "Data" },
      { color: "#f59e0b", round: true, label: "Balasan" },
      { color: "#e11d48", round: true, label: "Gagal" },
      { color: "#14b8a6", label: "Wi-Fi" }
    ],
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "6 perangkat", title: "Bagaimana menghubungkan?",
        text: [
          "Kantor pusat MartKita punya server, tiga PC, laptop manajer, dan printer. Cara jaringan disusun disebut **topologi**: *physical topology* menggambarkan kabel dan sambungan, *logical topology* menggambarkan cara komponen berinteraksi.",
          "Setiap topologi punya jawaban berbeda untuk satu pertanyaan penting: **apa yang terjadi kalau ada yang rusak?**"
        ],
        changed: [["+", "6 perangkat, belum terhubung"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Hierarchical", title: "Hierarchical",
        text: [
          "Dalam **hierarchical network**, server departemen mengendalikan pemrosesan dan perangkat di level bawahnya (Figure 9-12).",
          "Ketika Server Penjualan rusak, kedua PC kasir di bawahnya ikut terputus: **3 perangkat** hilang dari jaringan."
        ],
        changed: [["+", "Server pusat + 2 server departemen"], ["~", "Terputus 0 → 3"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Bus", title: "Bus",
        text: [
          "**Bus network** memakai satu jalur komunikasi bersama untuk semua perangkat (Figure 9-13). Kabelnya paling sedikit: **5 sambungan**.",
          "Karena semua bergantung pada satu jalur, satu titik kabel yang putus mengganggu **seluruh jaringan**."
        ],
        changed: [["~", "Kabel 6 → 5"], ["~", "Terputus → 6"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Ring", title: "Ring",
        text: [
          "**Ring network** membentuk lingkaran, dan data mengalir **satu arah** dari satu perangkat ke perangkat berikutnya (Figure 9-14).",
          "Jika satu sambungan putus, data yang searah tidak bisa melewati titik itu, sehingga seluruh cincin terganggu."
        ],
        changed: [["~", "Kabel 5 → 6"], ["~", "Terputus → 6"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Star", title: "Star",
        text: [
          "**Star network** menempatkan **switch** di tengah sebagai jalur semua lalu lintas (Figure 9-15). Ini topologi LAN yang paling umum sekarang.",
          "Satu kabel putus hanya memutus **1 perangkat**. Kelemahannya, jika switch rusak, semua perangkat terputus."
        ],
        callout: { type: "IDE KUNCI", text: "Star mengubah titik gagal: kabel bukan lagi masalah besar, tetapi switch menjadi pusat yang harus dijaga." },
        changed: [["+", "Switch di tengah"], ["~", "1 kabel putus: terputus 1"], ["~", "Switch rusak: terputus 6"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Mesh", title: "Mesh",
        text: [
          "Dalam **mesh network**, setiap perangkat terhubung ke semua perangkat lain (Figure 9-16). Untuk 6 perangkat butuh 6 × 5 / 2 = **15 sambungan**.",
          "Saat sambungan PC Keuangan ke server putus, data **dialihkan** lewat laptop manajer. Tidak ada yang terputus."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Mesh dipakai jika redundansi sangat dibutuhkan, tetapi mahal dipasang dan dirawat." },
        changed: [["~", "Kabel 6 → 15"], ["~", "Terputus tetap 0"]],
        frames: steps[5]
      },
      {
        kind: "TEKNIK", short: "Perangkat", title: "Switch, router, gateway, proxy",
        text: [
          "**Switch** menghubungkan perangkat di dalam satu jaringan. **Router** menghubungkan segmen jaringan, menentukan jalur data paling efisien, dan menghubungkan LAN ke jaringan yang lebih besar seperti Internet. Sambungan itu disebut **gateway**.",
          "**Proxy server** menyediakan akses Internet bagi pengguna di dalam LAN. Ikuti paket dari PC Gudang: switch → proxy → router → Internet, lalu kembali."
        ],
        changed: [["+", "Proxy server, router (gateway), Internet"]],
        frames: steps[6]
      },
      {
        kind: "TEKNIK", short: "Wi-Fi", title: "Wireless: BSS dan ESS",
        text: [
          "WLAN mengikuti standar **IEEE 802.11**. Pada **BSS** (infrastructure mode), satu access point melayani satu area. Ketika manajer berjalan ke ruang rapat, ia keluar jangkauan dan koneksinya putus.",
          "Pada **ESS**, beberapa access point membentuk satu jaringan. Laptop berpindah ke access point 2 dengan mulus: **roaming** (Figure 9-18)."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Untuk jarak sangat dekat ada Bluetooth dan NFC (Near-Field Communication), yang bekerja dalam jarak beberapa sentimeter." },
        changed: [["+", "Access point 1 (BSS)"], ["+", "Access point 2 (ESS)"], ["~", "Laptop: putus → roaming mulus"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Ketahanan vs biaya",
        text: ["Topologi menentukan seberapa luas dampak satu kerusakan. Star menjadi pilihan umum LAN karena gangguan kabel hanya berdampak pada satu perangkat, sementara mesh dipakai bila redundansi sepadan dengan biayanya."],
        quiz: [
          { q: "Dalam topologi star, satu kabel PC putus. Berapa perangkat yang terputus?", options: ["Semua", "Satu", "Setengah", "Tidak ada"], answer: 1, why: "Setiap perangkat punya kabel sendiri ke switch, jadi hanya perangkat itu yang terputus." },
          { q: "Berapa sambungan yang dibutuhkan mesh untuk 6 perangkat?", options: ["6", "12", "15", "36"], answer: 2, why: "n(n − 1) / 2 = 6 × 5 / 2 = 15." },
          { q: "Perangkat yang menghubungkan LAN ke Internet dan menentukan jalur data disebut…", options: ["Switch", "Router", "Printer", "Access point"], answer: 1, why: "Router menghubungkan segmen jaringan dan menjadi gateway ke jaringan yang lebih besar." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "**Make or Buy**: membangun sistem sendiri, membeli paket, alih daya, atau berlangganan SaaS."
  });
})();
