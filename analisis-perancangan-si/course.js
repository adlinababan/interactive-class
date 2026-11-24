// Kerangka kursus: ISYS6979064 Information Systems Analysis and Design (BINUS, Sistem Informasi)
// Disusun dari Course Outline revisi 0 (berlaku 1 September 2026). Buku: Scott Tilley (2025), Systems Analysis and Design, ed. 13.
// Pelajaran dengan `ready: true` sudah tersedia; sisanya tampil sebagai "segera hadir".
window.COURSE = {
  slug: "analisis-perancangan-si",
  short: "APSI",
  code: "ISYS6979064",
  title: "Information Systems Analysis and Design",
  titleId: "Analisis & Perancangan SI",
  program: "Sistem Informasi · BINUS University",
  description:
    "Metodologi analisis dan perancangan sistem informasi: dari kebutuhan pengguna, pemodelan UML, sampai arsitektur dan strategi pengembangan. Setiap pelajaran mengikuti satu studi kasus, jaringan minimarket MartKita di Medan, dan menjalankan keputusannya sebagai simulasi langkah demi langkah.",
  textbook: "Scott Tilley (2025). Systems Analysis and Design, 13th Edition. Cengage Learning.",
  outcomes: [
    { id: "LO 1", text: "Menjelaskan metode pengembangan sistem informasi serta analisis dan perancangan sistem" },
    { id: "LO 2", text: "Menyusun kebutuhan sistem dan tantangan dalam proses requirements engineering" },
    { id: "LO 3", text: "Merancang arsitektur sistem sebagai gambaran utuh solusi yang diusulkan" },
    { id: "LO 4", text: "Menerapkan teknik dan prinsip pemeliharaan, dukungan, dan keamanan" }
  ],
  modules: [
    {
      id: "01", title: "Pengantar Analisis & Perancangan", lo: ["LO 1"],
      lessons: [
        { slug: "sistem-informasi", title: "Sistem Informasi & Komponennya", goal: "Hardware, software, data, proses, dan orang dalam satu sistem.", sessions: "Teori 1–2 · Bab 1" },
        { slug: "sdlc", title: "Siklus Pengembangan Sistem (SDLC)", goal: "Perencanaan, analisis, desain, implementasi, dukungan: dan versi agilnya.", sessions: "Teori 1–2 · Bab 1" },
        { slug: "analis-sistem", title: "Peran Analis Sistem", goal: "Jembatan antara pengguna, manajemen, dan tim IT.", sessions: "Teori 1–2 · Lab 1" }
      ]
    },
    {
      id: "02", title: "Business Case", lo: ["LO 1"],
      lessons: [
        { slug: "perencanaan-strategis", title: "Perencanaan Strategis & SWOT", goal: "Dari visi perusahaan ke permintaan sistem.", sessions: "Teori 3–4 · Bab 2" },
        { slug: "studi-kelayakan", title: "Permintaan Sistem & Studi Kelayakan", goal: "Kelayakan operasional, teknis, ekonomi, dan jadwal.", sessions: "Teori 3–4 · Bab 2" },
        { slug: "investigasi-pendahuluan", title: "Investigasi Pendahuluan & Fishbone", goal: "Menemukan akar masalah sebelum mengusulkan solusi.", sessions: "Teori 3–4 · Lab 2" }
      ]
    },
    {
      id: "03", title: "Requirements Engineering", lo: ["LO 2"],
      lessons: [
        { slug: "elisitasi-kebutuhan", title: "Teknik Elisitasi Kebutuhan", goal: "Wawancara, JAD, kuesioner, observasi: kapan memakai yang mana.", sessions: "Teori 5–6 · Bab 4" },
        { slug: "jenis-kebutuhan", title: "Kebutuhan Fungsional vs Nonfungsional", goal: "Apa yang dilakukan sistem dan seberapa baik melakukannya.", sessions: "Teori 5–6 · Bab 4" },
        { slug: "validasi-kebutuhan", title: "Validasi & Verifikasi Kebutuhan", goal: "Memastikan kebutuhan benar, lengkap, dan dapat diuji.", sessions: "Teori 5–6 · Bab 4" }
      ]
    },
    {
      id: "04", title: "Data & Process Modeling", lo: ["LO 2"],
      lessons: [
        { slug: "diagram-konteks", title: "Diagram Konteks", goal: "Sistem sebagai satu proses dengan entitas di sekitarnya.", sessions: "Teori 7–8 · Lab 3" },
        { slug: "dfd", title: "DFD Level 0 dan Lebih Rendah", goal: "Memecah proses dan menjaga keseimbangan aliran data.", sessions: "Teori 7–8 · Bab 5" },
        { slug: "kamus-data", title: "Kamus Data", goal: "Mendefinisikan setiap aliran dan penyimpanan data.", sessions: "Teori 7–8 · Bab 5" }
      ]
    },
    {
      id: "05", title: "Object Modeling", lo: ["LO 2"],
      lessons: [
        { slug: "objek-class-pesan", title: "Objek, Class, dan Pesan", goal: "Cara berpikir berorientasi objek dalam analisis.", sessions: "Teori 9–10 · Bab 6" },
        { slug: "relasi-objek", title: "Relasi antar-Objek", goal: "Asosiasi, agregasi, dan pewarisan dalam model analisis.", sessions: "Teori 9–10 · Bab 6" }
      ]
    },
    {
      id: "06", title: "User Interface Design", lo: ["LO 2", "LO 3"],
      lessons: [
        { slug: "prinsip-antarmuka", title: "Prinsip Desain Antarmuka", goal: "Interaksi manusia–komputer dan tujuh kebiasaan perancang antarmuka.", sessions: "Teori 11–12 · Bab 7" },
        { slug: "desain-input-output", title: "Desain Input & Output", goal: "Formulir, validasi input, dan laporan yang mudah dibaca.", sessions: "Teori 11–12 · Lab 9" }
      ]
    },
    {
      id: "07", title: "Data Design", lo: ["LO 2", "LO 3"],
      lessons: [
        { slug: "erd", title: "Entity-Relationship Diagram", goal: "Entitas, atribut, dan kardinalitas.", sessions: "Teori 13–14 · Bab 8" },
        { slug: "normalisasi", title: "Normalisasi Data", goal: "1NF sampai 3NF: menghapus pengulangan dan anomali.", sessions: "Teori 13–14 · Bab 8" }
      ]
    },
    {
      id: "08", title: "System Architecture", lo: ["LO 3"],
      lessons: [
        { slug: "evolusi-arsitektur", title: "Dari Mainframe ke Cloud", goal: "Di mana antarmuka, logika, dan data berjalan, dari terminal sampai cloud.", sessions: "Teori 15–16 · Bab 9", ready: true },
        { slug: "client-server", title: "Client/Server: Membagi Pekerjaan", goal: "Fat vs thin client, 2-tier vs 3-tier, middleware, dan knee of the curve.", sessions: "Teori 15–16 · Lab 10", ready: true },
        { slug: "online-batch", title: "Online vs Batch Processing", goal: "Kasir MartKita: mana yang harus seketika, mana yang boleh menunggu malam.", sessions: "Teori 15–16 · Bab 9", ready: true },
        { slug: "topologi-jaringan", title: "Topologi & Perangkat Jaringan", goal: "Bus, ring, star, mesh, router, dan Wi-Fi: apa yang terjadi saat satu kabel putus.", sessions: "Teori 15–16 · Bab 9", ready: true }
      ]
    },
    {
      id: "09", title: "Development Strategies", lo: ["LO 3"],
      lessons: [
        { slug: "make-or-buy", title: "Make or Buy", goal: "In-house, paket, outsourcing, offshoring, atau SaaS: dan model biayanya.", sessions: "Teori 17–18 · Bab 10", ready: true },
        { slug: "payback-roi-npv", title: "Payback, ROI, NPV", goal: "Kapan sistem balik modal, dan berapa nilainya hari ini.", sessions: "Teori 17–18 · Bab 10", ready: true },
        { slug: "memilih-vendor", title: "Memilih Vendor", goal: "RFP, model penilaian berbobot, benchmark, dan TCO.", sessions: "Teori 17–18 · Bab 10", ready: true }
      ]
    },
    {
      id: "10", title: "Implementasi Sistem", lo: ["LO 3"],
      lessons: [
        { slug: "testing", title: "Pengujian Sistem", goal: "Unit, integrasi, dan system testing.", sessions: "Teori 19–20 · Bab 11" },
        { slug: "konversi-sistem", title: "Strategi Konversi", goal: "Langsung, paralel, pilot, atau bertahap.", sessions: "Teori 19–20 · Bab 11" }
      ]
    },
    {
      id: "11", title: "Pemeliharaan & Dukungan", lo: ["LO 4"],
      lessons: [
        { slug: "jenis-pemeliharaan", title: "Jenis Pemeliharaan", goal: "Korektif, adaptif, perfektif, dan preventif.", sessions: "Teori 21–22 · Bab 12" },
        { slug: "kinerja-sistem", title: "Manajemen Kinerja & Kapasitas", goal: "Memantau beban sebelum sistem melambat.", sessions: "Teori 21–22 · Bab 12" }
      ]
    },
    {
      id: "12", title: "Keamanan Sistem", lo: ["LO 4"],
      lessons: [
        { slug: "risiko-keamanan", title: "Risiko & Kontrol Keamanan", goal: "Ancaman, kerentanan, dan lapisan pengamanan.", sessions: "Teori 23–24 · Bab 12" },
        { slug: "backup-pemulihan", title: "Backup & Pemulihan Bencana", goal: "Strategi backup dan rencana pemulihan.", sessions: "Teori 23–24 · Bab 12" }
      ]
    },
    {
      id: "13", title: "Lab: Pemodelan UML", lo: ["LO 2"],
      lessons: [
        { slug: "use-case", title: "Use Case Diagram", goal: "Aktor, use case, dan deskripsi use case lengkap.", sessions: "Lab 4" },
        { slug: "class-diagram", title: "Class Diagram", goal: "Class, atribut, operasi, dan multiplisitas.", sessions: "Lab 5" },
        { slug: "sequence-diagram", title: "Sequence Diagram", goal: "Urutan pesan antar-objek untuk satu skenario.", sessions: "Lab 6" },
        { slug: "state-diagram", title: "State Transition Diagram", goal: "Status objek dan pemicu perpindahannya.", sessions: "Lab 7" },
        { slug: "activity-diagram", title: "Activity Diagram", goal: "Alur aktivitas, keputusan, dan swimlane.", sessions: "Lab 8" }
      ]
    }
  ]
};
