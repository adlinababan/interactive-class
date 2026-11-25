// Kerangka kursus: COMP6799001 Database Technology (BINUS)
// Disusun dari slide "Physical Database Design and Tuning" dan "SQL: Queries, Programming and Triggers".
// Angka halaman disk diukur langsung di PostgreSQL 16; semua query dijalankan pada data contoh buku acuan.
window.COURSE = {
  slug: "teknologi-basis-data",
  short: "TBD",
  code: "COMP6799001",
  title: "Database Technology",
  titleId: "Teknologi Basis Data",
  program: "BINUS University",
  description:
    "Lihat apa yang sebenarnya dikerjakan database: halaman disk mana yang dibaca, kenapa indeks mempercepat pencarian, dan bagaimana sebuah query SQL disaring, dikelompokkan, lalu dihitung, langkah demi langkah.",
  textbook: "R. Ramakrishnan & J. Gehrke. Database Management Systems, 3rd Edition. McGraw-Hill. · R. Elmasri & S. Navathe. Fundamentals of Database Systems, 7th Edition. Pearson.",
  outcomes: [
    { id: "LO 2", text: "Menjelaskan konsep aljabar relasional, bahasa manipulasi data, dan manajemen transaksi pada basis data" },
    { id: "LO 3", text: "Menerapkan pembuatan basis data dan manipulasi data di dalamnya" }
  ],
  modules: [
    {
      id: "08", title: "Physical Database Design & Tuning", lo: ["LO 2"],
      lessons: [
        { slug: "indeks-workload", title: "Indeks & Workload", goal: "Kenapa mencari 1 karyawan bisa membaca 830 halaman, dan bagaimana indeks memangkasnya menjadi 3.", sessions: "Sesi 8", ready: true },
        { slug: "clustered-index", title: "Clustered vs Unclustered", goal: "Indeks saja tidak cukup untuk rentang data: urutan penyimpanan di disk ikut menentukan.", sessions: "Sesi 8", ready: true },
        { slug: "indeks-komposit-tuning", title: "Indeks Komposit & Tuning Query", goal: "Urutan kolom indeks, index-only plan, dan menulis ulang query agar lebih ringan.", sessions: "Sesi 8", ready: true }
      ]
    },
    {
      id: "09", title: "SQL: Queries, Programming & Triggers", lo: ["LO 2", "LO 3"],
      lessons: [
        { slug: "query-himpunan", title: "Query Dasar & Operasi Himpunan", goal: "Urutan kerja SELECT–FROM–WHERE, lalu UNION, INTERSECT, dan EXCEPT.", sessions: "Sesi 9", ready: true },
        { slug: "nested-query", title: "Nested Query", goal: "Query di dalam query: IN, NOT IN, EXISTS, ANY, dan ALL.", sessions: "Sesi 9", ready: true },
        { slug: "agregasi-group-by", title: "Agregasi, GROUP BY & HAVING", goal: "Ikuti baris disaring, dikelompokkan, kelompok dibuang, lalu dihitung.", sessions: "Sesi 9", ready: true },
        { slug: "null-constraint-trigger", title: "NULL, Constraint & Trigger", goal: "Logika tiga nilai, aturan yang menolak data salah, dan prosedur yang berjalan otomatis.", sessions: "Sesi 9", ready: true }
      ]
    }
  ]
};
