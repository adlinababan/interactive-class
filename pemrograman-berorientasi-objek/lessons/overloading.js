/* Pelajaran: Overloading & Polimorfisme Statis (Modul 08 · Sesi 8 · LO 2)
 * Mengikuti slide "Overriding vs Overloading", "Ad hoc Polymorphism", dan "Parameterized Polymorphism".
 * Contoh 1 + 2 = 3 dan 3.14 + 0.0015 = 3.1415 dari slide; Kalkulator dan Kotak<T> adalah contoh tambahan.
 * Semua output dan pesan error sudah dicocokkan dengan javac/java 21.
 */
(function () {
  const KAL = { u: -3.6, v: 0 }, KOT = { u: -0.2, v: 0.4 };
  const CU = 2.6, CV = [-2.1, -0.7, 0.7, 2.1];
  const OA = { u: 3.2, v: 0.4 }, OT = { u: 5.8, v: 0.4 };

  const MEM = {
    m1: { id: "m1", label: "tambah(int, int)", kind: "method" },
    m2: { id: "m2", label: "tambah(double, double)", kind: "method" },
    m3: { id: "m3", label: "tambah(int, int, int)", kind: "method" },
    m4: { id: "m4", label: "tambah(String, String)", kind: "method" },
    m5: { id: "m5", label: "double tambah(int, int)", kind: "method" },
    b1: { id: "m1", label: "tambahInt(int, int)", kind: "method" },
    b2: { id: "m2", label: "tambahDouble(double, double)", kind: "method" },
    b3: { id: "m3", label: "tambahTiga(int, int, int)", kind: "method" },
    b4: { id: "m4", label: "gabung(String, String)", kind: "method" }
  };
  const kal = (...ks) => ({ id: "Kalkulator", ...KAL, theme: "blue", members: ks.map((k) => MEM[k]) });
  const kotak = () => ({ id: "Kotak", title: "Kotak<T>", ...KOT, theme: "teal", members: [
    { id: "isi", label: "T isi", kind: "attr" },
    { id: "ctor", label: "Kotak(T isi)", kind: "method" },
    { id: "ambil", label: "T ambil()", kind: "method" }
  ] });
  const call = (id, text, i) => ({ id, text, u: CU, v: CV[i], cls: "call" });

  // ---------- kode ----------
  const body = (ret, name, params, expr, id) => [
    ["+" + id, "    static " + ret + " " + name + "(" + params + ") {"],
    ["", "        return " + expr + ";"],
    ["", "    }"]
  ];
  const plain = (rows) => rows.map(([id, t]) => [id.replace(/^\+/, ""), t]);
  const BEDA = [
    ["k_cls", "public class Kalkulator {"],
    ...plain(body("int", "tambahInt", "int a, int b", "a + b", "m1")),
    ...plain(body("double", "tambahDouble", "double a, double b", "a + b", "m2")),
    ...plain(body("int", "tambahTiga", "int a, int b, int c", "a + b + c", "m3")),
    ...plain(body("String", "gabung", "String a, String b", "a + b", "m4")),
    ["", "    public static void main(String[] args) {"],
    ["c1", "        System.out.println(tambahInt(1, 2));"],
    ["c2", "        System.out.println(tambahDouble(3.14, 0.0015));"],
    ["c3", "        System.out.println(tambahTiga(1, 2, 3));"],
    ["c4", "        System.out.println(gabung(\"Bina\", \"Nusantara\"));"],
    ["", "    }"],
    ["", "}"]
  ];
  const OVER_METHODS = (mark) => {
    const b = mark ? body : (...a) => plain(body(...a));
    return [
      ...b("int", "tambah", "int a, int b", "a + b", "m1"),
      ...b("double", "tambah", "double a, double b", "a + b", "m2"),
      ...b("int", "tambah", "int a, int b, int c", "a + b + c", "m3"),
      ...b("String", "tambah", "String a, String b", "a + b", "m4")
    ];
  };
  const MAIN = (...rows) => [["", "    public static void main(String[] args) {"], ...rows, ["", "    }"], ["", "}"]];
  const CALLS = [
    ["c1", "        System.out.println(tambah(1, 2));"],
    ["c2", "        System.out.println(tambah(3.14, 0.0015));"],
    ["c3", "        System.out.println(tambah(1, 2, 3));"],
    ["c4", "        System.out.println(tambah(\"Bina\", \"Nusantara\"));"]
  ];
  const GEN = [
    ["g_cls", "class Kotak<T> {"],
    ["", "    private T isi;"],
    ["g_ctor", "    Kotak(T isi) { this.isi = isi; }"],
    ["g_ambil", "    T ambil() { return isi; }"],
    ["", "}"],
    ["", ""],
    ["", "public class Main {"],
    ["", "    public static void main(String[] args) {"]
  ];
  const CODE = {
    beda: BEDA,
    over: [["k_cls", "public class Kalkulator {"], ...OVER_METHODS(true), ...MAIN(...CALLS)],
    lebar: [["k_cls", "public class Kalkulator {"], ...OVER_METHODS(false), ...MAIN(
      ["+c5", "        System.out.println(tambah(1, 2.5));"],
      ["+c6", "        System.out.println(tambah(3.2, 3));"]
    )],
    dup: [["k_cls", "public class Kalkulator {"], ...plain(body("int", "tambah", "int a, int b", "a + b", "m1")),
      ...body("double", "tambah", "int a, int b", "a + b", "m5"),
      ...plain(body("double", "tambah", "double a, double b", "a + b", "m2")),
      ...MAIN(["c1", "        System.out.println(tambah(1, 2));"])],
    salah: [["k_cls", "public class Kalkulator {"], ...OVER_METHODS(false), ...MAIN(
      ["+c7", "        System.out.println(tambah(true, 1));"]
    )],
    gen: [...GEN,
      ["mkA", "        Kotak<Integer> angka = new Kotak<>(10);"],
      ["mkT", "        Kotak<String> teks = new Kotak<>(\"Java\");"],
      ["pA", "        System.out.println(angka.ambil() + 5);"],
      ["pT", "        System.out.println(teks.ambil().length());"],
      ["", "    }"], ["", "}"]],
    genErr: [...GEN,
      ["+mkE", "        Kotak<String> teks = new Kotak<>(10);"],
      ["", "    }"], ["", "}"]]
  };
  const lineOf = (ver, id) => CODE[ver].findIndex((l) => l[0].replace(/^\+/, "") === id) + 1;

  // ---------- metrik ----------
  const metricsOf = (f) => {
    const k = (f.classes || []).find((c) => c.id === "Kalkulator");
    const names = k ? new Set(k.members.map((m) => m.label.replace(/^\w+ /, "").split("(")[0])) : new Set();
    const out = f.out || [];
    return {
      names: names.size,
      vers: k ? k.members.filter((m) => /^(\w+ )?tambah\(/.test(m.label)).length : 0,
      lines: out.filter((l) => !l.startsWith("!")).length,
      err: out.filter((l) => /^!\S+\.java:\d+: error/.test(l)).length
    };
  };

  const S = OOPStory({ classes: [kal("b1", "b2", "b3", "b4")], objects: [], vars: [], loose: [], out: [], code: "beda" }, metricsOf);
  const steps = [];
  const ALL = ["m1", "m2", "m3", "m4"];

  // 1 — MASALAH: empat nama untuk satu ide
  S.snap({ line: "k_cls", note: "Empat method, empat nama, satu ide: menjumlahkan", tone: "alert", marks: Object.fromEntries(ALL.map((m) => ["c:Kalkulator.m:" + m, "hl"])), dur: 2400 });
  steps.push(S.take());

  // 2 — overloading
  S.s.code = "over";
  S.s.classes = [kal("m1", "m2", "m3", "m4")];
  S.snap({ line: "m1", note: "Satu nama: tambah. Yang berbeda daftar parameternya", marks: Object.fromEntries(ALL.map((m) => ["c:Kalkulator.m:" + m, "new"])), dur: 2400 });
  S.snap({ line: "m4", note: "Jumlah atau tipe parameter harus berbeda", marks: { "c:Kalkulator.m:m1": "hl", "c:Kalkulator.m:m3": "hl" }, dur: 2000 });
  steps.push(S.take());

  // 3 — compiler mencocokkan tipe argumen
  S.s.loose.push(call("c1", "tambah(1, 2)", 0));
  S.s.out.push("3");
  S.snap({ line: "c1", note: "Dua int → tambah(int, int)", tone: "done", flow: { path: ["l:c1", "c:Kalkulator.m:m1"] }, marks: { "l:c1": "hl", "c:Kalkulator.m:m1": "ok" }, dur: 2300 });
  S.s.loose.push(call("c2", "tambah(3.14, 0.0015)", 1));
  S.s.out.push("3.1415");
  S.snap({ line: "c2", note: "Dua double → tambah(double, double)", tone: "done", flow: { path: ["l:c2", "c:Kalkulator.m:m2"] }, marks: { "l:c2": "hl", "c:Kalkulator.m:m2": "ok" }, dur: 2300 });
  steps.push(S.take());

  // 4 — SOLUSI: semua panggilan terjawab, static binding
  S.s.loose.push(call("c3", "tambah(1, 2, 3)", 2));
  S.s.out.push("6");
  S.snap({ line: "c3", note: "Tiga argumen → versi tiga parameter", tone: "done", flow: { path: ["l:c3", "c:Kalkulator.m:m3"] }, marks: { "l:c3": "hl", "c:Kalkulator.m:m3": "ok" }, dur: 2200 });
  S.s.loose.push(call("c4", "tambah(\"Bina\", \"Nusantara\")", 3));
  S.s.out.push("BinaNusantara");
  S.snap({ line: "c4", note: "Dua String → digabung, bukan dijumlahkan", tone: "done", flow: { path: ["l:c4", "c:Kalkulator.m:m4"] }, marks: { "l:c4": "hl", "c:Kalkulator.m:m4": "ok" }, dur: 2300 });
  S.snap({ line: "c4", note: "Semua pilihan dibuat compiler: static binding", tone: "done", marks: Object.fromEntries(ALL.map((m) => ["c:Kalkulator.m:" + m, "ok"])), dur: 2000 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 5 — KASUS: konversi otomatis (widening)
  S.s.code = "lebar";
  S.s.out = [];
  S.s.loose = [call("c5", "tambah(1, 2.5)", 0)];
  S.snap({ line: "c5", note: "int dan double: tidak ada tambah(int, double)", tone: "alert", marks: { "l:c5": "hl", "c:Kalkulator.m:m1": "miss" }, dur: 2100 });
  S.s.out.push("3.5");
  S.snap({ line: "c5", note: "1 dilebarkan menjadi 1.0 → tambah(double, double)", tone: "done", flow: { path: ["l:c5", "c:Kalkulator.m:m2"] }, marks: { "l:c5": "hl", "c:Kalkulator.m:m2": "ok" }, dur: 2400 });
  S.s.loose.push(call("c6", "tambah(3.2, 3)", 1));
  S.s.out.push("6.2");
  S.snap({ line: "c6", note: "Contoh slide 3.2 + 3 = 6.2: angka 3 juga dilebarkan", tone: "done", flow: { path: ["l:c6", "c:Kalkulator.m:m2"] }, marks: { "l:c6": "hl", "c:Kalkulator.m:m2": "ok" }, dur: 2400 });
  steps.push(S.take());

  // 6 — KASUS: hanya tipe kembalian yang berbeda
  S.s.code = "dup";
  S.s.out = [];
  S.s.loose = [];
  S.s.classes = [kal("m1", "m5", "m2")];
  S.snap({ line: "m5", note: "Versi baru: kembaliannya double, parameternya sama", marks: { "c:Kalkulator.m:m5": "new", "c:Kalkulator.m:m1": "hl" }, dur: 2100 });
  S.s.out.push("!Kalkulator.java:" + lineOf("dup", "m5") + ": error: method tambah(int,int) is already defined in class Kalkulator");
  S.snap({ line: "m5", note: "Ditolak: tipe kembalian bukan bagian dari signature", tone: "alert", marks: { "c:Kalkulator.m:m5": "err", "c:Kalkulator.m:m1": "hl" }, dur: 2600 });
  steps.push(S.take());

  // 7 — KASUS: tidak ada versi yang cocok
  S.s.code = "salah";
  S.s.out = [];
  S.s.classes = [kal("m1", "m2", "m3", "m4")];
  S.s.loose = [call("c7", "tambah(true, 1)", 1)];
  S.snap({ line: "c7", note: "boolean dan int: dicari di keempat versi", marks: { "l:c7": "hl" }, flow: { path: ["l:c7", "c:Kalkulator"], kind: "err" }, dur: 2000 });
  S.s.out.push("!Kalkulator.java:" + lineOf("salah", "c7") + ": error: no suitable method found for tambah(boolean,int)");
  S.snap({ line: "c7", note: "Tidak ada yang cocok: error saat kompilasi", tone: "alert", marks: Object.assign({ "l:c7": "err" }, Object.fromEntries(ALL.map((m) => ["c:Kalkulator.m:" + m, "miss"]))), dur: 2500 });
  steps.push(S.take());

  // 8 — TEKNIK: parametric polymorphism (generic)
  S.s.code = "gen";
  S.s.out = [];
  S.s.loose = [];
  S.s.classes = [kotak()];
  S.snap({ line: "g_cls", note: "Kotak<T>: T adalah parameter tipe", marks: { "c:Kotak": "new" }, dur: 1900 });
  S.s.objects.push({ id: "ka", title: "Kotak<Integer>", ...OA, theme: "teal", attrs: [["isi", "10"]] });
  S.s.vars.push({ id: "angka", label: "Kotak<Integer> angka", u: OA.u - 0.9, v: 2.8, to: "ka" });
  S.snap({ line: "mkA", note: "T = Integer", marks: { "o:ka": "new" }, dur: 1700 });
  S.s.objects.push({ id: "kt", title: "Kotak<String>", ...OT, theme: "teal", attrs: [["isi", "\"Java\""]] });
  S.s.vars.push({ id: "teks", label: "Kotak<String> teks", u: OT.u - 0.3, v: 2.8, to: "kt" });
  S.snap({ line: "mkT", note: "T = String: class yang sama, tipe isi berbeda", marks: { "o:kt": "new" }, dur: 1900 });
  S.s.out.push("15");
  S.snap({ line: "pA", note: "angka.ambil() memberi Integer: bisa ditambah 5", tone: "done", flow: { path: ["v:angka", "o:ka", "c:Kotak.m:ambil"] }, marks: { "c:Kotak.m:ambil": "ok", "o:ka.a:isi": "hl" }, dur: 2200 });
  S.s.out.push("4");
  S.snap({ line: "pT", note: "teks.ambil() memberi String: punya length()", tone: "done", flow: { path: ["v:teks", "o:kt", "c:Kotak.m:ambil"] }, marks: { "c:Kotak.m:ambil": "ok", "o:kt.a:isi": "hl" }, dur: 2200 });
  S.s.code = "genErr";
  S.s.out = ["!Main.java:" + lineOf("genErr", "mkE") + ": error: incompatible types: cannot infer type arguments for Kotak<>"];
  S.s.objects = [S.s.objects[0]];
  S.s.vars = [S.s.vars[0]];
  S.snap({ line: "mkE", note: "Kotak<String> diisi 10? Ditolak compiler", tone: "alert", marks: { "c:Kotak.m:ctor": "err" }, dur: 2400 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "c1", note: "Satu nama, banyak versi: dipilih compiler", tone: "done", marks: Object.fromEntries(ALL.map((m) => ["c:Kalkulator.m:" + m, "ok"])), dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "overloading",
    renderer: "oop",
    lang: "java",
    title: "Overloading & Polimorfisme Statis",
    subtitle: "Satu nama method, banyak versi. Lihat bagaimana compiler memilih versi yang tepat dari tipe argumen, sebelum program dijalankan.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 2",
    learn: [
      { text: "Overloading: nama sama, daftar parameter berbeda", at: 1 },
      { text: "Compiler memilih versi dari tipe argumen (static binding)", at: 3 },
      { text: "Konversi otomatis int → double", at: 4 },
      { text: "Tipe kembalian bukan bagian dari signature", at: 5 },
      { text: "Parametric polymorphism dengan generic `Kotak<T>`", at: 7 }
    ],
    metrics: [
      { key: "names", label: "Nama method", icon: "Aa" },
      { key: "vers", label: "Versi tambah()", icon: "⧉" },
      { key: "lines", label: "Baris output", icon: "≡" },
      { key: "err", label: "Error kompilasi", icon: "!" }
    ],
    legend: [
      { color: "#6366f1", label: "Class" },
      { color: "#14b8a6", label: "Class generic" },
      { color: "#6366f1", round: true, label: "Pilihan compiler" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Empat nama", title: "Empat nama untuk satu ide",
        text: [
          "Kalkulator perlu menjumlahkan dua int, dua double, tiga int, dan menggabungkan dua String. Tanpa overloading, setiap versi butuh nama sendiri: `tambahInt`, `tambahDouble`, `tambahTiga`, `gabung`.",
          "Pemakai class harus menghafal **4 nama** untuk satu gagasan yang sama: menjumlahkan."
        ],
        changed: [["+", "4 method dengan 4 nama"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Overloading", title: "Satu nama, banyak versi",
        text: [
          "**Overloading**: beberapa method di class yang sama memakai **nama yang sama**, tetapi **daftar parameternya berbeda**, baik jumlahnya maupun tipenya.",
          "Keempat versi kini bernama `tambah`. Pemakai cukup mengingat satu nama."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Berbeda dengan overriding (signature harus sama, di subclass), overloading justru menuntut signature berbeda, biasanya di class yang sama." },
        changed: [["~", "Nama method 4 → 1"], ["~", "Versi tambah() 0 → 4"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Cocokkan tipe", title: "Compiler mencocokkan argumen",
        text: [
          "`tambah(1, 2)`: kedua argumen int, maka dipilih `tambah(int, int)` dan hasilnya `3`.",
          "`tambah(3.14, 0.0015)`: kedua argumen double, maka dipilih `tambah(double, double)` dan hasilnya `3.1415`. Ini contoh dari slide: simbol `+` di dalam keduanya pun berarti operasi berbeda, penjumlahan int dan penjumlahan double."
        ],
        changed: [["+", "Output: 3"], ["+", "Output: 3.1415"]],
        frames: steps[2]
      },
      {
        kind: "SOLUSI", short: "Static binding", title: "Static binding",
        text: [
          "`tambah(1, 2, 3)` cocok dengan versi tiga parameter (`6`). `tambah(\"Bina\", \"Nusantara\")` cocok dengan versi String, dan `+` pada String berarti **menggabungkan**: `BinaNusantara`.",
          "Semua pilihan ini dibuat **saat kompilasi**, sebelum program berjalan. Karena itu overloading disebut **static binding** atau *trivial polymorphism*. Slide menyebutnya juga **ad hoc polymorphism**: satu nama mewakili beberapa fungsi berbeda."
        ],
        callout: { type: "IDE KUNCI", text: "Overloading = polimorfisme saat kompilasi (statis). Overriding = polimorfisme saat runtime (dinamis)." },
        changed: [["+", "Output: 6 dan BinaNusantara"], ["~", "Baris output 2 → 4"]],
        frames: steps[3]
      },
      {
        kind: "KASUS", short: "int → double", title: "Kasus: tidak ada yang persis",
        text: [
          "`tambah(1, 2.5)`: tidak ada versi `tambah(int, double)`. Java boleh **melebarkan** int menjadi double tanpa kehilangan nilai, sehingga `tambah(double, double)` dipakai: `3.5`.",
          "Contoh slide `3.2 + 3 = 6.2` bekerja dengan cara yang sama: `3` dilebarkan menjadi `3.0`. Ini **konversi tipe otomatis** (*coercion*), bukan generic. Generic dibahas di langkah 8."
        ],
        changed: [["+", "Output: 3.5 dan 6.2"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Tipe kembalian", title: "Kasus: beda tipe kembalian saja",
        text: [
          "Bagaimana jika menambah `double tambah(int a, int b)`? Parameternya sama dengan `int tambah(int a, int b)`, hanya tipe kembaliannya berbeda.",
          "Compiler menolak: *method tambah(int,int) is already defined*. Dari pemanggilan `tambah(1, 2)` saja, compiler tidak bisa tahu versi mana yang dimaksud."
        ],
        callout: { type: "IDE KUNCI", text: "Signature untuk overloading = nama + jumlah, tipe, dan urutan parameter. Tipe kembalian tidak dihitung." },
        changed: [["+", "Error: already defined"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "Tidak cocok", title: "Kasus: tidak ada versi yang cocok",
        text: [
          "`tambah(true, 1)`: compiler mencoba keempat versi. boolean tidak bisa diubah menjadi int, double, atau String.",
          "Hasilnya error *no suitable method found*. Lagi-lagi, kesalahan ketahuan saat kompilasi, bukan saat program dipakai."
        ],
        changed: [["+", "Error: no suitable method found"]],
        frames: steps[6]
      },
      {
        kind: "TEKNIK", short: "Generic", title: "Parametric polymorphism: generic",
        text: [
          "**Parametric polymorphism** (generic) membuat satu class atau method yang bekerja untuk berbagai tipe. `Kotak<T>` punya parameter tipe `T`, yang diisi saat objek dibuat: `Kotak<Integer>`, `Kotak<String>`.",
          "`angka.ambil() + 5` menghasilkan `15`; `teks.ambil().length()` menghasilkan `4`. Compiler tetap memeriksa tipe: `Kotak<String>` diisi angka 10 langsung ditolak."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "`ArrayList<String>` dan `ArrayList<Integer>` yang sering dipakai adalah contoh generic dari pustaka Java." },
        changed: [["+", "class Kotak<T>"], ["+", "Kotak<Integer> dan Kotak<String>"], ["+", "Error: incompatible types"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Polimorfisme statis diputuskan saat kompilasi. Slide membaginya menjadi dua: **overload** dan **generic**. Polimorfisme dinamis (class, inheritance, abstract, interface) diputuskan saat runtime."],
        bullets: [
          "Overloading: nama sama, daftar parameter berbeda.",
          "Compiler memilih versi dari tipe argumen: static binding.",
          "int dapat dilebarkan otomatis ke double.",
          "Tipe kembalian bukan bagian dari signature.",
          "Generic `Kotak<T>`: satu class untuk banyak tipe, tetap aman tipe."
        ],
        quiz: [
          { q: "Manakah pasangan yang SAH sebagai overloading?", options: ["int f(int a) dan double f(int b)", "int f(int a) dan int f(double a)", "void f() dan void f()", "int f(int a) dan int f(int x)"], answer: 1, why: "Tipe parameternya berbeda. Tipe kembalian atau nama parameter saja tidak membedakan signature." },
          { q: "Kapan versi method yang di-overload dipilih?", options: ["Saat kompilasi", "Saat runtime", "Saat objek dibuat", "Saat program selesai"], answer: 0, why: "Overloading memakai static binding: compiler memilih dari tipe argumen." },
          { q: "`tambah(1, 2.5)` dengan versi (int,int) dan (double,double). Hasilnya?", options: ["3", "3.5", "Error kompilasi", "Error runtime"], answer: 1, why: "1 dilebarkan menjadi 1.0, lalu tambah(double, double) menghasilkan 3.5." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "Pelajaran berikutnya: **Polimorfisme dalam Aksi**, yaitu satu loop yang menghitung luas berbagai bentuk tanpa if."
  });
})();
