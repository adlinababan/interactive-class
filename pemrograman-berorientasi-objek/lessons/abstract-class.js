/* Pelajaran: Abstract Class & Abstract Method (Modul 09 · Sesi 9 · LO 3)
 * Class Shape dan Point mengikuti slide "Example of Abstract Class and Method (1) dan (2)".
 * Konstruktor Shape() diberi println agar rantai konstruktor terlihat; di slide isinya kosong.
 * Semua output dan pesan error sudah dicocokkan dengan javac/java 21.
 */
(function () {
  const SH = { u: 0, v: -3.7 };
  const COL = { Circle: -4.5, Rectangle: -1.5, Trapezoid: 1.5, Point: 4.5 };
  const CV = 0, OV = 4.0, SV = 6.5;
  const THEME = { Circle: "teal", Rectangle: "violet", Trapezoid: "rose", Point: "sand" };

  const SM = {
    color: { id: "color", label: "String color", kind: "attr" },
    ctor: { id: "ctor", label: "Shape()", kind: "method" },
    set: { id: "set", label: "setColor(String c)", kind: "method" },
    get: { id: "get", label: "getColor()", kind: "method" },
    area0: { id: "area", label: "area() → 0", kind: "method" },
    area: { id: "area", label: "abstract area();", kind: "abstract" }
  };
  const shape = (kind, areaKey) => ({ id: "Shape", ...SH, theme: "blue", kind, members: ["color", "ctor", "set", "get", areaKey].map((k) => SM[k]) });
  const FIELDS = { Circle: "r", Rectangle: "w, h", Trapezoid: "a, b, t", Point: "static x, y" };
  const sub = (name, withArea, extra) => ({
    id: name, u: COL[name], v: CV, theme: THEME[name], parent: "Shape", extLabel: false,
    members: [{ id: "f", label: FIELDS[name], kind: "attr" }]
      .concat(withArea ? [{ id: "area", label: "area()", kind: "method" }] : [])
      .concat(extra || [])
  });
  const obj = (id, cls, title, attrs) => ({ id, title, u: COL[cls], v: OV, theme: THEME[cls], attrs });
  const vr = (id, label, cls, to) => ({ id, label, u: COL[cls], v: SV, to });

  // ---------- kode ----------
  const SHAPE_HEAD = (abs) => [
    ["s_cls", (abs ? "abstract " : "") + "class Shape {"],
    ["", "    public String color;"],
    ["s_ctor", "    public Shape() {"],
    ["", "        System.out.println(\"Shape() dipanggil\");"],
    ["", "    }"],
    ["s_set", "    public void setColor(String c) {"],
    ["", "        color = c;"],
    ["", "    }"],
    ["s_get", "    public String getColor() {"],
    ["", "        return color;"],
    ["", "    }"]
  ];
  const SHAPE = (abs, areaRow) => [...SHAPE_HEAD(abs), areaRow, ["", "}"]];
  const ABS_AREA = ["s_area", "    abstract public double area();"];
  const CIRCLE = [
    ["c_cls", "class Circle extends Shape {"],
    ["", "    double r;"],
    ["", "    Circle(double r) { this.r = r; }"],
    ["c_area", "    public double area() { return 3.14 * r * r; }"],
    ["", "}"]
  ];
  const RECT = [
    ["r_cls", "class Rectangle extends Shape {"],
    ["", "    double w, h;"],
    ["", "    Rectangle(double w, double h) { this.w = w; this.h = h; }"],
    ["r_area", "    public double area() { return w * h; }"],
    ["", "}"]
  ];
  const TRAP = (ok) => [
    ["+t_cls", "class Trapezoid extends Shape {"],
    ["", "    double a, b, t;"],
    ["", "    Trapezoid(double a, double b, double t) { this.a = a; this.b = b; this.t = t; }"],
    ...(ok ? [["+t_area", "    public double area() { return (a + b) / 2 * t; }"]] : []),
    ["", "}"]
  ];
  const MAIN = (...rows) => [["", "public class Main {"], ["", "    public static void main(String[] args) {"], ...rows, ["", "    }"], ["", "}"]];
  const USE = [
    ["mkC", "        Circle c = new Circle(7);"],
    ["setC", "        c.setColor(\"merah\");"],
    ["getC", "        System.out.println(c.getColor());"],
    ["mkR", "        Shape s = new Rectangle(4, 5);"],
    ["pS", "        System.out.println(s.area());"],
    ["pC", "        System.out.println(c.area());"]
  ];
  const CODE = {
    konkret: [...SHAPE(false, ["s_area", "    public double area() { return 0; }"]), ...MAIN(
      ["mk", "        Shape s = new Shape();"],
      ["p", "        System.out.println(s.area());"]
    )],
    nonabs: SHAPE(false, ["+s_area", "    abstract public double area();"]),
    abs: [...SHAPE(true, ABS_AREA)],
    baru: [...SHAPE(true, ABS_AREA), ...MAIN(["+mk", "        Shape s = new Shape();"])],
    pakai: [...SHAPE(true, ABS_AREA), ...CIRCLE, ...RECT, ...MAIN(...USE)],
    trap: [...SHAPE(true, ABS_AREA), ...CIRCLE, ...RECT, ...TRAP(false), ...MAIN(...USE,
      ["+mkT", "        Shape t = new Trapezoid(3, 5, 4);"],
      ["+pT", "        System.out.println(t.area());"])],
    trapOk: [...SHAPE(true, ABS_AREA), ...CIRCLE, ...RECT, ...TRAP(true), ...MAIN(...USE,
      ["mkT", "        Shape t = new Trapezoid(3, 5, 4);"],
      ["pT", "        System.out.println(t.area());"])],
    point: [...SHAPE(true, ABS_AREA),
      ["p_cls", "public class Point extends Shape {"],
      ["", "    static int x, y;"],
      ["p_ctor", "    public Point() {"],
      ["", "        x = 0;"],
      ["", "        y = 0;"],
      ["", "    }"],
      ["p_area", "    public double area() {   return 0;  }"],
      ["", ""],
      ["", "    public double perimeter(){   return 0; }"],
      ["", ""],
      ["p_print", "    public static void print() {"],
      ["", "        System.out.println(\"point: \" + x + \",\" + y);"],
      ["", "    }"],
      ["", "    public static void main(String args[]) {"],
      ["mkP", "        Point p = new Point();"],
      ["callP", "        p.print();"],
      ["", "    }"],
      ["", "}"]]
  };
  const lineOf = (ver, id) => CODE[ver].findIndex((l) => l[0].replace(/^\+/, "") === id) + 1;

  // ---------- metrik ----------
  const metricsOf = (f) => {
    const cls = f.classes || [], out = f.out || [];
    return {
      absCls: cls.filter((c) => c.kind === "abstract").length,
      absM: cls.reduce((n, c) => n + c.members.filter((m) => m.kind === "abstract").length, 0),
      objs: (f.objects || []).filter((o) => !o.ghost).length,
      err: out.filter((l) => /^!\S+\.java:\d+: error/.test(l)).length
    };
  };

  const S = OOPStory({ classes: [shape(null, "area0")], objects: [], vars: [], out: [], code: "konkret" }, metricsOf);
  const steps = [];
  const shapeObj = (ghost) => ({ id: "os", title: ghost ? "objek Shape?" : "objek Shape", u: SH.u + 3.6, v: SH.v + 0.4, theme: "blue", ghost, attrs: [["color", "null"]] });

  // 1 — MASALAH: objek "bentuk" tanpa bentuk
  S.snap({ line: "s_area", note: "area() milik Shape: kembalikan 0", marks: { "c:Shape.m:area": "hl" }, dur: 1800 });
  S.s.objects = [shapeObj(false)];
  S.s.vars = [{ id: "s", label: "Shape s", u: SH.u + 3.6, v: SH.v + 3.2, to: "os" }];
  S.s.out = ["Shape() dipanggil"];
  S.snap({ line: "mk", note: "new Shape(): bentuk apa ini?", tone: "alert", marks: { "o:os": "new" }, dur: 2000 });
  S.s.out.push("0.0");
  S.snap({ line: "p", note: "Luasnya 0.0: tidak bermakna, tetapi lolos tanpa error", tone: "alert", flow: { path: ["v:s", "o:os", "c:Shape.m:area"] }, marks: { "c:Shape.m:area": "err" }, dur: 2400 });
  steps.push(S.take());

  // 2 — abstract method
  S.s.code = "nonabs";
  S.s.out = []; S.s.objects = []; S.s.vars = [];
  S.s.classes = [shape(null, "area")];
  S.snap({ line: "s_area", note: "abstract area(); tanpa isi, diakhiri titik koma", marks: { "c:Shape.m:area": "new" }, dur: 2000 });
  S.s.out = ["!Shape.java:" + lineOf("nonabs", "s_cls") + ": error: Shape is not abstract and does not override abstract method area() in Shape"];
  S.snap({ line: "s_cls", note: "Ada method abstract → class-nya wajib abstract", tone: "alert", marks: { "c:Shape": "err" }, dur: 2400 });
  S.s.code = "abs";
  S.s.out = [];
  S.s.classes = [shape("abstract", "area")];
  S.snap({ line: "s_cls", note: "abstract class Shape: diterima compiler", tone: "done", marks: { "c:Shape": "ok" }, dur: 2000 });
  steps.push(S.take());

  // 3 — tidak bisa dibuat objeknya
  S.s.code = "baru";
  S.s.objects = [shapeObj(true)];
  S.snap({ line: "mk", note: "new Shape() pada abstract class…", marks: { "o:os": "hl" }, dur: 1700 });
  S.s.out = ["!Main.java:" + lineOf("baru", "mk") + ": error: Shape is abstract; cannot be instantiated"];
  S.snap({ line: "mk", note: "…ditolak: abstract class tidak bisa dibuat objeknya", tone: "alert", marks: { "o:os": "err" }, dur: 2400 });
  steps.push(S.take());

  // 4 — subclass konkret, rantai konstruktor, method warisan
  S.s.code = "pakai";
  S.s.out = []; S.s.objects = [];
  S.s.classes = [shape("abstract", "area"), sub("Circle", true), sub("Rectangle", true)];
  S.snap({ line: "c_area", note: "Circle dan Rectangle wajib mengisi area()", marks: { "c:Circle.m:area": "new", "c:Rectangle.m:area": "new", "c:Shape.m:area": "hl" }, dur: 2200 });
  S.s.objects = [obj("oc", "Circle", "objek Circle", [["color", "null"], ["r", "7"]])];
  S.s.vars = [vr("c", "Circle c", "Circle", "oc")];
  S.s.out = ["Shape() dipanggil"];
  S.snap({ line: "mkC", note: "new Circle(7) ikut menjalankan konstruktor Shape()", flow: { path: ["o:oc", "c:Circle", "c:Shape.m:ctor"] }, marks: { "c:Shape.m:ctor": "ok", "o:oc": "new" }, dur: 2400 });
  S.setAttr("oc", "color", "\"merah\"");
  S.snap({ line: "setC", note: "setColor() diwarisi dari Shape", flow: { path: ["v:c", "o:oc", "c:Circle", "c:Shape.m:set"] }, marks: { "c:Shape.m:set": "ok", "o:oc.a:color": "chg" }, dur: 2300 });
  S.s.out.push("merah");
  S.snap({ line: "getC", note: "getColor() → merah", tone: "done", flow: { path: ["v:c", "o:oc", "c:Circle", "c:Shape.m:get"] }, marks: { "c:Shape.m:get": "ok" }, dur: 2000 });
  steps.push(S.take());

  // 5 — SOLUSI: tipe abstract sebagai variabel
  S.s.objects.push(obj("or", "Rectangle", "objek Rectangle", [["color", "null"], ["w", "4"], ["h", "5"]]));
  S.s.vars.push(vr("s", "Shape s", "Rectangle", "or"));
  S.s.out.push("Shape() dipanggil");
  S.snap({ line: "mkR", note: "Shape s = new Rectangle(4, 5): variabel boleh bertipe abstract", marks: { "o:or": "new", "v:s": "hl" }, dur: 2200 });
  S.s.out.push("20.0");
  S.snap({ line: "pS", note: "s.area() → versi Rectangle: 20.0", tone: "done", flow: { path: ["v:s", "o:or", "c:Rectangle.m:area"] }, marks: { "c:Rectangle.m:area": "ok" }, dur: 2200 });
  S.s.out.push("153.86");
  S.snap({ line: "pC", note: "c.area() → versi Circle: 153.86", tone: "done", flow: { path: ["v:c", "o:oc", "c:Circle.m:area"] }, marks: { "c:Circle.m:area": "ok" }, dur: 2200 });
  steps.push(S.take());

  // 6 — KASUS: lupa area() kini ditangkap compiler
  S.s.code = "trap";
  const kept = JSON.parse(JSON.stringify({ objects: S.s.objects, vars: S.s.vars }));
  S.s.out = [];
  S.s.classes.push(sub("Trapezoid", false));
  S.snap({ line: "t_cls", note: "Trapezoid lagi-lagi lupa area()…", marks: { "c:Trapezoid": "new" }, dur: 1800 });
  S.s.out = ["!Main.java:" + lineOf("trap", "t_cls") + ": error: Trapezoid is not abstract and does not override abstract method area() in Shape"];
  S.snap({ line: "t_cls", note: "…kali ini compiler menolak. Tidak ada lagi luas 0.0 diam-diam", tone: "done", marks: { "c:Trapezoid": "err", "c:Shape.m:area": "hl" }, dur: 2600 });
  S.s.code = "trapOk";
  S.s.classes[3] = sub("Trapezoid", true);
  S.s.objects = kept.objects.concat([obj("ot", "Trapezoid", "objek Trapezoid", [["color", "null"], ["a", "3"], ["b", "5"], ["t", "4"]])]);
  S.s.vars = kept.vars.concat([vr("t", "Shape t", "Trapezoid", "ot")]);
  S.s.out = ["Shape() dipanggil", "merah", "Shape() dipanggil", "20.0", "153.86", "Shape() dipanggil", "16.0"];
  S.snap({ line: "pT", note: "Setelah area() ditulis: (3 + 5) ÷ 2 × 4 = 16.0", tone: "done", flow: { path: ["v:t", "o:ot", "c:Trapezoid.m:area"] }, marks: { "c:Trapezoid.m:area": "ok", "o:ot": "new" }, dur: 2600 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 7 — KASUS: Point dari slide
  S.s.code = "point";
  S.s.out = []; S.s.objects = []; S.s.vars = [];
  S.s.classes = [shape("abstract", "area"), sub("Point", true, [{ id: "per", label: "perimeter()", kind: "method" }, { id: "print", label: "static print()", kind: "method" }])];
  S.snap({ line: "p_area", note: "Point extends Shape: luas titik memang 0", marks: { "c:Point": "new", "c:Point.m:area": "ok" }, dur: 2200 });
  S.s.objects = [obj("op", "Point", "objek Point", [["color", "null"]])];
  S.s.vars = [vr("p", "Point p", "Point", "op")];
  S.s.out = ["Shape() dipanggil"];
  S.snap({ line: "mkP", note: "new Point(): Shape() lalu Point()", flow: { path: ["o:op", "c:Point", "c:Shape.m:ctor"] }, marks: { "o:op": "new" }, dur: 2200 });
  S.s.out.push("point: 0,0");
  S.snap({ line: "callP", note: "p.print() → point: 0,0", tone: "done", flow: { path: ["v:p", "o:op", "c:Point.m:print"] }, marks: { "c:Point.m:print": "ok" }, dur: 2200 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "s_area", note: "Abstract: cetak biru yang wajib dilengkapi anaknya", tone: "done", marks: { "c:Circle.m:area": "ok", "c:Rectangle.m:area": "ok", "c:Trapezoid.m:area": "ok" }, dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "abstract-class",
    renderer: "oop",
    lang: "java",
    title: "Abstract Class & Abstract Method",
    subtitle: "Jadikan Shape sebuah cetak biru yang tidak bisa dibuat objeknya, dan paksa setiap bentuk menulis rumus luasnya sendiri.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Abstract method: dideklarasikan tanpa isi", at: 1 },
      { text: "Abstract class tidak bisa dibuat objeknya", at: 2 },
      { text: "Subclass wajib mengisi method abstract", at: 3 },
      { text: "Variabel bertipe abstract class + dynamic binding", at: 4 },
      { text: "Compiler menangkap subclass yang lupa", at: 5 }
    ],
    metrics: [
      { key: "absCls", label: "Abstract class", icon: "◇" },
      { key: "absM", label: "Method abstract", icon: "∅" },
      { key: "objs", label: "Objek", icon: "◆" },
      { key: "err", label: "Error kompilasi", icon: "!" }
    ],
    legend: [
      { color: "#6366f1", label: "Abstract class (garis putus)" },
      { color: "#d946ef", label: "Subclass" },
      { color: "#6366f1", round: true, label: "Jalur pemanggilan" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Bentuk umum", title: "Objek \"bentuk\" tanpa bentuk",
        text: [
          "Di pelajaran sebelumnya, `Shape` punya method luas yang mengembalikan 0. Akibatnya siapa pun bisa menulis `new Shape()` dan mendapat luas `0.0`. Bentuk apa itu?",
          "Lebih parah lagi, subclass yang lupa meng-override (Trapezoid) diam-diam memakai versi 0 ini. Di slide Sesi 9, method luasnya bernama `area()`."
        ],
        changed: [["+", "objek Shape"], ["+", "Output: 0.0"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Abstract method", title: "Abstract method",
        text: [
          "**Abstract method** adalah method yang dideklarasikan **tanpa implementasi**: tidak ada kurung kurawal, langsung diakhiri titik koma. `abstract public double area();`",
          "Jika sebuah class punya method abstract, class itu **wajib** dideklarasikan `abstract`. Tanpa itu compiler menolak. Dengan `abstract class Shape`, compiler menerimanya."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Sebaliknya tidak wajib: abstract class boleh tidak punya method abstract sama sekali. Ia tetap tidak bisa dibuat objeknya." },
        changed: [["~", "area() → abstract area();"], ["+", "abstract class Shape"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Tanpa new", title: "Tidak bisa dibuat objeknya",
        text: [
          "Abstract class **tidak bisa di-instansiasi**: `new Shape()` ditolak dengan pesan *Shape is abstract; cannot be instantiated*.",
          "Masuk akal: Shape hanyalah gagasan umum. Yang nyata adalah lingkaran, persegi panjang, dan seterusnya."
        ],
        changed: [["+", "Error: cannot be instantiated"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Subclass", title: "Subclass melengkapi cetak birunya",
        text: [
          "Abstract class dipakai lewat **subclass**. Circle dan Rectangle meng-override `area()` dengan rumusnya, dan mewarisi `color`, `setColor()`, serta `getColor()` apa adanya.",
          "Meski Shape tidak bisa di-`new`, konstruktornya tetap berjalan: `new Circle(7)` memanggil `Shape()` lebih dulu (rantai konstruktor)."
        ],
        callout: { type: "IDE KUNCI", text: "Abstract class boleh berisi atribut, konstruktor, dan method biasa yang dibagi ke semua subclass, ditambah method abstract yang wajib mereka isi." },
        changed: [["+", "Circle dan Rectangle dengan area()"], ["+", "objek Circle: color = \"merah\""]],
        frames: steps[3]
      },
      {
        kind: "SOLUSI", short: "Shape s", title: "Tipe abstract sebagai variabel",
        text: [
          "Objeknya tidak bisa dibuat, tetapi **tipenya** tetap bisa dipakai: `Shape s = new Rectangle(4, 5)`.",
          "`s.area()` menjalankan versi Rectangle (`20.0`) dan `c.area()` versi Circle (`153.86`). Polimorfisme dari pelajaran sebelumnya tetap bekerja."
        ],
        changed: [["+", "Shape s → objek Rectangle"], ["+", "Output: 20.0 dan 153.86"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Lupa lagi", title: "Kasus: Trapezoid lupa lagi",
        text: [
          "Trapezoid kembali ditambahkan tanpa `area()`. Kali ini compiler menolak: *Trapezoid is not abstract and does not override abstract method area() in Shape*.",
          "Kesalahan yang dulu lolos diam-diam sekarang tertangkap sebelum program berjalan. Setelah `area()` ditulis, hasilnya benar: **16.0**."
        ],
        changed: [["+", "Error: does not override abstract method"], ["+", "Trapezoid.area() → 16.0"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "Point", title: "Kasus: Point dari slide",
        text: [
          "Contoh slide: `Point extends Shape`. Sebuah titik memang tidak punya luas, jadi `area()` mengembalikan 0. Bedanya dengan masalah di langkah 1: kini 0 adalah **keputusan sadar** class Point, bukan nilai bawaan yang terwarisi tanpa sengaja.",
          "`new Point()` menjalankan `Shape()` lalu `Point()`, dan `p.print()` mencetak `point: 0,0`."
        ],
        changed: [["+", "class Point extends Shape"], ["+", "Output: point: 0,0"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Abstract class adalah cetak biru: menyimpan bagian yang sama untuk semua subclass, dan mewajibkan bagian yang harus berbeda."],
        bullets: [
          "Dideklarasikan dengan kata kunci `abstract`.",
          "Abstract method tidak punya isi dan diakhiri `;`.",
          "Class dengan abstract method wajib abstract.",
          "Tidak bisa di-`new`, tetapi bisa dipakai sebagai tipe variabel.",
          "Subclass konkret wajib meng-override semua method abstract."
        ],
        quiz: [
          { q: "Manakah deklarasi abstract method yang benar?", options: ["abstract double area() { }", "abstract public double area();", "public double area();", "abstract area() = 0;"], answer: 1, why: "Abstract method tidak punya badan dan diakhiri titik koma." },
          { q: "`Shape s = new Shape();` dengan Shape sebuah abstract class. Hasilnya?", options: ["Objek Shape dibuat", "Error kompilasi: cannot be instantiated", "Error saat runtime", "s bernilai null"], answer: 1, why: "Abstract class tidak bisa diinstansiasi." },
          { q: "Subclass konkret tidak meng-override method abstract induknya. Apa yang terjadi?", options: ["Memakai versi induk", "Error kompilasi", "Hasilnya 0", "Method diabaikan"], answer: 1, why: "Compiler mewajibkan subclass konkret mengisi semua method abstract." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Pelajaran berikutnya: **Interface**, kontrak perilaku yang boleh diterapkan banyak class sekaligus."
  });
})();
