/* Pelajaran: Class & Objek (Modul 07 · Teori 9 · Lab 9 · LO 3)
 * Contoh kode mengikuti slide "Classes" (Python Crash Course, Bab 9): class Dog.
 * Semua output konsol sudah dicocokkan dengan menjalankan programnya di Python 3.13.
 */
(function () {
  const DOG = { u: -3.4, v: 0 };
  const O1 = { u: 0.2, v: 0 }, O2 = { u: 2.7, v: 0 };
  const MEMBERS = [
    { id: "init", label: "__init__(self, name, age)", kind: "method" },
    { id: "name", label: "self.name", kind: "attr" },
    { id: "age", label: "self.age", kind: "attr" },
    { id: "sit", label: "sit(self)", kind: "method" },
    { id: "roll", label: "roll_over(self)", kind: "method" }
  ];

  const CODE = {
    loose: [
      ["l1", "dog1_name = 'Willie'"],
      ["l2", "dog1_age = 6"],
      ["l3", "dog2_name = 'Lucy'"],
      ["l4", "dog2_age = 3"],
      ["", ""],
      ["fn", "def sit(name):"],
      ["fnp", "    print(f\"{name} is now sitting.\")"],
      ["", ""],
      ["call", "sit(dog1_name)"]
    ],
    cls: [
      ["cls", "class Dog:"],
      ["doc", "    \"\"\"A simple attempt to model a dog.\"\"\""],
      ["", ""],
      ["init", "    def __init__(self, name, age):"],
      ["", "        \"\"\"Initialize name and age attributes.\"\"\""],
      ["sname", "        self.name = name"],
      ["sage", "        self.age = age"],
      ["", ""],
      ["sit", "    def sit(self):"],
      ["", "        \"\"\"Simulate a dog sitting in response to a command.\"\"\""],
      ["sitp", "        print(f\"{self.name} is now sitting.\")"],
      ["", ""],
      ["roll", "    def roll_over(self):"],
      ["", "        \"\"\"Simulate rolling over in response to a command.\"\"\""],
      ["rollp", "        print(f\"{self.name} rolled over!\")"],
      ["", ""],
      ["mk1", "my_dog = Dog('Willie', 6)"],
      ["p1", "print(f\"My dog's name is {my_dog.name}.\")"],
      ["p2", "print(f\"My dog is {my_dog.age} years old.\")"],
      ["c1", "my_dog.sit()"],
      ["c2", "my_dog.roll_over()"],
      ["", ""],
      ["mk2", "your_dog = Dog('Lucy', 3)"],
      ["p3", "print(f\"\\nYour dog's name is {your_dog.name}.\")"],
      ["p4", "print(f\"Your dog is {your_dog.age} years old.\")"],
      ["c3", "your_dog.sit()"]
    ],
    many: [
      ["cls", "class Dog:"],
      ["", "    --snip--"],
      ["", ""],
      ["m1", "dogs = []"],
      ["m2", "for i in range(100):"],
      ["m3", "    dogs.append(Dog(f\"Dog {i + 1}\", i % 15 + 1))"],
      ["", ""],
      ["m4", "print(len(dogs))"],
      ["m5", "dogs[41].sit()"]
    ],
    err: [
      ["cls", "class Dog:"],
      ["init", "    def __init__(self, name, age):"],
      ["sname", "        self.name = name"],
      ["sage", "        self.age = age"],
      ["", ""],
      ["sit", "    def sit():          # lupa self"],
      ["sitp", "        print(f\"{self.name} is now sitting.\")"],
      ["", ""],
      ["mk1", "my_dog = Dog('Willie', 6)"],
      ["c1", "my_dog.sit()"]
    ]
  };

  const metricsOf = (f) => ({
    vars: (f.vars || []).length + (f.loose || []).filter((l) => !l.fn).length,
    attrs: (f.objects || []).reduce((n, o) => n + o.attrs.length, 0) + (f.crowd ? f.crowd.n * 2 : 0),
    calls: f.calls || 0,
    objs: (f.objects || []).length + (f.crowd ? f.crowd.n : 0)
  });

  const S = OOPStory({
    classes: [], objects: [], vars: [], out: [], calls: 0, code: "loose",
    loose: [
      { id: "d1n", text: "dog1_name = 'Willie'", u: -1.6, v: -0.4, z: 1.5 },
      { id: "d1a", text: "dog1_age = 6", u: 1.4, v: -0.6, z: 0.6 },
      { id: "d2n", text: "dog2_name = 'Lucy'", u: -1.0, v: 1.5, z: 0.4 },
      { id: "d2a", text: "dog2_age = 3", u: 1.9, v: 1.3, z: 1.4 },
      { id: "fn", text: "def sit(name)", u: 4.4, v: 0.4, z: 0.9, fn: true }
    ]
  }, metricsOf);
  const dogClass = (members) => ({ id: "Dog", ...DOG, theme: "blue", members });
  const steps = [];

  // 1 — MASALAH
  S.snap({ line: "l1", note: "2 anjing = 4 variabel lepas + 1 fungsi terpisah", tone: "alert", dur: 1700 });
  S.s.out.push("Willie is now sitting.");
  S.snap({ line: "call", flow: { path: ["l:fn", "l:d1n"] }, marks: { "l:d1n": "hl" }, note: "sit() harus diberi nama anjingnya satu per satu", tone: "alert", dur: 1400 });
  steps.push(S.take());

  // 2 — class = cetakan
  S.s.loose = [];
  S.s.out = [];
  S.s.code = "cls";
  S.s.classes = [dogClass(MEMBERS)];
  S.snap({ line: "cls", note: "class Dog: cetakan, belum ada anjingnya", marks: { "c:Dog": "new" }, dur: 1800 });
  S.snap({ line: "sit", note: "Method = fungsi yang tinggal di dalam class", marks: { "c:Dog.m:sit": "hl", "c:Dog.m:roll": "hl", "c:Dog.m:init": "hl" }, dur: 1500 });
  steps.push(S.take());

  // 3 — __init__ dan self
  S.snap({ line: "init", note: "__init__ dijalankan otomatis saat objek dibuat", marks: { "c:Dog.m:init": "hl" }, noteAt: "c:Dog.m:roll", dur: 1500 });
  S.snap({ line: "sname", note: "self.name: atribut yang akan dimiliki tiap objek", marks: { "c:Dog.m:name": "hl" }, noteAt: "c:Dog.m:roll", dur: 1300 });
  S.snap({ line: "sage", note: "self = objek yang sedang dibuat", marks: { "c:Dog.m:name": "hl", "c:Dog.m:age": "hl" }, noteAt: "c:Dog.m:roll", dur: 1300 });
  steps.push(S.take());

  // 4 — membuat instance
  S.snap({ line: "mk1", note: "Dog('Willie', 6)  →  Python memanggil __init__", marks: { "c:Dog.m:init": "hl" }, dur: 1200 });
  S.s.objects.push({ id: "o1", title: "objek Dog", ...O1, theme: "sand", attrs: [] });
  S.snap({ line: "init", note: "Objek baru dibuat dari cetakan", flow: { path: ["c:Dog.m:init", "o:o1"] }, marks: { "c:Dog.m:init": "hl" }, dur: 1500 });
  S.setAttr("o1", "name", "'Willie'");
  S.snap({ line: "sname", note: "self.name = 'Willie'", marks: { "o:o1.a:name": "chg", "c:Dog.m:name": "hl" }, dur: 1100 });
  S.setAttr("o1", "age", "6");
  S.snap({ line: "sage", note: "self.age = 6", marks: { "o:o1.a:age": "chg", "c:Dog.m:age": "hl" }, dur: 1100 });
  S.s.vars.push({ id: "my_dog", u: O1.u - 0.7, v: 2.3, to: "o1" });
  S.snap({ line: "mk1", note: "Variabel my_dog menunjuk ke objek itu", marks: { "v:my_dog": "new" }, dur: 1200 });
  steps.push(S.take());

  // 5 — dot notation (atribut)
  S.s.out.push("My dog's name is Willie.");
  S.snap({ line: "p1", note: "my_dog.name  →  'Willie'", flow: { path: ["v:my_dog", "o:o1", "o:o1.a:name"] }, marks: { "o:o1.a:name": "hl" }, dur: 1700 });
  S.s.out.push("My dog is 6 years old.");
  S.snap({ line: "p2", note: "my_dog.age  →  6", flow: { path: ["v:my_dog", "o:o1", "o:o1.a:age"] }, marks: { "o:o1.a:age": "hl" }, dur: 1700 });
  steps.push(S.take());

  // 6 — memanggil method
  S.snap({ line: "c1", note: "my_dog.sit(): sit() dicari di class Dog", flow: { path: ["v:my_dog", "o:o1", "c:Dog.m:sit"] }, marks: { "c:Dog.m:sit": "hl" }, dur: 1500 });
  S.s.calls = 1;
  S.s.out.push("Willie is now sitting.");
  S.snap({ line: "sitp", note: "self = my_dog, jadi self.name = 'Willie'", flow: { path: ["c:Dog.m:sit", "o:o1.a:name"] }, marks: { "c:Dog.m:sit": "ok", "o:o1.a:name": "hl" }, dur: 1600 });
  S.s.calls = 2;
  S.s.out.push("Willie rolled over!");
  S.snap({ line: "c2", note: "my_dog.roll_over()", flow: { path: ["v:my_dog", "o:o1", "c:Dog.m:roll"] }, marks: { "c:Dog.m:roll": "ok" }, dur: 1600 });
  steps.push(S.take());

  // 7 — banyak instance (SOLUSI)
  S.s.objects.push({ id: "o2", title: "objek Dog", ...O2, theme: "teal", attrs: [] });
  S.snap({ line: "mk2", note: "Dog('Lucy', 3): cetakan yang sama, objek baru", flow: { path: ["c:Dog.m:init", "o:o2"] }, marks: { "c:Dog.m:init": "hl" }, dur: 1500 });
  S.setAttr("o2", "name", "'Lucy'");
  S.setAttr("o2", "age", "3");
  S.s.vars.push({ id: "your_dog", u: O2.u - 0.7, v: 2.3, to: "o2" });
  S.snap({ line: "mk2", note: "Atribut milik masing-masing objek", marks: { "o:o2.a:name": "chg", "o:o2.a:age": "chg" }, dur: 1300 });
  S.s.out.push("", "Your dog's name is Lucy.", "Your dog is 3 years old.");
  S.snap({ line: "p4", note: "your_dog.name  →  'Lucy'", flow: { path: ["v:your_dog", "o:o2", "o:o2.a:name"] }, marks: { "o:o2.a:name": "hl" }, dur: 1400 });
  S.s.calls = 3;
  S.s.out.push("Lucy is now sitting.");
  S.snap({ line: "c3", note: "Method sit() dipakai bersama oleh semua objek", tone: "done", flow: { path: ["v:your_dog", "o:o2", "c:Dog.m:sit"] }, marks: { "c:Dog.m:sit": "ok" }, dur: 1500 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 8 — KASUS: seratus anjing
  S.s.objects = [];
  S.s.vars = [{ id: "dogs", u: -0.9, v: 4.6, to: "crowd" }];
  S.s.out = [];
  S.s.calls = 0;
  S.s.code = "many";
  S.s.crowd = { n: 100, show: 30, cols: 6, u: 0.2, v: 0.2, theme: "sand", label: "dogs: 100 objek Dog" };
  S.snap({ line: "m3", note: "100 kali Dog(...): satu cetakan, 100 objek", dur: 2000 });
  S.s.out.push("100");
  S.snap({ line: "m4", note: "len(dogs)  →  100", dur: 1200 });
  S.s.calls = 1;
  S.s.out.push("Dog 42 is now sitting.");
  S.snap({ line: "m5", note: "dogs[41].sit(): method tetap satu di class", tone: "done", flow: { path: ["v:dogs", "crowd", "c:Dog.m:sit"] }, marks: { "c:Dog.m:sit": "ok" }, dur: 1500 });
  steps.push(S.take());

  // 9 — KASUS: lupa self
  delete S.s.crowd;
  S.s.code = "err";
  S.s.out = [];
  S.s.calls = 0;
  S.s.classes = [dogClass(MEMBERS.map((m) => (m.id === "sit" ? { ...m, label: "sit()" } : m)))];
  S.s.objects = [{ id: "o1", title: "objek Dog", ...O1, theme: "sand", attrs: [["name", "'Willie'"], ["age", "6"]] }];
  S.s.vars = [{ id: "my_dog", u: O1.u - 0.7, v: 2.3, to: "o1" }];
  S.snap({ line: "sit", note: "def sit():  tanpa self", tone: "alert", marks: { "c:Dog.m:sit": "err" }, dur: 1500 });
  S.s.out.push("!TypeError: Dog.sit() takes 0 positional arguments but 1 was given");
  S.snap({ line: "c1", note: "Python tetap mengirim my_dog sebagai argumen pertama", tone: "alert", flow: { path: ["v:my_dog", "o:o1", "c:Dog.m:sit"], kind: "err" }, marks: { "c:Dog.m:sit": "err" }, dur: 1700 });
  steps.push(S.take());

  // 10 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "cls", note: "1 cetakan · 2 objek · method dipakai bersama", tone: "done", marks: { "c:Dog": "ok" }, dur: 900 });
  steps.push(S.take());

  const init = steps[0][0];
  const M = (s) => s.length && s[s.length - 1].metrics;
  const m7 = M(steps[6]), m8 = M(steps[7]);

  Kelas.registerLesson({
    slug: "class-objek",
    renderer: "oop",
    title: "Class & Objek: Satu Cetakan, Banyak Objek",
    subtitle: "Buat class Dog, cetak dua objek darinya, lalu lihat ke mana Python mencari atribut dan method saat kamu menulis my_dog.sit().",
    minutes: 15,
    level: "Pemula",
    lo: "LO 3",
    learn: [
      { text: "Class sebagai cetakan, objek (instance) sebagai hasil cetakannya", at: 1 },
      { text: "Peran `__init__()` dan `self` saat objek dibuat", at: 3 },
      { text: "Mengakses atribut dan memanggil method dengan dot notation", at: 5 },
      { text: "Atribut milik tiap objek, method dipakai bersama", at: 6 },
      { text: "Membaca error ketika `self` terlupa", at: 8 }
    ],
    metrics: [
      { key: "vars", label: "Variabel", icon: "x=" },
      { key: "attrs", label: "Atribut", icon: "•" },
      { key: "calls", label: "Method dipanggil", icon: "()" },
      { key: "objs", label: "Objek", icon: "◆", total: true }
    ],
    legend: [
      { color: "#6366f1", label: "Class (cetakan)" },
      { color: "#fde68a", label: "Objek" },
      { color: "#eef0ff", border: "#6366f1", label: "Variabel" },
      { color: "#6366f1", round: true, label: "Jalur pemanggilan" }
    ],
    code: CODE,
    initial: init,
    steps: [
      {
        kind: "MASALAH", short: "Variabel lepas", title: "Data anjing yang tercecer",
        text: [
          "Klinik hewan menyimpan data dua anjing: Willie (6 tahun) dan Lucy (3 tahun). Tanpa class, setiap data jadi variabel sendiri: `dog1_name`, `dog1_age`, `dog2_name`, `dog2_age`. Sudah **4 variabel** hanya untuk 2 anjing.",
          "Perilakunya juga terpisah: fungsi `sit(name)` harus diberi nama anjing satu per satu. Tidak ada yang mengikat nama, umur, dan perilaku menjadi satu \"anjing\"."
        ],
        callout: { type: "IDE KUNCI", text: "Object-oriented programming (OOP) memodelkan benda di dunia nyata: datanya (atribut) dan perilakunya (method) disatukan." },
        changed: [["+", "4 variabel lepas"], ["+", "1 fungsi terpisah"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Cetakan", title: "Class adalah cetakan",
        text: [
          "`class Dog:` mendefinisikan apa yang dimiliki **setiap** anjing: atribut `name` dan `age`, serta perilaku `sit()` dan `roll_over()`. Belum ada satu anjing pun. Ini baru cetakannya.",
          "Fungsi yang berada di dalam class disebut **method**. Nama class ditulis dengan huruf kapital di awal (CamelCase)."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Tidak ada tanda kurung setelah `class Dog` karena class ini dibuat dari nol. Tanda kurung baru dipakai saat inheritance." },
        changed: [["+", "class Dog dengan 2 atribut dan 3 method"], ["-", "4 variabel lepas"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "__init__", title: "__init__() dan self",
        text: [
          "`__init__()` adalah method khusus yang dijalankan Python **otomatis** setiap kali objek baru dibuat. Parameternya: `self`, `name`, dan `age`.",
          "`self` adalah objek yang sedang dibuat. Baris `self.name = name` menyimpan nilai `name` ke dalam objek itu, sehingga bisa dipakai oleh method lain."
        ],
        callout: { type: "IDE KUNCI", text: "Variabel berawalan `self.` adalah **atribut**: tersedia di setiap method dan di setiap objek yang dibuat dari class ini." },
        changed: [["~", "Sorotan: __init__, self.name, self.age"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Instance", title: "Membuat objek (instance)",
        text: [
          "`my_dog = Dog('Willie', 6)` meminta Python membuat objek dari cetakan Dog. Python memanggil `__init__()`, mengisi `self.name = 'Willie'` dan `self.age = 6`, lalu mengembalikan objeknya.",
          "Objek itu disimpan di variabel `my_dog`. Membuat objek dari class disebut **instantiation**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Kita tidak pernah menulis `return` di `__init__()`. Python otomatis mengembalikan objek yang baru dibuat." },
        changed: [["+", "Objek Dog pertama"], ["+", "Atribut name = 'Willie', age = 6"], ["+", "Variabel my_dog"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Atribut", title: "Dot notation: membaca atribut",
        text: [
          "`my_dog.name` dibaca: \"di objek my_dog, ambil atribut name\". Python mengikuti panah dari variabel ke objek, lalu mengambil nilainya: `'Willie'`.",
          "Atribut ini sama dengan `self.name` di dalam class. Dari luar class kita menulis `my_dog.name`; dari dalam method kita menulis `self.name`."
        ],
        changed: [["+", "Output: My dog's name is Willie."], ["+", "Output: My dog is 6 years old."]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Method", title: "Memanggil method",
        text: [
          "Saat membaca `my_dog.sit()`, Python mencari `sit()` di **class** Dog, bukan di objeknya. Method tinggal di class; objek hanya menyimpan atribut.",
          "Python otomatis mengirim `my_dog` sebagai `self`. Karena itu `self.name` di dalam `sit()` bernilai `'Willie'`."
        ],
        callout: { type: "IDE KUNCI", text: "`my_dog.sit()` sama dengan `Dog.sit(my_dog)`. Objek di depan titik menjadi `self`." },
        changed: [["+", "Output: Willie is now sitting."], ["+", "Output: Willie rolled over!"], ["~", "Method dipanggil 0 → 2"]],
        frames: steps[5]
      },
      {
        kind: "SOLUSI", short: "Banyak objek", title: "Satu cetakan, banyak objek",
        text: [
          "`your_dog = Dog('Lucy', 3)` mencetak objek kedua. Setiap objek punya atributnya sendiri: Willie tetap 6 tahun, Lucy 3 tahun.",
          "Hasilnya: data 2 anjing tersimpan di **" + m7.objs + " objek** dengan **" + m7.attrs + " atribut**, cukup lewat **" + m7.vars + " variabel**. Method `sit()` tetap hanya satu di class dan dipakai bersama."
        ],
        callout: { type: "IDE KUNCI", text: "Atribut milik objek, method milik class. Itulah sebabnya Lucy dan Willie bisa duduk dengan kode yang sama tetapi mencetak nama yang berbeda." },
        changed: [["+", "Objek Dog kedua + variabel your_dog"], ["~", "Variabel 4 → " + m7.vars + " (dibanding tanpa class)"], ["~", "Method dipanggil → " + m7.calls]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "100 anjing", title: "Kasus: seratus anjing",
        text: [
          "Klinik itu sekarang punya 100 anjing. Tanpa class, butuh 200 variabel lepas. Dengan class, satu loop membuat 100 objek dan menyimpannya di **satu** list `dogs`.",
          "Kamera mundur untuk memperlihatkan semuanya: " + m8.objs + " objek, " + m8.attrs + " atribut, tetapi tetap **1 class** dan **1 method `sit()`**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Indeks list dimulai dari 0, jadi `dogs[41]` adalah anjing ke-42." },
        changed: [["~", "Variabel " + m7.vars + " → " + m8.vars], ["~", "Objek " + m7.objs + " → " + m8.objs], ["~", "Atribut " + m7.attrs + " → " + m8.attrs]],
        frames: steps[7]
      },
      {
        kind: "KASUS", short: "Lupa self", title: "Kasus: lupa menulis self",
        text: [
          "Kesalahan paling umum: menulis `def sit():` tanpa `self`. Programnya tetap bisa dibuat objeknya, tetapi saat `my_dog.sit()` dipanggil, Python mengirim `my_dog` sebagai argumen pertama dan tidak ada parameter yang menampungnya.",
          "Hasilnya `TypeError: Dog.sit() takes 0 positional arguments but 1 was given`. \"1 was given\" adalah objek yang dikirim otomatis itu."
        ],
        callout: { type: "IDE KUNCI", text: "Setiap method biasa harus punya `self` sebagai parameter pertama, walaupun saat memanggilnya kita tidak menuliskannya." },
        changed: [["-", "Parameter self di sit()"], ["+", "TypeError"]],
        frames: steps[8]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Satu cetakan, banyak objek",
        text: ["Class mengikat data dan perilaku. Dari satu class Dog kita membuat " + m7.objs + " objek dengan atributnya masing-masing, dan semuanya memakai method yang sama."],
        bullets: [
          "`class Nama:` mendefinisikan cetakan; nama class memakai CamelCase.",
          "`__init__(self, ...)` berjalan otomatis saat objek dibuat.",
          "`self.atribut` menyimpan data di dalam objek.",
          "`objek.atribut` membaca data; `objek.method()` menjalankan perilaku.",
          "Method dicari di class, dan objek di depan titik menjadi `self`."
        ],
        quiz: [
          { q: "Apa yang dijalankan Python secara otomatis saat menulis `Dog('Rex', 2)`?", options: ["`sit()`", "`__init__()`", "`print()`", "Tidak ada"], answer: 1, why: "`__init__()` adalah method khusus yang dijalankan setiap kali objek baru dibuat." },
          { q: "Di mana method `sit()` disimpan?", options: ["Di setiap objek", "Di variabel my_dog", "Di class Dog", "Di list dogs"], answer: 2, why: "Method tinggal di class dan dipakai bersama oleh semua objek. Objek hanya menyimpan atribut." },
          { q: "`my_dog = Dog('Willie', 6)` lalu `my_dog.age = 7`. Berapa umur `your_dog` (Lucy)?", options: ["7", "6", "3", "Error"], answer: 2, why: "Setiap objek punya atributnya sendiri. Mengubah my_dog tidak memengaruhi your_dog." }
        ],
        changed: [],
        frames: steps[9]
      }
    ],
    next: "**Mengubah Atribut Objek**: odometer mobil, nilai default, dan kenapa mengubah atribut lewat method lebih aman daripada langsung."
  });
})();
