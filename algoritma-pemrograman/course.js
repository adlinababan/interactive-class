// Kerangka kursus: ISYS6973064 Algorithm and Programming (BINUS, Sistem Informasi)
// Disusun dari Course Outline revisi 0 (berlaku 1 September 2025).
// Pelajaran dengan `ready: true` sudah tersedia; sisanya tampil sebagai "segera hadir".
window.COURSE = {
  slug: "algoritma-pemrograman",
  code: "ISYS6973064",
  title: "Algorithm and Programming",
  titleId: "Algoritma dan Pemrograman",
  program: "Sistem Informasi · BINUS University",
  description:
    "Dasar-dasar algoritma yang didemonstrasikan dengan Python. Setiap pelajaran adalah diagram hidup yang kamu jalankan langkah demi langkah: lihat apa yang terjadi di dalam program, hitung biayanya, lalu bandingkan pilihan solusi.",
  textbook: "Eric Matthes (2023). Python Crash Course, 3rd Edition. No Starch Press.",
  outcomes: [
    { id: "LO 1", text: "Menjelaskan jenis-jenis algoritma dalam pemecahan masalah" },
    { id: "LO 2", text: "Menjelaskan kegunaan sintaks Python dan OOP" },
    { id: "LO 3", text: "Mendemonstrasikan algoritma menggunakan sintaks Python" },
    { id: "LO 4", text: "Memilih algoritma terbaik dalam pemecahan masalah" }
  ],
  modules: [
    {
      id: "01", title: "Dasar Algoritma", lo: ["LO 1"],
      lessons: [
        { slug: "apa-itu-algoritma", title: "Apa Itu Algoritma", goal: "Dari masalah sehari-hari ke flowchart dan pseudocode.", sessions: "Teori 1" },
        { slug: "program-python-pertama", title: "Program Python Pertama", goal: "Bagaimana Python menjalankan kode baris demi baris: input, proses, output.", sessions: "Teori 1 · Lab 1" },
        { slug: "variabel-tipe-data", title: "Variabel & Tipe Data", goal: "Variabel sebagai nama yang menunjuk nilai: angka, string, boolean.", sessions: "Teori 2 · Lab 1" },
        { slug: "operator-ekspresi", title: "Operator & Ekspresi", goal: "Ikuti urutan evaluasi (precedence) sebuah ekspresi langkah demi langkah.", sessions: "Lab 2" }
      ]
    },
    {
      id: "02", title: "Alur Kendali", lo: ["LO 1", "LO 2"],
      lessons: [
        { slug: "seleksi-if", title: "Seleksi: if, elif, else, match", goal: "Ikuti jalur yang dipilih program untuk setiap nilai input.", sessions: "Teori 5 · Lab 3" },
        { slug: "perulangan-for", title: "Perulangan for", goal: "Satu badan loop, banyak data: lihat variabel berubah tiap iterasi.", sessions: "Teori 4 · Lab 4" },
        { slug: "perulangan-while", title: "Perulangan while, break, continue", goal: "Loop yang berhenti karena kondisi, bukan karena data habis.", sessions: "Teori 7 · Lab 4" }
      ]
    },
    {
      id: "03", title: "Struktur Data", lo: ["LO 2"],
      lessons: [
        { slug: "list-dasar", title: "List: Tambah, Ubah, Hapus", goal: "Apa yang bergeser di dalam list saat append, insert, dan remove.", sessions: "Teori 3 · Lab 5" },
        { slug: "indexing-slicing", title: "Indexing & Slicing", goal: "Indeks positif, negatif, dan potongan list tanpa salah satu.", sessions: "Teori 4 · Lab 5" },
        { slug: "tuple-set", title: "Tuple & Set", goal: "Kapan data tidak boleh berubah, dan kapan tidak boleh kembar.", sessions: "Lab 6" },
        { slug: "dictionary", title: "Dictionary", goal: "Mencari berdasarkan kunci, bukan posisi; dictionary bersarang.", sessions: "Teori 6 · Lab 6" }
      ]
    },
    {
      id: "04", title: "Fungsi", lo: ["LO 3"],
      lessons: [
        { slug: "fungsi-argumen", title: "Fungsi & Argumen", goal: "Mendefinisikan fungsi dan mengoper argumen posisi, kata kunci, dan *args.", sessions: "Teori 8 · Lab 7" },
        { slug: "return-call-stack", title: "Return & Call Stack", goal: "Ke mana program kembali setelah fungsi selesai.", sessions: "Teori 8 · Lab 7" },
        { slug: "modul", title: "Modul: Mengimpor Fungsi & Class", goal: "Memecah program ke beberapa file, lalu mengimpor fungsi dan class (from car import Car).", sessions: "Teori 8–9 · Lab 8" }
      ]
    },
    {
      id: "05", title: "File & Penanganan Error", lo: ["LO 3"],
      lessons: [
        { slug: "baca-tulis-file", title: "Membaca & Menulis File", goal: "Data yang tetap ada setelah program ditutup.", sessions: "Teori 10 · Lab 8" },
        { slug: "exception", title: "Exception: try & except", goal: "Program yang tidak berhenti mendadak saat input salah.", sessions: "Teori 10–11 · Lab 8" },
        { slug: "debugging", title: "Debugging", goal: "Syntax error, runtime error, logic error: cara melacak masing-masing.", sessions: "Teori 11" }
      ]
    },
    {
      id: "06", title: "Searching & Sorting", lo: ["LO 4"],
      lessons: [
        { slug: "linear-binary-search", title: "Linear vs Binary Search", goal: "Mencari satu nama di antara seribu: 1.000 langkah atau 10?", sessions: "Lab 10" },
        { slug: "bubble-sort", title: "Bubble Sort", goal: "Mengurutkan dengan menukar tetangga, dan menghitung biayanya.", sessions: "Teori 12", ready: true },
        { slug: "selection-insertion-sort", title: "Selection & Insertion Sort", goal: "Dua cara lain mengurutkan: siapa yang paling sedikit menukar?", sessions: "Teori 12" },
        { slug: "merge-sort", title: "Merge Sort", goal: "Bagi dua, urutkan, gabungkan: kenapa jauh lebih cepat untuk data besar.", sessions: "Teori 12 · Lab 10" }
      ]
    },
    {
      id: "07", title: "Pemrograman Berorientasi Objek", lo: ["LO 2", "LO 3"],
      lessons: [
        { slug: "class-objek", title: "Class & Objek", goal: "Satu cetakan, banyak objek: __init__, self, atribut, dan method.", sessions: "Teori 9 · Lab 9", ready: true },
        { slug: "atribut-objek", title: "Mengubah Atribut Objek", goal: "Nilai default, mengubah langsung vs lewat method, dan menaikkan nilai.", sessions: "Teori 9 · Lab 9", ready: true },
        { slug: "inheritance", title: "Inheritance", goal: "Class anak mewarisi class induk: super(), override, dan objek sebagai atribut.", sessions: "Teori 9 · Lab 9", ready: true },
        { slug: "enkapsulasi", title: "Enkapsulasi", goal: "Melindungi data objek lewat method.", sessions: "Teori 13 · Lab 9" },
        { slug: "polymorphism", title: "Polymorphism", goal: "Satu nama method, perilaku berbeda di tiap class.", sessions: "Teori 13" }
      ]
    },
    {
      id: "08", title: "Studi Kasus", lo: ["LO 1", "LO 2", "LO 3", "LO 4"],
      lessons: [
        { slug: "aplikasi-nilai", title: "Aplikasi Nilai Mahasiswa", goal: "Gabungkan list, dictionary, fungsi, file, sorting, dan class dalam satu program.", sessions: "Review · Lab 11" }
      ]
    }
  ]
};
