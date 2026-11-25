/* Pelajaran: Interface vs Abstract Class (Modul 09 · Sesi 9 · LO 4)
 * Mengikuti slide "Interface VS Abstract Class (1) dan (2)" dengan studi kasus kasir kantin kampus.
 * Biaya admin adalah angka ilustrasi. Semua output dan pesan error sudah dicocokkan dengan javac/java 21.
 */
(function () {
  const PB = { u: -1.5, v: -4.0 }, CI = { u: 4.6, v: -4.0 };
  const COL = { Tunai: -4.5, Transfer: -1.5, KartuKredit: 1.5 };
  const CV = 0.6, OV = 5.0, SV = 7.6;
  const THEME = { Tunai: "sand", Transfer: "teal", KartuKredit: "violet" };
  const ADMIN = { Tunai: "0", Transfer: "2500", KartuKredit: "jumlah * 0.02" };

  const m = (id, label, kind) => ({ id, label, kind: kind || "method" });
  const pemb = () => ({ id: "Pembayaran", ...PB, theme: "blue", kind: "abstract", members: [
    m("nama", "String nama · double jumlah", "attr"), m("ctor", "Pembayaran(nama, jumlah)"), m("struk", "cetakStruk()"), m("admin", "abstract biayaAdmin();", "abstract")
  ] });
  const cicilan = () => ({ id: "Cicilan", ...CI, theme: "teal", kind: "interface", members: [m("maks", "int MAKS_BULAN = 12", "attr"), m("cpb", "cicilanPerBulan(bulan);", "abstract")] });
  const sub = (name, extra) => Object.assign({ id: name, u: COL[name], v: CV, theme: THEME[name], parent: "Pembayaran", extLabel: false, members: [m("ctor", name + "(jumlah)"), m("admin", "biayaAdmin()")] }, extra || {});
  const solo = (name) => ({ id: name, u: COL[name], v: CV, theme: THEME[name], members: [m("jml", "double jumlah", "attr"), m("struk", "cetakStruk()"), m("admin", "biayaAdmin()")] });
  const obj = (id, cls, jumlah) => ({ id, title: "objek " + cls, u: COL[cls], v: OV, theme: THEME[cls], attrs: [["nama", "\"" + cls + "\""], ["jumlah", jumlah]] });
  const vr = (id, label, cls, to) => ({ id, label, u: COL[cls], v: SV, to });

  // ---------- kode ----------
  const SOLO = (name) => [
    [name === "Tunai" ? "d_cls" : "", "class " + name + " {"],
    ["", "    double jumlah;"],
    ["", "    " + name + "(double jumlah) { this.jumlah = jumlah; }"],
    ["d_struk", "    void cetakStruk() {"],
    ["", "        System.out.println(\"" + name + ": \" + jumlah + \" + admin \" + biayaAdmin());"],
    ["", "    }"],
    ["", "    double biayaAdmin() { return " + ADMIN[name] + "; }"],
    ["", "}"]
  ];
  const ABS = [
    ["a_cls", "abstract class Pembayaran {"],
    ["a_f", "    protected String nama;"],
    ["", "    protected double jumlah;"],
    ["a_ctor", "    Pembayaran(String nama, double jumlah) {"],
    ["", "        this.nama = nama;"],
    ["", "        this.jumlah = jumlah;"],
    ["", "    }"],
    ["a_struk", "    void cetakStruk() {"],
    ["", "        System.out.println(nama + \": \" + jumlah + \" + admin \" + biayaAdmin());"],
    ["", "    }"],
    ["a_admin", "    abstract double biayaAdmin();"],
    ["", "}"]
  ];
  const SUB = (name, impl) => {
    const rows = [
      [name.toLowerCase() + "_cls", "class " + name + " extends Pembayaran" + (impl ? " implements Cicilan" : "") + " {"],
      [name.toLowerCase() + "_ctor", "    " + name + "(double jumlah) { super(\"" + name + "\", jumlah); }"],
      ["", "    double biayaAdmin() { return " + ADMIN[name] + "; }"]
    ];
    if (impl) rows.push(["kk_cpb", "    public double cicilanPerBulan(int bulan) { return (jumlah + biayaAdmin()) / bulan; }"]);
    rows.push(["", "}"]);
    return rows;
  };
  const CICILAN = [
    ["i_cls", "interface Cicilan {"],
    ["i_maks", "    int MAKS_BULAN = 12;"],
    ["i_cpb", "    double cicilanPerBulan(int bulan);"],
    ["", "}"]
  ];
  const MAIN = (...rows) => [["", "public class Kasir {"], ["", "    public static void main(String[] args) {"], ...rows, ["", "    }"], ["", "}"]];
  const LOOP = [
    ["arr", "        Pembayaran[] bayar = { new Tunai(50000), new Transfer(50000), new KartuKredit(3000000) };"],
    ["for", "        for (Pembayaran p : bayar) {"],
    ["call", "            p.cetakStruk();"],
    ["", "        }"]
  ];
  const CODE = {
    dup: [...SOLO("Tunai"), ...SOLO("Transfer"), ...SOLO("KartuKredit")],
    abs: [...ABS, ...SUB("Tunai"), ...SUB("Transfer"), ...SUB("KartuKredit"), ...MAIN(...LOOP)],
    cicil: [...ABS, ...CICILAN, ...SUB("Tunai"), ...SUB("Transfer"), ...SUB("KartuKredit", true), ...MAIN(...LOOP,
      ["mkC", "        Cicilan c = new KartuKredit(3000000);"],
      ["pC", "        System.out.println(c.cicilanPerBulan(6));"],
      ["pM", "        System.out.println(Cicilan.MAKS_BULAN);"])],
    ganda: [...ABS,
      ["k_cls", "class Kartu { String nomor; }"],
      ["kk_cls", "class KartuKredit extends Pembayaran, Kartu {"],
      ["", "    KartuKredit(double jumlah) { super(\"KartuKredit\", jumlah); }"],
      ["", "    double biayaAdmin() { return jumlah * 0.02; }"],
      ["", "}"],
      ...MAIN()],
    field: [["i_cls", "interface Cicilan {"], ["+i_saldo", "    double saldo;"], ["i_cpb", "    double cicilanPerBulan(int bulan);"], ["", "}"], ...MAIN()],
    ctor: [["i_cls", "interface Cicilan {"], ["+i_ctor", "    Cicilan(int bulan) { }"], ["i_cpb", "    double cicilanPerBulan(int bulan);"], ["", "}"], ...MAIN()]
  };
  const lineOf = (ver, id) => CODE[ver].findIndex((l) => l[0].replace(/^\+/, "") === id) + 1;

  // ---------- metrik ----------
  const metricsOf = (f) => {
    const cs = f.classes || [], out = f.out || [];
    return {
      dup: cs.filter((c) => !c.parent && !c.kind && c.members.some((x) => x.id === "struk")).length * 2,
      abs: cs.filter((c) => c.kind === "abstract").length,
      ifs: cs.filter((c) => c.kind === "interface").length,
      err: out.filter((l) => /^!\S+\.java:\d+: error/.test(l)).length
    };
  };

  const S = OOPStory({ classes: ["Tunai", "Transfer", "KartuKredit"].map(solo), objects: [], vars: [], out: [], code: "dup" }, metricsOf);
  const steps = [];
  const STRUK = { Tunai: "Tunai: 50000.0 + admin 0.0", Transfer: "Transfer: 50000.0 + admin 2500.0", KartuKredit: "KartuKredit: 3000000.0 + admin 60000.0" };

  // 1 — MASALAH: tiga class, kode kembar
  S.snap({ line: "d_cls", note: "Tiga cara bayar di kasir kantin kampus", marks: { "c:Tunai": "new", "c:Transfer": "new", "c:KartuKredit": "new" }, dur: 1900 });
  const dupMarks = {};
  ["Tunai", "Transfer", "KartuKredit"].forEach((c) => { dupMarks["c:" + c + ".m:jml"] = "hl"; dupMarks["c:" + c + ".m:struk"] = "hl"; });
  S.snap({ line: "d_struk", note: "jumlah dan cetakStruk() ditulis tiga kali", tone: "alert", marks: dupMarks, dur: 2400 });
  steps.push(S.take());

  // 2 — abstract class: yang sama disatukan
  S.s.code = "abs";
  S.s.classes = [pemb(), sub("Tunai"), sub("Transfer"), sub("KartuKredit")];
  S.snap({ line: "a_cls", note: "abstract class Pembayaran menyimpan bagian yang sama", marks: { "c:Pembayaran": "new", "c:Pembayaran.m:nama": "hl", "c:Pembayaran.m:struk": "hl" }, dur: 2300 });
  S.snap({ line: "tunai_ctor", note: "Subclass: extends + super(nama, jumlah), lalu isi biayaAdmin()", marks: { "c:Pembayaran.m:ctor": "hl", "c:Tunai.m:admin": "new", "c:Transfer.m:admin": "new", "c:KartuKredit.m:admin": "new" }, flow: { path: ["c:Tunai.m:ctor", "c:Pembayaran.m:ctor"] }, dur: 2500 });
  steps.push(S.take());

  // 3 — loop polimorfik
  S.s.objects = [obj("ot", "Tunai", "50000.0"), obj("of", "Transfer", "50000.0"), obj("ok", "KartuKredit", "3000000.0")];
  S.snap({ line: "arr", note: "Tiga objek, satu array Pembayaran[]", marks: { "o:ot": "new", "o:of": "new", "o:ok": "new" }, dur: 1900 });
  [["ot", "Tunai"], ["of", "Transfer"], ["ok", "KartuKredit"]].forEach(([o, c]) => {
    S.s.vars = [vr("p", "Pembayaran p", c, o)];
    S.s.out.push(STRUK[c]);
    S.snap({ line: "call", note: "cetakStruk() milik induk memanggil biayaAdmin() milik " + c, tone: "done", flow: { path: ["v:p", "o:" + o, "c:Pembayaran.m:struk", "c:" + c + ".m:admin"] }, marks: { "c:Pembayaran.m:struk": "hl", ["c:" + c + ".m:admin"]: "ok" }, dur: 2300 });
  });
  steps.push(S.take());

  // 4 — interface: kemampuan tambahan
  S.s.code = "cicil";
  S.s.vars = [];
  S.s.classes = [pemb(), cicilan(), sub("Tunai"), sub("Transfer"), sub("KartuKredit", { impl: ["Cicilan"], members: [m("ctor", "KartuKredit(jumlah)"), m("admin", "biayaAdmin()"), m("cpb", "cicilanPerBulan(bulan)")] })];
  S.snap({ line: "i_cls", note: "Hanya kartu kredit yang bisa dicicil: interface Cicilan", marks: { "c:Cicilan": "new" }, dur: 2100 });
  S.snap({ line: "kartukredit_cls", note: "KartuKredit extends Pembayaran implements Cicilan", marks: { "c:KartuKredit.m:cpb": "new", "c:Cicilan.m:cpb": "hl" }, dur: 2300 });
  steps.push(S.take());

  // 5 — SOLUSI
  S.s.vars = [vr("c", "Cicilan c", "KartuKredit", "ok")];
  S.s.out.push("510000.0");
  S.snap({ line: "pC", note: "(3.000.000 + 60.000) ÷ 6 = 510.000 per bulan", tone: "done", flow: { path: ["v:c", "o:ok", "c:KartuKredit.m:cpb"] }, marks: { "c:KartuKredit.m:cpb": "ok" }, dur: 2500 });
  S.s.out.push("12");
  S.snap({ line: "pM", note: "Cicilan.MAKS_BULAN: konstanta di interface", tone: "done", marks: { "c:Cicilan.m:maks": "ok" }, dur: 1800 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 6 — KASUS: dua superclass
  S.s.code = "ganda";
  S.s.out = []; S.s.objects = []; S.s.vars = [];
  S.s.classes = [pemb(), { id: "Kartu", ...CI, theme: "sand", members: [m("no", "String nomor", "attr")] }, sub("KartuKredit")];
  S.s.links = [{ id: "dua", from: "c:KartuKredit.base", to: "c:Kartu.base", label: "extends kedua?", inherit: true }];
  S.snap({ line: "k_cls", note: "KartuKredit juga ingin mewarisi class Kartu", marks: { "c:Kartu": "new" }, dur: 1800 });
  S.s.out = ["!Kasir.java:" + lineOf("ganda", "kk_cls") + ": error: '{' expected"];
  S.snap({ line: "kk_cls", note: "Ditolak: satu class, satu superclass. Jadikan Kartu interface", tone: "alert", marks: { "c:KartuKredit": "err", "c:Kartu": "miss" }, dur: 2600 });
  steps.push(S.take());

  // 7 — KASUS: aturan isi interface
  S.s.code = "field";
  S.s.links = [];
  S.s.classes = [{ id: "Cicilan", ...CI, theme: "teal", kind: "interface", members: [m("saldo", "double saldo;", "attr"), m("cpb", "cicilanPerBulan(bulan);", "abstract")] }];
  S.s.out = ["!Kasir.java:" + lineOf("field", "i_saldo") + ": error: = expected"];
  S.snap({ line: "i_saldo", note: "Variabel di interface wajib diberi nilai: ia konstanta", tone: "alert", marks: { "c:Cicilan.m:saldo": "err" }, dur: 2400 });
  S.s.code = "ctor";
  S.s.classes = [{ id: "Cicilan", ...CI, theme: "teal", kind: "interface", members: [m("ctor", "Cicilan(int bulan) { }"), m("cpb", "cicilanPerBulan(bulan);", "abstract")] }];
  S.s.out = ["!Kasir.java:" + lineOf("ctor", "i_ctor") + ": error: <identifier> expected"];
  S.snap({ line: "i_ctor", note: "Interface tidak punya konstruktor", tone: "alert", marks: { "c:Cicilan.m:ctor": "err" }, dur: 2400 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "kartukredit_cls", note: "extends untuk \"adalah\", implements untuk \"bisa\"", tone: "done", marks: { "c:Pembayaran": "ok", "c:Cicilan": "ok" }, dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "interface-vs-abstract",
    renderer: "oop",
    lang: "java",
    title: "Interface vs Abstract Class: Kasir Kantin Kampus",
    subtitle: "Tunai, transfer, dan kartu kredit sama-sama pembayaran, tetapi hanya kartu kredit yang bisa dicicil. Lihat kapan memakai extends dan kapan implements.",
    minutes: 16,
    level: "Menengah",
    lo: "LO 4",
    learn: [
      { text: "Abstract class untuk menyatukan atribut dan kode bersama", at: 1 },
      { text: "Rantai konstruktor lewat `super(...)`", at: 1 },
      { text: "Interface untuk kemampuan tambahan sebagian class", at: 3 },
      { text: "Single inheritance class, multiple interface", at: 5 },
      { text: "Perbedaan variabel, konstruktor, dan method", at: 6 }
    ],
    metrics: [
      { key: "dup", label: "Bagian kembar", icon: "⧉" },
      { key: "abs", label: "Abstract class", icon: "◇" },
      { key: "ifs", label: "Interface", icon: "◈" },
      { key: "err", label: "Error kompilasi", icon: "!" }
    ],
    legend: [
      { color: "#6366f1", label: "Abstract class" },
      { color: "#22d3ee", label: "Interface" },
      { color: "#6366f1", round: true, label: "Jalur pemanggilan" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Kode kembar", title: "Tiga cara bayar, kode kembar",
        text: [
          "Kasir kantin kampus menerima **tunai**, **transfer**, dan **kartu kredit**. Ketiga class punya `jumlah` dan `cetakStruk()` yang isinya sama; hanya `biayaAdmin()` yang berbeda.",
          "Bagian yang sama ditulis tiga kali. Mana yang lebih cocok untuk menyatukannya: abstract class atau interface?"
        ],
        changed: [["+", "Tunai, Transfer, KartuKredit"], ["+", "6 bagian kembar"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Abstract class", title: "Abstract class untuk bagian yang sama",
        text: [
          "Ketiganya **adalah** pembayaran, dan berbagi **data** (`nama`, `jumlah`) serta **kode** (`cetakStruk()`). Ini cocok untuk **abstract class** `Pembayaran`.",
          "Subclass cukup `extends Pembayaran`, memanggil konstruktor induk lewat `super(\"Tunai\", jumlah)`, lalu mengisi `biayaAdmin()`. Slide menyebutnya **constructor chain**: konstruktor abstract class dipanggil lewat konstruktor subclass."
        ],
        changed: [["+", "abstract class Pembayaran"], ["~", "Bagian kembar 6 → 0"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Loop", title: "Kode induk, detail anak",
        text: [
          "`p.cetakStruk()` selalu menjalankan versi induk, tetapi di dalamnya `biayaAdmin()` mengikuti objeknya: 0 untuk tunai, 2.500 untuk transfer, 2% untuk kartu kredit.",
          "Kode bersama ditulis sekali di abstract class; bagian yang berbeda diisi tiap subclass."
        ],
        changed: [["+", "3 struk tercetak"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Interface", title: "Interface untuk kemampuan tambahan",
        text: [
          "Hanya kartu kredit yang **bisa** dicicil. Kemampuan ini bukan milik semua pembayaran, jadi tidak diletakkan di `Pembayaran`. Ia menjadi **interface** `Cicilan`.",
          "`class KartuKredit extends Pembayaran implements Cicilan`: satu superclass, ditambah kontrak cicilan."
        ],
        callout: { type: "IDE KUNCI", text: "Abstract class menjawab \"objek ini **adalah** apa?\". Interface menjawab \"objek ini **bisa** apa?\"." },
        changed: [["+", "interface Cicilan"], ["+", "KartuKredit.cicilanPerBulan()"]],
        frames: steps[3]
      },
      {
        kind: "SOLUSI", short: "Cicilan", title: "Cicilan 6 bulan",
        text: [
          "`Cicilan c = new KartuKredit(3000000)`: lewat tipe interface, `c.cicilanPerBulan(6)` menghitung `(3.000.000 + 60.000) ÷ 6 = 510000.0`.",
          "`Cicilan.MAKS_BULAN` bernilai `12`: konstanta milik interface, dibaca lewat nama interface-nya."
        ],
        changed: [["+", "Output: 510000.0 dan 12"]],
        frames: steps[4]
      },
      {
        kind: "KASUS", short: "Dua induk", title: "Kasus: dua superclass",
        text: [
          "Tim ingin KartuKredit juga mewarisi class `Kartu` (berisi nomor kartu). `extends Pembayaran, Kartu` ditolak compiler.",
          "Java hanya mengizinkan **satu** superclass, tetapi **banyak** interface. Jika Kartu dijadikan interface, KartuKredit boleh `implements Cicilan, Kartu`."
        ],
        changed: [["+", "Error: '{' expected"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "Isi interface", title: "Kasus: aturan isi interface",
        text: [
          "Sesuai tabel di slide, variabel interface harus `public static final`, sehingga `double saldo;` tanpa nilai ditolak (*= expected*).",
          "Interface juga **tidak punya konstruktor**: `Cicilan(int bulan) { }` ditolak. Abstract class justru boleh punya keduanya: variabel bebas dan konstruktor."
        ],
        changed: [["+", "Error: = expected"], ["+", "Error: <identifier> expected"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Interface vs abstract class",
        text: ["Perbedaannya terlihat dari pemakaiannya: interface **di-implement**, abstract class **diturunkan** (diwarisi). Ringkasan tabel slide:"],
        bullets: [
          "Variabel: abstract class bebas; interface wajib `public static final`.",
          "Konstruktor: abstract class punya (dipanggil lewat subclass); interface tidak punya. Keduanya tidak bisa di-new.",
          "Method: abstract class bebas (boleh berisi kode); interface berisi method `public abstract`.",
          "Pewarisan: satu superclass saja, tetapi boleh banyak interface.",
          "Pilih abstract class untuk \"adalah\" dengan kode bersama; interface untuk \"bisa\" lintas class."
        ],
        quiz: [
          { q: "Tunai, Transfer, dan KartuKredit berbagi atribut jumlah dan method cetakStruk(). Paling cocok memakai…", options: ["Interface", "Abstract class", "Dua-duanya salah", "Class final"], answer: 1, why: "Abstract class bisa menyimpan atribut dan kode bersama, serta konstruktor." },
          { q: "Kemampuan \"bisa dicicil\" hanya untuk sebagian class, bahkan bisa untuk class di hierarki lain. Paling cocok…", options: ["Interface", "Abstract class", "Konstruktor", "Variabel static"], answer: 0, why: "Interface menetapkan kemampuan yang boleh dipenuhi class mana saja." },
          { q: "Mana yang BENAR tentang interface (definisi slide)?", options: ["Boleh punya konstruktor", "Variabelnya boleh diubah", "Variabelnya public static final", "Hanya boleh di-implement satu class"], answer: 2, why: "Variabel interface adalah konstanta: public static final." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "Tugas sesuai slide: buat program menghitung luas **Rectangle, Triangle, dan Circle** dengan abstract class."
  });
})();
