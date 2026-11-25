/* Pelajaran: Interface (Modul 09 · Sesi 9 · LO 3)
 * interface Shape { area(); volume(); } dan class Point mengikuti slide "Example of Interfaces (1) dan (2)".
 * Printable, Invoice, PrintableShape, dan Stiker adalah contoh tambahan untuk slide "Interface VS Abstract Class (2)".
 * Semua output dan pesan error sudah dicocokkan dengan javac/java 21.
 */
(function () {
  const P = {
    Shape: { u: -3.6, v: -3.6 }, Printable: { u: 2.6, v: -3.6 },
    Point: { u: -3.6, v: 1.2 }, Invoice: { u: 2.6, v: 1.2 },
    PrintableShape: { u: -0.5, v: 0.6 }, Stiker: { u: 3.2, v: 3.4 }
  };
  const OV = 5.2, SV = 7.8;

  const IM = {
    area: { id: "area", label: "area();", kind: "abstract" },
    volume: { id: "volume", label: "volume();", kind: "abstract" },
    pi: { id: "pi", label: "double PI = 3.14", kind: "attr" },
    info: { id: "info", label: "printInfo();", kind: "abstract" }
  };
  const iface = (id, ...ks) => ({ id, ...P[id], theme: id === "Printable" ? "teal" : "blue", kind: "interface", members: ks.map((k) => IM[k]) });
  const m = (id, label, kind) => ({ id, label, kind: kind || "method" });
  const cls = (id, members, extra) => Object.assign({ id, ...P[id], theme: id === "Invoice" ? "sand" : "violet", members }, extra || {});
  const obj = (id, title, at, theme, attrs) => ({ id, title, u: P[at].u, v: OV, theme, attrs: attrs || [] });
  const vr = (id, label, at, to) => ({ id, label, u: P[at].u, v: SV, to });

  // ---------- kode ----------
  const SHAPE_I = (pi) => [
    ["i_shape", "interface Shape {"],
    ...(pi ? [["+i_pi", "    double PI = 3.14;"]] : []),
    ["i_area", "    public double area();"],
    ["i_volume", "    public double volume();"],
    ["", "}"]
  ];
  const POINT = (volume, extraMain, pi) => [
    ["p_cls", "public class Point implements Shape {"],
    ["", "    static int x, y;"],
    ["", "    public Point() {"],
    ["", "        x = 0;"],
    ["", "        y = 0;"],
    ["", "    }"],
    ["p_area", "    public double area() {   return 0;  }"],
    ["", ""],
    ...(volume ? [["p_volume", "    public double volume() {   return 0; }"], ["", ""]] : []),
    ["p_print", "    public static void print() {"],
    ["", "        System.out.println(\"point: \" + x + \",\" + y);"],
    ["", "    }"],
    ["", "    public static void main(String args[]) {"],
    ["mkP", "        Point p = new Point();"],
    ["callP", "        p.print();"],
    ...(extraMain || []),
    ["", "    }"],
    ["", "}"]
  ];
  const MAIN = (...rows) => [["", "public class Main {"], ["", "    public static void main(String[] args) {"], ...rows, ["", "    }"], ["", "}"]];
  const PRINTABLE = [["i_print", "interface Printable {"], ["i_info", "    void printInfo();"], ["", "}"]];
  const CODE = {
    ganda: [
      ["a_shape", "abstract class Shape {"],
      ["", "    abstract public double area();"],
      ["", "}"],
      ["c_print", "class Printable { }"],
      ["p_cls", "public class Point extends Shape, Printable {"],
      ["", "    public double area() { return 0; }"],
      ["", "    public static void main(String args[]) { }"],
      ["", "}"]
    ],
    iface: SHAPE_I(false),
    ifaceNew: [...SHAPE_I(false), ...MAIN(["+mkS", "        Shape s = new Shape();"])],
    impl1: [...SHAPE_I(false), ...POINT(false)],
    impl: [...SHAPE_I(false), ...POINT(true)],
    run: [...SHAPE_I(false), ...POINT(true, [["+asS", "        Shape s = p;"], ["+pS", "        System.out.println(s.area());"]])],
    pi: [...SHAPE_I(true), ...POINT(true, [["+pPI", "        System.out.println(Shape.PI);"]])],
    piErr: [...SHAPE_I(true), ...MAIN(["+setPI", "        Shape.PI = 3;"])],
    multi: [...SHAPE_I(false), ...PRINTABLE,
      ["pt_cls", "class Point implements Shape, Printable {"],
      ["", "    public double area() { return 0; }"],
      ["", "    public double volume() { return 0; }"],
      ["pt_info", "    public void printInfo() { System.out.println(\"Point di (0,0)\"); }"],
      ["", "}"],
      ["inv_cls", "class Invoice implements Printable {"],
      ["inv_info", "    public void printInfo() { System.out.println(\"Invoice #INV-001: Rp 150000\"); }"],
      ["", "}"],
      ...MAIN(
        ["arr", "        Printable[] items = { new Point(), new Invoice() };"],
        ["for", "        for (Printable it : items) {"],
        ["call", "            it.printInfo();"],
        ["", "        }"])],
    ext: [...SHAPE_I(false), ...PRINTABLE,
      ["ps", "interface PrintableShape extends Shape, Printable { }"],
      ["st_cls", "class Stiker implements PrintableShape {"],
      ["st_area", "    public double area() { return 5 * 2.5; }"],
      ["", "    public double volume() { return 0; }"],
      ["st_info", "    public void printInfo() { System.out.println(\"Stiker 5 x 2.5 cm\"); }"],
      ["", "}"],
      ...MAIN(
        ["mk", "        PrintableShape s = new Stiker();"],
        ["c1", "        s.printInfo();"],
        ["c2", "        System.out.println(s.area());"])]
  };
  const lineOf = (ver, id) => CODE[ver].findIndex((l) => l[0].replace(/^\+/, "") === id) + 1;

  // ---------- metrik ----------
  const metricsOf = (f) => {
    const cs = f.classes || [], out = f.out || [];
    const ifs = cs.filter((c) => c.kind === "interface");
    return {
      ifs: ifs.length,
      req: ifs.reduce((n, c) => n + c.members.filter((x) => x.kind === "abstract").length, 0),
      objs: (f.objects || []).filter((o) => !o.ghost).length,
      err: out.filter((l) => /^!\S+\.java:\d+: error/.test(l)).length
    };
  };

  const absShape = { id: "Shape", ...P.Shape, theme: "blue", kind: "abstract", members: [{ id: "area", label: "abstract area();", kind: "abstract" }] };
  const S = OOPStory({ classes: [absShape, { id: "Printable", ...P.Printable, theme: "teal", members: [m("x", "(class biasa)", "attr")] }], objects: [], vars: [], out: [], code: "ganda" }, metricsOf);
  const steps = [];
  const POINT_M = (...extra) => [m("xy", "static x, y", "attr"), m("area", "area()"), m("volume", "volume()"), ...extra];

  // 1 — MASALAH: dua induk
  S.snap({ line: "c_print", note: "Point ingin jadi Shape sekaligus Printable", marks: { "c:Shape": "hl", "c:Printable": "hl" }, dur: 1900 });
  S.s.classes.push(cls("Point", [m("area", "area()")], { parent: "Shape" }));
  S.s.links = [{ id: "dua", from: "c:Point.base", to: "c:Printable.base", label: "extends kedua?", inherit: true }];
  S.s.out = ["!Point.java:" + lineOf("ganda", "p_cls") + ": error: '{' expected"];
  S.snap({ line: "p_cls", note: "extends Shape, Printable → ditolak: Java hanya mengizinkan satu superclass", tone: "alert", marks: { "c:Point": "err", "c:Printable": "miss" }, dur: 2700 });
  steps.push(S.take());

  // 2 — interface
  S.s.code = "iface";
  S.s.out = []; S.s.links = [];
  S.s.classes = [iface("Shape", "area", "volume")];
  S.snap({ line: "i_shape", note: "interface Shape: hanya berisi method abstract", marks: { "c:Shape": "new" }, dur: 2100 });
  S.s.code = "ifaceNew";
  S.s.objects = [{ id: "os", title: "objek Shape?", u: P.Shape.u + 3.4, v: P.Shape.v + 0.4, theme: "blue", ghost: true, attrs: [] }];
  S.s.out = ["!Main.java:" + lineOf("ifaceNew", "mkS") + ": error: Shape is abstract; cannot be instantiated"];
  S.snap({ line: "mkS", note: "new Shape() ditolak: interface tidak bisa dibuat objeknya", tone: "alert", marks: { "o:os": "err" }, dur: 2500 });
  steps.push(S.take());

  // 3 — implements
  S.s.code = "impl1";
  S.s.out = []; S.s.objects = [];
  S.s.classes = [iface("Shape", "area", "volume"), cls("Point", [m("xy", "static x, y", "attr"), m("area", "area()")], { impl: ["Shape"] })];
  S.snap({ line: "p_cls", note: "class Point implements Shape", marks: { "c:Point": "new" }, dur: 1900 });
  S.s.out = ["!Point.java:" + lineOf("impl1", "p_cls") + ": error: Point is not abstract and does not override abstract method volume() in Shape"];
  S.snap({ line: "p_cls", note: "volume() belum ditulis → ditolak", tone: "alert", marks: { "c:Point": "err", "c:Shape.m:volume": "miss" }, dur: 2400 });
  S.s.code = "impl";
  S.s.out = [];
  S.s.classes[1] = cls("Point", POINT_M(m("print", "static print()")), { impl: ["Shape"] });
  S.snap({ line: "p_volume", note: "Kedua method interface sudah di-override", tone: "done", marks: { "c:Point.m:area": "ok", "c:Point.m:volume": "ok" }, dur: 2200 });
  steps.push(S.take());

  // 4 — SOLUSI: dipakai
  S.s.code = "run";
  S.s.objects = [obj("op", "objek Point", "Point", "violet")];
  S.s.vars = [vr("p", "Point p", "Point", "op")];
  S.s.out = ["point: 0,0"];
  S.snap({ line: "callP", note: "p.print() → point: 0,0 (sama dengan slide)", tone: "done", flow: { path: ["v:p", "o:op", "c:Point.m:print"] }, marks: { "o:op": "new", "c:Point.m:print": "ok" }, dur: 2400 });
  S.s.vars.push({ id: "s", label: "Shape s", u: P.Point.u + 2.6, v: SV, to: "op" });
  S.s.out.push("0.0");
  S.snap({ line: "pS", note: "Shape s = p: interface dipakai sebagai tipe → area() = 0.0", tone: "done", flow: { path: ["v:s", "o:op", "c:Point.m:area"] }, marks: { "c:Point.m:area": "ok", "v:s": "hl" }, dur: 2500 });
  steps.push(S.take());

  // 5 — konstanta
  S.s.code = "pi";
  S.s.vars = [vr("p", "Point p", "Point", "op")];
  S.s.classes[0] = iface("Shape", "pi", "area", "volume");
  S.s.out = ["point: 0,0", "3.14"];
  S.snap({ line: "pPI", note: "Variabel di interface otomatis public static final", tone: "done", marks: { "c:Shape.m:pi": "new" }, dur: 2300 });
  S.s.code = "piErr";
  S.s.out = ["!Main.java:" + lineOf("piErr", "setPI") + ": error: cannot assign a value to static final variable PI"];
  S.snap({ line: "setPI", note: "Shape.PI = 3 ditolak: nilainya konstan", tone: "alert", marks: { "c:Shape.m:pi": "err" }, dur: 2400 });
  steps.push(S.take());

  // 6 — banyak interface sekaligus
  S.s.code = "multi";
  S.s.out = []; S.s.objects = []; S.s.vars = [];
  S.s.classes = [iface("Shape", "area", "volume"), iface("Printable", "info"),
    cls("Point", [m("area", "area()"), m("volume", "volume()"), m("info", "printInfo()")], { impl: ["Shape", "Printable"] })];
  S.snap({ line: "pt_cls", note: "implements Shape, Printable: dua kontrak sekaligus", marks: { "c:Point": "new", "c:Printable": "new" }, dur: 2300 });
  S.s.classes.push(cls("Invoice", [m("info", "printInfo()")], { impl: ["Printable"] }));
  S.snap({ line: "inv_cls", note: "Invoice bukan bentuk, tetapi juga Printable", marks: { "c:Invoice": "new" }, dur: 2000 });
  S.s.objects = [obj("op", "objek Point", "Point", "violet"), obj("oi", "objek Invoice", "Invoice", "sand")];
  S.s.vars = [vr("it", "Printable it", "Point", "op")];
  S.s.out = ["Point di (0,0)"];
  S.snap({ line: "call", note: "it.printInfo() → versi Point", tone: "done", flow: { path: ["v:it", "o:op", "c:Point.m:info"] }, marks: { "c:Point.m:info": "ok" }, dur: 2300 });
  S.s.vars = [vr("it", "Printable it", "Invoice", "oi")];
  S.s.out.push("Invoice #INV-001: Rp 150000");
  S.snap({ line: "call", note: "Baris yang sama → versi Invoice", tone: "done", flow: { path: ["v:it", "o:oi", "c:Invoice.m:info"] }, marks: { "c:Invoice.m:info": "ok" }, dur: 2300 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 7 — KASUS: interface mewarisi interface
  S.s.code = "ext";
  S.s.out = []; S.s.objects = []; S.s.vars = [];
  S.s.classes = [iface("Shape", "area", "volume"), iface("Printable", "info"),
    { id: "PrintableShape", ...P.PrintableShape, theme: "blue", kind: "interface", members: [m("inh", "(3 method warisan)", "attr")] }];
  S.s.links = [
    { id: "e1", from: "c:PrintableShape.base", to: "c:Shape.base", label: "extends", inherit: true },
    { id: "e2", from: "c:PrintableShape.base", to: "c:Printable.base", label: "extends", inherit: true }
  ];
  S.snap({ line: "ps", note: "Interface boleh extends beberapa interface sekaligus", marks: { "c:PrintableShape": "new" }, dur: 2300 });
  S.s.classes.push(cls("Stiker", [m("area", "area()"), m("volume", "volume()"), m("info", "printInfo()")], { impl: ["PrintableShape"], theme: "sand" }));
  S.s.objects = [{ id: "os", title: "objek Stiker", u: P.Stiker.u + 3.2, v: P.Stiker.v + 0.6, theme: "sand", attrs: [] }];
  S.s.vars = [{ id: "s", label: "PrintableShape s", u: P.Stiker.u + 3.2, v: P.Stiker.v + 3.2, to: "os" }];
  S.s.out = ["Stiker 5 x 2.5 cm"];
  S.snap({ line: "c1", note: "Stiker wajib mengisi ketiga method", tone: "done", flow: { path: ["v:s", "o:os", "c:Stiker.m:info"] }, marks: { "c:Stiker.m:info": "ok", "o:os": "new" }, dur: 2400 });
  S.s.out.push("12.5");
  S.snap({ line: "c2", note: "s.area() → 5 × 2,5 = 12.5", tone: "done", flow: { path: ["v:s", "o:os", "c:Stiker.m:area"] }, marks: { "c:Stiker.m:area": "ok" }, dur: 2200 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.s.links = [];
  S.snap({ line: "pt_cls", note: "Interface: kontrak yang boleh dipenuhi siapa saja", tone: "done", marks: { "c:Point.m:info": "ok", "c:Invoice.m:info": "ok" }, dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "interface",
    renderer: "oop",
    lang: "java",
    title: "Interface: Kontrak Perilaku",
    subtitle: "Java hanya mengizinkan satu superclass. Interface memberi jalan keluar: satu class boleh memenuhi banyak kontrak sekaligus.",
    minutes: 15,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Mendeklarasikan `interface` berisi method abstract", at: 1 },
      { text: "`implements`: wajib meng-override semua method", at: 2 },
      { text: "Variabel di interface adalah konstanta", at: 4 },
      { text: "Satu class, banyak interface", at: 5 },
      { text: "Interface `extends` interface lain", at: 6 }
    ],
    metrics: [
      { key: "ifs", label: "Interface", icon: "◇" },
      { key: "req", label: "Method wajib", icon: "∅" },
      { key: "objs", label: "Objek", icon: "◆" },
      { key: "err", label: "Error kompilasi", icon: "!" }
    ],
    legend: [
      { color: "#22d3ee", label: "Interface" },
      { color: "#d946ef", label: "Class" },
      { color: "#6366f1", round: true, label: "Jalur pemanggilan" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Dua induk", title: "Satu class, dua induk?",
        text: [
          "Point sudah `extends Shape`. Kita juga ingin Point bisa dicetak, sama seperti class lain yang sama sekali bukan bentuk, misalnya Invoice. Idenya: buat class `Printable`, lalu `extends Shape, Printable`.",
          "Compiler menolak (*'{' expected*). Java hanya mengizinkan **satu superclass** untuk setiap class (*single inheritance*)."
        ],
        changed: [["+", "Error: '{' expected"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "interface", title: "Mendeklarasikan interface",
        text: [
          "**Interface** adalah konstruksi mirip class yang hanya berisi **konstanta** dan **method abstract**. Tujuannya menetapkan **perilaku bersama** untuk objek-objek.",
          "Sesuai slide: `interface Shape { public double area(); public double volume(); }`. Seperti abstract class, interface **tidak bisa di-new**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Sejak Java 8, interface juga boleh berisi `default` dan `static` method yang punya isi. Pelajaran ini mengikuti definisi klasik di slide." },
        changed: [["+", "interface Shape"], ["+", "Error: cannot be instantiated"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "implements", title: "implements: memenuhi kontrak",
        text: [
          "Class memakai interface dengan kata kunci **implements**: `public class Point implements Shape`.",
          "Kedua method interface **wajib di-override**. Jika `volume()` tertinggal, compiler menolak. Setelah keduanya ditulis, Point diterima."
        ],
        changed: [["+", "Point implements Shape"], ["+", "area() dan volume() di Point"]],
        frames: steps[2]
      },
      {
        kind: "SOLUSI", short: "Dipakai", title: "Interface sebagai tipe",
        text: [
          "`Point p = new Point(); p.print();` mencetak `point: 0,0`, persis seperti di slide.",
          "Interface juga bisa menjadi **tipe variabel**: `Shape s = p`. Lewat `s`, hanya method milik Shape yang terlihat, dan `s.area()` menjalankan versi Point: `0.0`."
        ],
        changed: [["+", "objek Point"], ["+", "Output: point: 0,0 dan 0.0"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Konstanta", title: "Variabel di interface adalah konstanta",
        text: [
          "`double PI = 3.14;` di dalam interface otomatis bersifat **public static final**: dibaca lewat nama interface (`Shape.PI` → `3.14`) dan tidak bisa diubah.",
          "`Shape.PI = 3;` ditolak: *cannot assign a value to static final variable PI*."
        ],
        changed: [["+", "double PI = 3.14"], ["+", "Error: final variable"]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Banyak interface", title: "Banyak interface sekaligus",
        text: [
          "Class hanya boleh punya satu superclass, tetapi boleh **implements banyak interface**: `class Point implements Shape, Printable`.",
          "Invoice bukan bentuk, tetapi juga Printable. Dalam satu loop `Printable[]`, `it.printInfo()` menjalankan versi Point lalu versi Invoice."
        ],
        callout: { type: "IDE KUNCI", text: "Interface menghubungkan class yang tidak bersaudara, asalkan perilakunya sama. Bentuk lengkapnya: `class A extends B implements I1, I2, …`." },
        changed: [["+", "interface Printable"], ["+", "class Invoice"], ["+", "2 baris output"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "extends", title: "Kasus: interface mewarisi interface",
        text: [
          "Slide menyebut interface bisa mewarisi interface lain dengan **extends**, bahkan lebih dari satu: `interface PrintableShape extends Shape, Printable { }`.",
          "Class Stiker yang `implements PrintableShape` wajib mengisi ketiga method: `area()`, `volume()`, dan `printInfo()`. Hasilnya `Stiker 5 x 2.5 cm` dan luas `12.5`."
        ],
        changed: [["+", "interface PrintableShape"], ["+", "class Stiker"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Rangkuman",
        text: ["Interface adalah kontrak perilaku. Satu class bisa memenuhi banyak kontrak, dan class yang tidak bersaudara bisa memenuhi kontrak yang sama."],
        bullets: [
          "Dideklarasikan dengan `interface`, dipakai dengan `implements`.",
          "Semua method wajib di-override oleh class konkret.",
          "Variabelnya otomatis `public static final`.",
          "Tidak bisa di-new, tetapi bisa dipakai sebagai tipe.",
          "Satu class boleh implements banyak interface; interface boleh extends banyak interface."
        ],
        quiz: [
          { q: "Deklarasi mana yang valid di Java?", options: ["class A extends B, C", "class A implements I1, I2", "interface I implements J", "class A extends I1, I2"], answer: 1, why: "Class hanya boleh satu superclass, tetapi boleh implements banyak interface." },
          { q: "`double PI = 3.14;` ditulis di dalam interface. Sifatnya…", options: ["Variabel biasa milik objek", "public static final", "private", "abstract"], answer: 1, why: "Variabel interface otomatis konstanta: public static final." },
          { q: "Class Point implements Shape, tetapi hanya mengisi area(), tidak volume(). Hasilnya?", options: ["volume() mengembalikan 0", "Error kompilasi", "Error saat runtime", "volume() diabaikan"], answer: 1, why: "Class konkret wajib mengisi semua method abstract dari interface." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Pelajaran berikutnya: **Interface vs Abstract Class**, yaitu kapan memakai yang mana dalam kasus kasir kampus."
  });
})();
