// Kerangka kursus: COMP6820001 Object Oriented Programming (BINUS)
// Disusun dari slide Sesi 8 (Polymorphism) dan Sesi 9 (Interface and Abstract Class).
// Pelajaran dengan `ready: true` sudah tersedia. Modul lain dapat ditambahkan dari course outline.
window.COURSE = {
  slug: "pemrograman-berorientasi-objek",
  short: "PBO",
  code: "COMP6820001",
  title: "Object Oriented Programming",
  titleId: "Pemrograman Berorientasi Objek",
  program: "BINUS University",
  description:
    "Konsep pemrograman berorientasi objek dengan Java. Setiap pelajaran adalah diagram hidup: lihat class dan objek di panggung, ikuti ke method mana sebuah pemanggilan benar-benar pergi, dan temukan kesalahan yang ditangkap compiler sebelum program berjalan.",
  textbook: "Y. Daniel Liang (2019). Introduction to Java Programming, 11th Edition. Pearson Education.",
  outcomes: [
    { id: "LO 1", text: "Menganalisis solusi untuk pemecahan masalah" },
    { id: "LO 2", text: "Menerapkan pemrograman berorientasi objek untuk pemecahan masalah" },
    { id: "LO 3", text: "Merancang program berbasis objek" },
    { id: "LO 4", text: "Membangun program berorientasi objek untuk memecahkan masalah" }
  ],
  modules: [
    {
      id: "08", title: "Polymorphism", lo: ["LO 2", "LO 3"],
      lessons: [
        { slug: "overriding", title: "Overriding & Dynamic Binding", goal: "Satu variabel Animal, dua perilaku: method mana yang dijalankan ditentukan objeknya.", sessions: "Sesi 8", ready: true },
        { slug: "overloading", title: "Overloading & Polimorfisme Statis", goal: "Satu nama method, banyak versi: compiler memilih dari tipe argumen. Plus generic.", sessions: "Sesi 8", ready: true },
        { slug: "polimorfisme-shape", title: "Polimorfisme dalam Aksi", goal: "Satu loop menghitung luas semua bentuk tanpa if, dan tetap utuh saat bentuk baru datang.", sessions: "Sesi 8", ready: true }
      ]
    },
    {
      id: "09", title: "Interface & Abstract Class", lo: ["LO 3", "LO 4"],
      lessons: [
        { slug: "abstract-class", title: "Abstract Class & Abstract Method", goal: "Class yang tidak boleh dibuat objeknya, dan method yang wajib diisi anaknya.", sessions: "Sesi 9", ready: true },
        { slug: "interface", title: "Interface", goal: "Kontrak perilaku: implements, konstanta, dan banyak interface sekaligus.", sessions: "Sesi 9", ready: true },
        { slug: "interface-vs-abstract", title: "Interface vs Abstract Class", goal: "Kasus kasir kampus: kapan memakai extends, kapan implements.", sessions: "Sesi 9", ready: true }
      ]
    }
  ]
};
