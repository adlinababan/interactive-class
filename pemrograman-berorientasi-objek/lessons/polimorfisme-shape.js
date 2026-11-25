/* Pelajaran: Polimorfisme dalam Aksi (Modul 08 · Sesi 8 · LO 3)
 * Mengikuti slide "Polymorphism Example": computeArea() milik Shape di-override oleh Rectangle dan Circle.
 * Triangle dan Trapezoid adalah tambahan. π memakai 3.14 agar angka mudah diperiksa.
 * Semua output sudah dicocokkan dengan javac/java 21.
 */
(function () {
  // tata letak: Shape di atas, subclass sebaris, objek tepat di bawah class-nya, variabel s di bawah objek
  const SH = { u: -1.5, v: -3.8 };
  const COL = [-4.5, -1.5, 1.5, 4.5];
  const CV = 0, OV = 4.4, SV = 7.2;

  const SUB = {
    Rectangle: { attrs: "w, h", row: 0, theme: "violet", area: "w * h" },
    Circle: { attrs: "r", row: 1, theme: "teal", area: "3.14 * r * r" },
    Triangle: { attrs: "alas, tinggi", row: 2, theme: "sand", area: "0.5 * alas * tinggi" },
    Trapezoid: { attrs: "a, b, t", row: 3, theme: "rose", area: null }
  };
  const shape = (withMethod) => ({ id: "Shape", ...SH, theme: "blue", members: withMethod ? [{ id: "area", label: "computeArea() → 0", kind: "method" }] : [{ id: "nil", label: "(belum ada method)", kind: "attr" }] });
  const sub = (name, withMethod) => {
    const d = SUB[name];
    const mem = [{ id: "attrs", label: d.attrs, kind: "attr" }];
    if (withMethod && d.area) mem.push({ id: "area", label: "computeArea()", kind: "method" });
    return { id: name, u: COL[d.row], v: CV, theme: d.theme, parent: "Shape", extLabel: false, members: mem };
  };
  const OBJ = {
    o0: { cls: "Rectangle", title: "shapes[0] · Rectangle", attrs: [["w", "4"], ["h", "5"]] },
    o1: { cls: "Circle", title: "shapes[1] · Circle", attrs: [["r", "7"]] },
    o2: { cls: "Triangle", title: "shapes[2] · Triangle", attrs: [["alas", "6"], ["tinggi", "4"]] },
    o3: { cls: "Trapezoid", title: "shapes[3] · Trapezoid", attrs: [["a", "3"], ["b", "5"], ["t", "4"]] }
  };
  const obj = (id) => { const o = OBJ[id], d = SUB[o.cls]; return { id, title: o.title, u: COL[d.row], v: OV, theme: d.theme, attrs: o.attrs }; };
  const sVar = (id) => ({ id: "s", label: "Shape s", u: COL[SUB[OBJ[id].cls].row], v: SV, to: id });

  // ---------- kode ----------
  const CLS = (name, method, mark) => {
    const d = SUB[name];
    const field = { Rectangle: "double w, h;", Circle: "double r;", Triangle: "double alas, tinggi;", Trapezoid: "double a, b, t;" }[name];
    const ctor = { Rectangle: "Rectangle(double w, double h) { this.w = w; this.h = h; }", Circle: "Circle(double r) { this.r = r; }", Triangle: "Triangle(double alas, double tinggi) { this.alas = alas; this.tinggi = tinggi; }", Trapezoid: "Trapezoid(double a, double b, double t) { this.a = a; this.b = b; this.t = t; }" }[name];
    const p = mark ? "+" : "";
    const rows = [[p + name.toLowerCase(), "class " + name + " extends Shape {"], ["", "    " + field], ["", "    " + ctor]];
    if (method && d.area) rows.push(["", "    @Override"], [name.toLowerCase() + "_area", "    public double computeArea() { return " + d.area + "; }"]);
    rows.push(["", "}"]);
    return rows;
  };
  const ARR = (...items) => ["arr", "        Shape[] shapes = { " + items.join(", ") + " };"];
  const LOOP = [
    ["", "        double total = 0;"],
    ["for", "        for (Shape s : shapes) {"],
    ["print", "            System.out.println(s.computeArea());"],
    ["sum", "            total += s.computeArea();"],
    ["", "        }"],
    ["tot", "        System.out.println(\"Total: \" + total);"],
    ["", "    }"],
    ["", "}"]
  ];
  const MAINHEAD = [["", "public class Main {"], ["", "    public static void main(String[] args) {"]];
  const SHAPE_POLY = [["shape", "class Shape {"], ["shape_area", "    public double computeArea() { return 0; }"], ["", "}"]];
  const CODE = {
    ifelse: [
      ["shape", "class Shape { }"],
      ...CLS("Rectangle", false), ...CLS("Circle", false),
      ...MAINHEAD,
      ARR("new Rectangle(4, 5)", "new Circle(7)"),
      ["for", "        for (Shape s : shapes) {"],
      ["if1", "            if (s instanceof Rectangle) {"],
      ["", "                Rectangle r = (Rectangle) s;"],
      ["p1", "                System.out.println(r.w * r.h);"],
      ["if2", "            } else if (s instanceof Circle) {"],
      ["", "                Circle c = (Circle) s;"],
      ["p2", "                System.out.println(3.14 * c.r * c.r);"],
      ["", "            }"],
      ["", "        }"],
      ["", "    }"],
      ["", "}"]
    ],
    poly: [...SHAPE_POLY, ...CLS("Rectangle", true), ...CLS("Circle", true), ...MAINHEAD, ARR("new Rectangle(4, 5)", "new Circle(7)"), ...LOOP],
    tri: [...SHAPE_POLY, ...CLS("Rectangle", true), ...CLS("Circle", true), ...CLS("Triangle", true, true), ...MAINHEAD,
      ["+arr", "        Shape[] shapes = { new Rectangle(4, 5), new Circle(7), new Triangle(6, 4) };"], ...LOOP],
    trap: [...SHAPE_POLY, ...CLS("Rectangle", true), ...CLS("Circle", true), ...CLS("Triangle", true), ...CLS("Trapezoid", false, true), ...MAINHEAD,
      ["+arr", "        Shape[] shapes = { new Rectangle(4, 5), new Circle(7), new Triangle(6, 4),"],
      ["", "                           new Trapezoid(3, 5, 4) };"], ...LOOP]
  };

  // ---------- metrik ----------
  const metricsOf = (f) => ({
    shapes: (f.objects || []).length,
    ifs: f.ifs || 0,
    edits: f.edits || 0,
    total: f.total
  });

  const S = OOPStory({ classes: [shape(false), sub("Rectangle", false), sub("Circle", false)], objects: [], vars: [], out: [], code: "ifelse", ifs: 2, edits: 0 }, metricsOf);
  const steps = [];

  // 1 — MASALAH: rantai if-instanceof
  S.s.objects = [obj("o0"), obj("o1")];
  S.snap({ line: "arr", note: "Dua bentuk di satu array Shape[]", marks: { "o:o0": "new", "o:o1": "new" }, dur: 1800 });
  S.s.vars = [sVar("o0")];
  S.s.out.push("20.0");
  S.snap({ line: "p1", note: "if (s instanceof Rectangle) → hitung w * h", flow: { path: ["v:s", "o:o0", "c:Rectangle"] }, marks: { "c:Rectangle": "hl" }, dur: 2200 });
  S.s.vars = [sVar("o1")];
  S.s.out.push("153.86");
  S.snap({ line: "p2", note: "else if (s instanceof Circle) → hitung 3.14 * r * r", flow: { path: ["v:s", "o:o1", "c:Circle"] }, marks: { "c:Circle": "hl" }, dur: 2200 });
  S.snap({ line: "if2", note: "Setiap bentuk baru = satu cabang if baru di loop", tone: "alert", marks: { "c:Rectangle": "hl", "c:Circle": "hl" }, dur: 2000 });
  steps.push(S.take());

  // 2 — computeArea() di superclass, di-override subclass
  S.s.code = "poly";
  S.s.out = []; S.s.vars = []; S.s.objects = [];
  S.s.ifs = 0;
  S.s.classes = [shape(true), sub("Rectangle", true), sub("Circle", true)];
  S.snap({ line: "shape_area", note: "Shape punya computeArea(): versi umum, hasilnya 0", marks: { "c:Shape.m:area": "new" }, dur: 2000 });
  S.snap({ line: "circle_area", note: "Rectangle dan Circle meng-override dengan rumus masing-masing", marks: { "c:Rectangle.m:area": "new", "c:Circle.m:area": "new", "c:Shape.m:area": "over" }, dur: 2300 });
  steps.push(S.take());

  // 3 — array bertipe supertype
  S.s.objects = [obj("o0"), obj("o1")];
  S.snap({ line: "arr", note: "Shape[] boleh berisi Rectangle dan Circle", marks: { "o:o0": "new", "o:o1": "new" }, dur: 2000 });
  S.s.vars = [sVar("o0")];
  S.snap({ line: "for", note: "Loop: variabel Shape s menunjuk tiap elemen bergantian", marks: { "v:s": "hl" }, dur: 1900 });
  steps.push(S.take());

  // 4 — iterasi 1
  S.s.out.push("20.0");
  S.snap({ line: "print", note: "s.computeArea(): objeknya Rectangle → w * h = 20.0", tone: "done", flow: { path: ["v:s", "o:o0", "c:Rectangle.m:area"] }, marks: { "c:Rectangle.m:area": "ok", "c:Shape.m:area": "over" }, dur: 2500 });
  steps.push(S.take());

  // 5 — SOLUSI: iterasi 2 + total
  S.s.vars = [sVar("o1")];
  S.s.out.push("153.86");
  S.snap({ line: "print", note: "Baris yang sama, objeknya Circle → 3.14 * 7 * 7", tone: "done", flow: { path: ["v:s", "o:o1", "c:Circle.m:area"] }, marks: { "c:Circle.m:area": "ok", "c:Shape.m:area": "over" }, dur: 2500 });
  S.s.out.push("Total: 173.86");
  S.s.total = 173.86;
  S.snap({ line: "tot", note: "Total 173.86, tanpa satu if pun", tone: "done", marks: { "c:Rectangle.m:area": "ok", "c:Circle.m:area": "ok" }, dur: 2000 });
  steps.push(S.take());

  // 6 — KASUS: bentuk baru tanpa mengubah loop
  S.s.code = "tri";
  S.s.out = []; S.s.vars = [];
  S.s.classes.push(sub("Triangle", true));
  S.snap({ line: "triangle", note: "Bentuk baru: Triangle, dengan computeArea() sendiri", marks: { "c:Triangle": "new", "c:Triangle.m:area": "new" }, dur: 2000 });
  S.s.objects.push(obj("o2"));
  S.s.vars = [sVar("o2")];
  S.s.out = ["20.0", "153.86", "12.0"];
  S.snap({ line: "print", note: "Loop tidak diubah sedikit pun: 0,5 × 6 × 4 = 12.0", tone: "done", flow: { path: ["v:s", "o:o2", "c:Triangle.m:area"] }, marks: { "c:Triangle.m:area": "ok", "o:o2": "new" }, dur: 2500 });
  S.s.out.push("Total: 185.86");
  S.s.total = 185.86;
  S.snap({ line: "tot", note: "Total naik menjadi 185.86", tone: "done", dur: 1500 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 7 — KASUS: lupa override
  S.s.code = "trap";
  S.s.out = []; S.s.vars = [];
  S.s.classes.push(sub("Trapezoid", false));
  S.snap({ line: "trapezoid", note: "Trapezoid ditambahkan, tetapi lupa computeArea()", marks: { "c:Trapezoid": "new" }, dur: 2000 });
  S.s.objects.push(obj("o3"));
  S.s.vars = [sVar("o3")];
  S.s.out = ["20.0", "153.86", "12.0", "0.0"];
  S.snap({ line: "print", note: "Tidak ada versi Trapezoid → naik ke Shape → 0.0", tone: "alert", flow: { path: ["v:s", "o:o3", "c:Trapezoid", "c:Shape.m:area"] }, marks: { "c:Trapezoid": "miss", "c:Shape.m:area": "err" }, dur: 2700 });
  S.s.out.push("Total: 185.86");
  S.snap({ line: "tot", note: "Seharusnya 16.0. Program jalan tanpa error, hasilnya salah", tone: "alert", marks: { "c:Shape.m:area": "err", "o:o3": "err" }, dur: 2400 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "print", note: "Satu baris kode, banyak bentuk", tone: "done", marks: { "c:Rectangle.m:area": "ok", "c:Circle.m:area": "ok", "c:Triangle.m:area": "ok" }, dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "polimorfisme-shape",
    renderer: "oop",
    lang: "java",
    title: "Polimorfisme dalam Aksi: Menghitung Luas",
    subtitle: "Satu loop menghitung luas persegi panjang, lingkaran, dan segitiga tanpa satu if pun, lalu tetap utuh saat bentuk baru ditambahkan.",
    minutes: 14,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Kenapa rantai `if … instanceof` sulit dirawat", at: 0 },
      { text: "Method umum di superclass, di-override subclass", at: 1 },
      { text: "Array bertipe supertype: `Shape[]`", at: 2 },
      { text: "Satu pemanggilan, versi berbeda tiap objek", at: 4 },
      { text: "Bahaya lupa meng-override", at: 6 }
    ],
    metrics: [
      { key: "shapes", label: "Bentuk di array", icon: "◆" },
      { key: "ifs", label: "Cabang if di loop", icon: "⑂" },
      { key: "edits", label: "Baris loop diubah", icon: "✎" },
      { key: "total", label: "Total luas", dec: 2, icon: "Σ", total: true }
    ],
    legend: [
      { color: "#6366f1", label: "Shape (superclass)" },
      { color: "#d946ef", label: "Rectangle" },
      { color: "#14b8a6", label: "Circle" },
      { color: "#f5c542", label: "Triangle" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Rantai if", title: "Satu if untuk setiap bentuk",
        text: [
          "Program menghitung luas persegi panjang 4 × 5 dan lingkaran berjari-jari 7. Tanpa polimorfisme, loop harus bertanya satu per satu: \"apakah ini persegi panjang? kalau bukan, apakah lingkaran?\" (`if … instanceof …`).",
          "Setiap ada bentuk baru, loop harus ditambah satu `if` lagi. Lama-lama kodenya panjang dan mudah salah."
        ],
        changed: [["+", "Rectangle(4, 5) dan Circle(7)"], ["+", "2 cabang if di loop"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Override", title: "Satu method, banyak rumus",
        text: [
          "Ide polimorfisme: setiap bentuk tahu cara menghitung luasnya sendiri. Method `computeArea()` ditaruh di induk `Shape`, lalu **di-override** oleh `Rectangle` dan `Circle` dengan rumus masing-masing.",
          "Versi di Shape hanya mengembalikan 0, karena \"bentuk\" yang umum tidak punya rumus luas."
        ],
        callout: { type: "ANALOGI", text: "Guru berkata \"kerjakan tugasmu\" ke seluruh kelas. Setiap murid mengerjakan tugasnya sendiri; guru tidak perlu memberi instruksi berbeda ke tiap murid." },
        changed: [["+", "Shape.computeArea()"], ["+", "Rectangle.computeArea() dan Circle.computeArea()"], ["~", "Cabang if 2 → 0"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Shape[]", title: "Array bertipe supertype",
        text: [
          "Array bertipe `Shape[]` boleh diisi persegi panjang dan lingkaran, karena keduanya adalah Shape.",
          "Di dalam loop, variabel `Shape s` menunjuk isi array satu per satu."
        ],
        changed: [["+", "shapes[0] dan shapes[1]"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Iterasi 1", title: "Iterasi 1: Rectangle",
        text: [
          "Putaran pertama: `s` menunjuk persegi panjang. Java menjalankan `computeArea()` milik Rectangle: `4 × 5 = 20.0`.",
          "Versi Shape yang mengembalikan 0 dilewati."
        ],
        changed: [["+", "Output: 20.0"]],
        frames: steps[3]
      },
      {
        kind: "SOLUSI", short: "Iterasi 2", title: "Iterasi 2: baris yang sama, objek berbeda",
        text: [
          "Putaran kedua memakai **baris kode yang sama persis**, tetapi `s` kini menunjuk lingkaran. Yang dijalankan versi Circle: `3.14 × 7 × 7 = 153.86`.",
          "Total luasnya **173.86**, dan loop tidak berisi satu `if` pun. Inilah polimorfisme: satu perintah, hasilnya menyesuaikan objek."
        ],
        callout: { type: "IDE KUNCI", text: "Kode pemanggil cukup bicara dengan tipe umum (Shape). Detail tiap bentuk ada di class bentuk itu sendiri." },
        changed: [["+", "Output: 153.86"], ["~", "Total luas — → 173.86"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Triangle", title: "Kasus: bentuk baru datang",
        text: [
          "Bentuk baru datang: segitiga (alas 6, tinggi 4). Kita cukup membuat class `Triangle` dengan `computeArea()` sendiri, lalu memasukkannya ke array.",
          "Loop **tidak diubah sama sekali**. Hasilnya `12.0`, total naik menjadi **185.86**. Pada versi if, kita harus menambah satu cabang baru."
        ],
        changed: [["+", "class Triangle"], ["+", "Output: 12.0"], ["~", "Total luas 173.86 → 185.86"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "Lupa override", title: "Kasus: lupa meng-override",
        text: [
          "Trapezoid (3, 5, tinggi 4) ditambahkan, tetapi programmer **lupa** menulis `computeArea()`. Java tidak protes, karena Trapezoid otomatis mewarisi versi Shape.",
          "Hasilnya `0.0`, padahal seharusnya `(3 + 5) ÷ 2 × 4 = 16.0`. Program jalan tanpa error, tetapi jawabannya salah. Kesalahan diam-diam seperti ini paling berbahaya."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Solusinya: jadikan `computeArea()` **abstract**, sehingga compiler memaksa setiap subclass menulisnya. Itu topik pelajaran berikutnya." },
        changed: [["+", "class Trapezoid (tanpa computeArea)"], ["+", "Output: 0.0"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Polimorfisme membuat kode pemanggil tetap pendek dan stabil, sementara jenis objeknya terus bertambah."],
        bullets: [
          "Hindari rantai `if … instanceof` untuk memilih perilaku.",
          "Letakkan method umum di superclass, override di subclass.",
          "Array atau variabel bertipe supertype dapat menampung objek subtype.",
          "Menambah bentuk baru tidak mengubah loop.",
          "Lupa override tidak memicu error: hasilnya salah diam-diam."
        ],
        quiz: [
          { q: "`Shape s = new Circle(7); s.computeArea();` Versi mana yang dijalankan?", options: ["Shape.computeArea()", "Circle.computeArea()", "Error kompilasi", "Tergantung urutan class"], answer: 1, why: "Dynamic binding memilih versi milik objek aslinya: Circle." },
          { q: "Apa keuntungan utama loop polimorfik dibanding rantai if-instanceof?", options: ["Lebih banyak baris", "Menambah bentuk baru tanpa mengubah loop", "Tidak perlu class", "Lebih cepat dikompilasi"], answer: 1, why: "Perilaku baru ditambahkan di class baru, bukan di kode pemanggil." },
          { q: "Trapezoid lupa meng-override computeArea() milik Shape (yang mengembalikan 0). Apa yang terjadi?", options: ["Error kompilasi", "Error saat runtime", "Program jalan, luasnya 0.0", "Loop berhenti"], answer: 2, why: "Trapezoid mewarisi versi Shape, jadi tidak ada error, tetapi hasilnya salah." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Modul berikutnya: **Abstract Class**, yang membuat compiler menolak bentuk yang lupa menulis computeArea()."
  });
})();
