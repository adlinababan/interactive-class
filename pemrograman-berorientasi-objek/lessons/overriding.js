/* Pelajaran: Overriding & Dynamic Binding (Modul 08 · Sesi 8 · LO 2)
 * Kode Animal/Duck mengikuti slide "Overriding Method". Animal.java dan Duck.java digabung dalam satu panel.
 * Semua output dan pesan error sudah dicocokkan dengan javac/java 21.
 */
(function () {
  const AN = { u: -4.4, v: 0 }, DK = { u: -0.8, v: 0 };
  const OB = { u: 2.6, v: 0.2 }, OH = { u: 5.4, v: 0.2 }, OD = { u: 2.6, v: 0.2 };

  const M = {
    aprint: { id: "print", label: "print()", kind: "method" },
    print: { id: "print", label: "print()", kind: "method" },
    printS: { id: "print", label: "print(String msg)", kind: "method" },
    swim: { id: "swim", label: "swim()", kind: "method" }
  };
  const animal = () => ({ id: "Animal", ...AN, theme: "blue", members: [M.aprint] });
  const duck = (...ks) => ({ id: "Duck", ...DK, theme: "violet", parent: "Animal", members: ks.map((k) => M[k]) });
  const objDuck = (id, at) => ({ id, title: "objek Duck", ...at, theme: "violet", attrs: [] });
  const objAnimal = () => ({ id: "oh", title: "objek Animal", ...OH, theme: "sand", attrs: [] });

  // ---------- kode ----------
  const ANIMAL = [
    ["a_cls", "class Animal {"],
    ["a_print", "    public void print() {"],
    ["", "        System.out.println(\"This is a method from Class Animal\");"],
    ["", "    }"],
    ["", "}"],
    ["", ""]
  ];
  const CODE = {
    noov: [
      ...ANIMAL,
      ["d_cls", "public class Duck extends Animal {"],
      ["", "    // belum ada method print() sendiri"],
      ["", ""],
      ["", "    public static void main(String[] args) {"],
      ["mkB", "        Animal objB = new Duck();"],
      ["callB", "        objB.print();"],
      ["", "    }"],
      ["", "}"]
    ],
    slide: [
      ...ANIMAL,
      ["d_cls", "public class Duck extends Animal {"],
      ["+d_print", "    public void print() {"],
      ["", "        System.out.println(\"This is class Duck\");"],
      ["", "    }"],
      ["", "    public static void main(String[] args) {"],
      ["mkB", "        Animal objB = new Duck();"],
      ["mkH", "        Animal objH = new Animal();"],
      ["callH", "        objH.print();"],
      ["callB", "        objB.print();"],
      ["", "    }"],
      ["", "}"]
    ],
    salah: [
      ...ANIMAL,
      ["d_cls", "public class Duck extends Animal {"],
      ["+d_print", "    public void print(String msg) {"],
      ["", "        System.out.println(\"This is class Duck\");"],
      ["", "    }"],
      ["", "    public static void main(String[] args) {"],
      ["mkB", "        Animal objB = new Duck();"],
      ["callB", "        objB.print();"],
      ["", "    }"],
      ["", "}"]
    ],
    anot: [
      ...ANIMAL,
      ["d_cls", "public class Duck extends Animal {"],
      ["+ann", "    @Override"],
      ["d_print", "    public void print(String msg) {"],
      ["", "        System.out.println(\"This is class Duck\");"],
      ["", "    }"],
      ["", "    public static void main(String[] args) {"],
      ["mkB", "        Animal objB = new Duck();"],
      ["callB", "        objB.print();"],
      ["", "    }"],
      ["", "}"]
    ],
    swim: [
      ...ANIMAL,
      ["d_cls", "public class Duck extends Animal {"],
      ["ann", "    @Override"],
      ["d_print", "    public void print() {"],
      ["", "        System.out.println(\"This is class Duck\");"],
      ["", "    }"],
      ["+d_swim", "    public void swim() {"],
      ["", "        System.out.println(\"Duck is swimming\");"],
      ["", "    }"],
      ["", "    public static void main(String[] args) {"],
      ["mkB", "        Animal objB = new Duck();"],
      ["callS", "        objB.swim();"],
      ["", "    }"],
      ["", "}"]
    ],
    fix: [
      ...ANIMAL,
      ["d_cls", "public class Duck extends Animal {"],
      ["ann", "    @Override"],
      ["d_print", "    public void print() {"],
      ["", "        System.out.println(\"This is class Duck\");"],
      ["", "    }"],
      ["d_swim", "    public void swim() {"],
      ["", "        System.out.println(\"Duck is swimming\");"],
      ["", "    }"],
      ["", "    public static void main(String[] args) {"],
      ["+mkD", "        Duck objD = new Duck();"],
      ["+callS", "        objD.swim();"],
      ["+callP", "        objD.print();"],
      ["", "    }"],
      ["", "}"]
    ]
  };

  // nomor baris di panel kode (dipakai pesan error compiler)
  const lineOf = (ver, id) => CODE[ver].findIndex((l) => l[0].replace(/^\+/, "") === id) + 1;

  // ---------- metrik ----------
  const metricsOf = (f) => {
    const out = f.out || [];
    const dk = (f.classes || []).find((c) => c.id === "Duck");
    return {
      objs: (f.objects || []).length,
      over: dk ? dk.members.filter((m) => m.label === "print()").length : 0,
      lines: out.filter((l) => !l.startsWith("!")).length,
      err: out.filter((l) => /^!\S+\.java:\d+: error/.test(l)).length
    };
  };

  const S = OOPStory({ classes: [animal(), duck()], objects: [], vars: [], out: [], code: "noov" }, metricsOf);
  const steps = [];

  // 1 — MASALAH: bebek berbicara seperti Animal
  S.snap({ line: "d_cls", note: "Duck extends Animal, belum punya print() sendiri", marks: { "c:Duck": "new" }, dur: 1800 });
  S.s.objects.push(objDuck("ob", OB));
  S.s.vars.push({ id: "objB", label: "Animal objB", u: OB.u - 0.9, v: 2.7, to: "ob" });
  S.snap({ line: "mkB", note: "Animal objB = new Duck()", marks: { "o:ob": "new" }, dur: 1700 });
  S.s.out.push("This is a method from Class Animal");
  S.snap({ line: "callB", note: "Bebek mencetak pesan milik Animal", tone: "alert", flow: { path: ["v:objB", "o:ob", "c:Duck", "c:Animal.m:print"] }, marks: { "c:Duck": "miss", "c:Animal.m:print": "hl" }, dur: 2400 });
  steps.push(S.take());

  // 2 — override
  S.s.code = "slide";
  S.s.out = [];
  S.s.objects = []; S.s.vars = [];
  S.s.classes = [animal(), duck("print")];
  S.snap({ line: "d_print", note: "Duck menulis ulang print()", marks: { "c:Duck.m:print": "new" }, dur: 1800 });
  S.snap({ line: "d_print", note: "Nama, parameter, dan tipe kembalian sama persis", marks: { "c:Duck.m:print": "hl", "c:Animal.m:print": "hl" }, links: [{ id: "sig", from: "c:Duck.m:print", to: "c:Animal.m:print", label: "signature sama", dashed: true }], dur: 2200 });
  steps.push(S.take());

  // 3 — supertype & subtype
  S.s.objects.push(objDuck("ob", OB));
  S.s.vars.push({ id: "objB", label: "Animal objB", u: OB.u - 0.9, v: 2.7, to: "ob" });
  S.snap({ line: "mkB", note: "Variabel bertipe Animal, objeknya Duck", marks: { "v:objB": "hl", "o:ob": "new" }, dur: 2000 });
  S.s.objects.push(objAnimal());
  S.s.vars.push({ id: "objH", label: "Animal objH", u: OH.u - 0.6, v: 2.7, to: "oh" });
  S.snap({ line: "mkH", note: "objH: variabel Animal, objek Animal", marks: { "v:objH": "hl", "o:oh": "new" }, dur: 1900 });
  steps.push(S.take());

  // 4 — objH.print()
  S.s.out.push("This is a method from Class Animal");
  S.snap({ line: "callH", note: "objH.print(): objeknya Animal, jalankan versi Animal", tone: "done", flow: { path: ["v:objH", "o:oh", "c:Animal.m:print"] }, marks: { "c:Animal.m:print": "ok" }, dur: 2400 });
  steps.push(S.take());

  // 5 — SOLUSI: dynamic binding
  S.snap({ line: "callB", note: "Saat berjalan, JVM melihat objek aslinya: Duck", flow: { path: ["v:objB", "o:ob"] }, marks: { "o:ob": "hl" }, dur: 1800 });
  S.s.out.push("This is class Duck");
  S.snap({ line: "callB", note: "Dynamic binding: versi Duck yang dijalankan", tone: "done", flow: { path: ["v:objB", "o:ob", "c:Duck.m:print"] }, marks: { "c:Duck.m:print": "ok", "c:Animal.m:print": "over" }, dur: 2600 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 6 — KASUS: signature berbeda
  S.s.code = "salah";
  S.s.out = [];
  S.s.classes = [animal(), duck("printS")];
  S.s.objects = [objDuck("ob", OB)];
  S.s.vars = [{ id: "objB", label: "Animal objB", u: OB.u - 0.9, v: 2.7, to: "ob" }];
  S.snap({ line: "d_print", note: "print(String msg): parameternya berbeda", marks: { "c:Duck.m:print": "hl" }, dur: 1900 });
  S.s.out.push("This is a method from Class Animal");
  S.snap({ line: "callB", note: "Ini overloading, bukan override: Animal.print() yang jalan", tone: "alert", flow: { path: ["v:objB", "o:ob", "c:Duck", "c:Animal.m:print"] }, marks: { "c:Duck.m:print": "miss", "c:Animal.m:print": "hl" }, dur: 2600 });
  steps.push(S.take());

  // 7 — KASUS: @Override menangkap kesalahan
  S.s.code = "anot";
  S.s.out = [];
  S.snap({ line: "ann", note: "Tambahkan @Override di atas method", marks: { "c:Duck.m:print": "hl" }, dur: 1700 });
  S.s.out.push("!Duck.java:" + lineOf("anot", "ann") + ": error: method does not override or implement a method from a supertype");
  S.snap({ line: "ann", note: "Compiler menolak: kesalahan ketahuan sebelum program berjalan", tone: "done", marks: { "c:Duck.m:print": "err" }, dur: 2600 });
  steps.push(S.take());

  // 8 — KASUS: tipe variabel membatasi method yang boleh dipanggil
  S.s.code = "swim";
  S.s.out = [];
  S.s.classes = [animal(), duck("print", "swim")];
  S.snap({ line: "d_swim", note: "Duck punya method baru: swim()", marks: { "c:Duck.m:swim": "new" }, dur: 1600 });
  S.s.out.push("!Duck.java:" + lineOf("swim", "callS") + ": error: cannot find symbol", "!  symbol:   method swim()", "!  location: variable objB of type Animal");
  S.snap({ line: "callS", note: "Compiler hanya melihat tipe variabel: Animal tidak punya swim()", tone: "alert", flow: { path: ["v:objB", "c:Animal"], kind: "err" }, marks: { "c:Animal": "miss", "c:Duck.m:swim": "ghost" }, dur: 2600 });
  S.s.code = "fix";
  S.s.out = ["Duck is swimming", "This is class Duck"];
  S.s.objects = [objDuck("od", OD)];
  S.s.vars = [{ id: "objD", label: "Duck objD", u: OD.u - 0.7, v: 2.7, to: "od" }];
  S.snap({ line: "callS", note: "Variabel bertipe Duck: swim() boleh dipanggil", tone: "done", flow: { path: ["v:objD", "o:od", "c:Duck.m:swim"] }, marks: { "c:Duck.m:swim": "ok", "o:od": "new" }, dur: 2600 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "callB", note: "Tipe variabel: apa yang boleh dipanggil · tipe objek: versi yang dijalankan", tone: "done", marks: { "c:Duck.m:print": "ok" }, dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "overriding",
    renderer: "oop",
    lang: "java",
    title: "Overriding & Dynamic Binding",
    subtitle: "Dua variabel bertipe Animal memanggil method yang sama, tetapi hasilnya berbeda. Ikuti bagaimana Java memilih versi print() saat program berjalan.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 2",
    learn: [
      { text: "Menimpa (override) method class induk", at: 1 },
      { text: "Subtype dan supertype: `Animal objB = new Duck()`", at: 2 },
      { text: "Dynamic binding: versi method dipilih dari objeknya", at: 4 },
      { text: "`@Override` untuk menangkap salah signature", at: 6 },
      { text: "Tipe variabel membatasi method yang boleh dipanggil", at: 7 }
    ],
    metrics: [
      { key: "objs", label: "Objek", icon: "◆" },
      { key: "over", label: "Method di-override", icon: "↻" },
      { key: "lines", label: "Baris output", icon: "≡" },
      { key: "err", label: "Error kompilasi", icon: "!" }
    ],
    legend: [
      { color: "#6366f1", label: "Superclass" },
      { color: "#d946ef", label: "Subclass" },
      { color: "#6366f1", round: true, label: "Jalur pemanggilan" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Bebek salah", title: "Bebek yang bicara seperti Animal",
        text: [
          "`Duck extends Animal`: Duck mewarisi semua method Animal, termasuk `print()`. Karena Duck belum punya `print()` sendiri, pemanggilan `objB.print()` naik ke Animal.",
          "Hasilnya `This is a method from Class Animal`. Benar secara aturan pewarisan, tetapi salah untuk seekor bebek."
        ],
        changed: [["+", "class Duck extends Animal"], ["+", "Objek Duck"], ["+", "Output milik Animal"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Override", title: "Menulis ulang print()",
        text: [
          "**Overriding**: subclass menulis ulang method yang sudah ada di superclass, dengan **signature yang sama**, yaitu nama, jumlah dan tipe parameter, serta tipe kembaliannya.",
          "Sekarang Duck punya `print()` miliknya sendiri. Animal tetap menyimpan versinya untuk objek Animal."
        ],
        callout: { type: "IDE KUNCI", text: "Polymorphism berarti \"banyak bentuk\": satu nama method, perilakunya bergantung pada objek yang menjalankannya." },
        changed: [["+", "Duck.print()"], ["~", "Method di-override 0 → 1"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Subtype", title: "Supertype dan subtype",
        text: [
          "Setiap class mendefinisikan sebuah **tipe**. Tipe dari subclass disebut **subtype** (Duck), tipe dari superclass disebut **supertype** (Animal).",
          "Variabel bertipe supertype boleh menunjuk objek subtype: `Animal objB = new Duck()`. Bebek adalah hewan, jadi penugasan ini sah. `objH` menunjuk objek Animal biasa."
        ],
        changed: [["+", "Animal objB → objek Duck"], ["+", "Animal objH → objek Animal"], ["~", "Objek 0 → 2"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "objH.print()", title: "Objek Animal, versi Animal",
        text: [
          "`objH.print()`: objek yang ditunjuk `objH` adalah Animal, maka yang dijalankan `Animal.print()`.",
          "Baris output pertama sama dengan slide: `This is a method from Class Animal`."
        ],
        changed: [["+", "Output baris 1"]],
        frames: steps[3]
      },
      {
        kind: "SOLUSI", short: "Dynamic binding", title: "Dynamic binding",
        text: [
          "`objB.print()`: tipe variabelnya Animal, tetapi saat program **berjalan** (runtime) JVM melihat objek aslinya, yaitu Duck. Maka yang dijalankan `Duck.print()`.",
          "Output kedua: `This is class Duck`. Pemilihan versi method saat runtime ini disebut **dynamic binding**, ciri **pure polymorphism**."
        ],
        callout: { type: "IDE KUNCI", text: "Variabel yang sama tipenya bisa menghasilkan perilaku berbeda, tergantung objek yang ditunjuknya." },
        changed: [["+", "Output: This is class Duck"], ["~", "Baris output 1 → 2"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Salah signature", title: "Kasus: parameter berbeda",
        text: [
          "Bagaimana jika Duck menulis `print(String msg)`? Namanya sama, tetapi parameternya berbeda. Ini **overloading** (menambah versi baru), bukan overriding.",
          "`objB.print()` tanpa argumen tidak cocok dengan `print(String)`, sehingga Java memakai `Animal.print()`. Program tetap jalan, tetapi bebek kembali bicara seperti Animal."
        ],
        changed: [["~", "Duck.print() → Duck.print(String msg)"], ["~", "Method di-override 1 → 0"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "@Override", title: "Kasus: @Override menangkap kesalahan",
        text: [
          "Tambahkan anotasi `@Override` di atas method. Artinya: \"method ini harus menimpa method superclass\".",
          "Karena `print(String)` tidak menimpa apa pun, compiler langsung menolak: *method does not override or implement a method from a supertype*. Kesalahan ketahuan sebelum program dijalankan."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Biasakan menulis `@Override` setiap kali menimpa method. Tanpa anotasi, salah ketik signature lolos diam-diam seperti di langkah sebelumnya." },
        changed: [["+", "@Override"], ["+", "Error kompilasi"]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "Tipe variabel", title: "Kasus: objB.swim()",
        text: [
          "Duck mendapat method baru `swim()`. Tetapi `objB.swim()` ditolak: *cannot find symbol*. Saat **kompilasi**, Java hanya tahu `objB` bertipe Animal, dan Animal tidak punya `swim()`.",
          "Jika butuh method khusus Duck, gunakan variabel bertipe Duck: `Duck objD = new Duck()`. Sekarang `swim()` dan `print()` versi Duck bisa dipanggil."
        ],
        callout: { type: "IDE KUNCI", text: "Tipe **variabel** menentukan method apa yang boleh dipanggil (dicek compiler). Tipe **objek** menentukan versi mana yang dijalankan (dipilih saat runtime)." },
        changed: [["+", "Duck.swim()"], ["+", "Error: cannot find symbol"], ["+", "Duck objD"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Overriding membuat satu pemanggilan `print()` menghasilkan perilaku berbeda untuk objek berbeda. Java memilih versinya saat program berjalan."],
        bullets: [
          "Override: subclass menulis ulang method dengan signature yang sama.",
          "Supertype boleh menunjuk objek subtype: `Animal objB = new Duck()`.",
          "Dynamic binding: versi method dipilih dari objek aslinya, saat runtime.",
          "`@Override` membuat compiler memeriksa signature.",
          "Tipe variabel membatasi method yang boleh dipanggil."
        ],
        quiz: [
          { q: "`Animal a = new Duck(); a.print();` Jika Duck meng-override print(), versi mana yang dijalankan?", options: ["Animal.print()", "Duck.print()", "Keduanya", "Error kompilasi"], answer: 1, why: "Dynamic binding memilih versi dari objek aslinya, yaitu Duck." },
          { q: "Duck menulis `print(String msg)` sedangkan Animal punya `print()`. Ini disebut…", options: ["Overriding", "Overloading", "Dynamic binding", "Abstract method"], answer: 1, why: "Parameternya berbeda, jadi ini versi baru (overloading), bukan penimpaan." },
          { q: "`Animal a = new Duck(); a.swim();` (swim hanya ada di Duck). Apa yang terjadi?", options: ["Duck berenang", "Animal.swim() dijalankan", "Error kompilasi: cannot find symbol", "Error saat runtime"], answer: 2, why: "Compiler memeriksa tipe variabel (Animal), dan Animal tidak punya swim()." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "Pelajaran berikutnya: **Overloading**, yaitu banyak versi method dengan nama yang sama, dipilih oleh compiler."
  });
})();
