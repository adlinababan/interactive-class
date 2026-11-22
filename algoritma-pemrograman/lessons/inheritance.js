/* Pelajaran: Inheritance (Modul 07 · Teori 9 · Lab 9 · LO 3)
 * Contoh kode mengikuti slide "Classes" bagian Inheritance: Car → ElectricCar, lalu Battery.
 * Semua output konsol sudah dicocokkan dengan menjalankan programnya di Python 3.13.
 * Catatan: isi fill_gas_tank() milik Car tidak ada di slide; di sini hanya contoh.
 */
(function () {
  const CAR = { u: -4.6, v: 0 }, EC = { u: -1.0, v: 0 }, BAT = { u: 5.5, v: 0 };
  const O1 = { u: 2.3, v: 0.2 }, OB = { u: 4.3, v: 3.9 }, O3 = { u: 5.5, v: 0.2 };

  const CM = [
    { id: "init", label: "__init__(make, model, year)", kind: "method" },
    { id: "attrs", label: "make · model · year", kind: "attr" },
    { id: "odo", label: "odometer_reading = 0", kind: "attr" },
    { id: "desc", label: "get_descriptive_name()", kind: "method" },
    { id: "read", label: "read_odometer()", kind: "method" },
    { id: "upd", label: "update_odometer(mileage)", kind: "method" },
    { id: "inc", label: "increment_odometer(miles)", kind: "method" },
    { id: "fill", label: "fill_gas_tank()", kind: "method" }
  ];
  const CAR_METHODS = CM.filter((m) => m.kind === "method").map((m) => m.id);
  const EM = {
    init: { id: "init", label: "__init__(make, model, year)", kind: "method" },
    sup: { id: "sup", label: "super().__init__(...)", kind: "attr" },
    bsize: { id: "bsize", label: "battery_size = 40", kind: "attr" },
    descb: { id: "descb", label: "describe_battery()", kind: "method" },
    fill: { id: "fill", label: "fill_gas_tank()", kind: "method" },
    bat: { id: "bat", label: "battery = Battery()", kind: "attr" }
  };
  const BM = [
    { id: "init", label: "__init__(battery_size=40)", kind: "method" },
    { id: "bsize", label: "battery_size", kind: "attr" },
    { id: "descb", label: "describe_battery()", kind: "method" },
    { id: "range", label: "get_range()", kind: "method" }
  ];
  const carClass = () => ({ id: "Car", ...CAR, theme: "blue", members: CM });
  const ecClass = (...ids) => ({ id: "ElectricCar", title: "ElectricCar(Car)", ...EC, theme: "violet", parent: "Car", members: ids.map((k) => EM[k]) });
  const batClass = () => ({ id: "Battery", ...BAT, theme: "teal", members: BM });

  // ---------- kode ----------
  const CAR_BODY = [
    ["c_init", "    def __init__(self, make, model, year):"],
    ["", "        self.make = make"],
    ["", "        self.model = model"],
    ["", "        self.year = year"],
    ["", "        self.odometer_reading = 0"],
    ["", ""],
    ["c_desc", "    def get_descriptive_name(self):"],
    ["", "        long_name = f\"{self.year} {self.make} {self.model}\""],
    ["", "        return long_name.title()"],
    ["", ""],
    ["c_read", "    def read_odometer(self):"],
    ["", "        print(f\"This car has {self.odometer_reading} miles on it.\")"],
    ["", ""],
    ["c_upd", "    def update_odometer(self, mileage):"],
    ["", "        if mileage >= self.odometer_reading:"],
    ["", "            self.odometer_reading = mileage"],
    ["", "        else:"],
    ["", "            print(\"You can't roll back an odometer!\")"],
    ["", ""],
    ["c_inc", "    def increment_odometer(self, miles):"],
    ["", "        self.odometer_reading += miles"],
    ["", ""],
    ["c_fill", "    def fill_gas_tank(self):"],
    ["", "        print(\"Filling the gas tank.\")"]
  ];
  const DUP_LINES = CAR_BODY.filter(([, t]) => t.trim()).length;
  const CAR_SHORT = [
    ["c_cls", "class Car:"],
    ["c_init", "    def __init__(self, make, model, year): ..."],
    ["c_desc", "    def get_descriptive_name(self): ..."],
    ["c_read", "    def read_odometer(self): ..."],
    ["c_upd", "    def update_odometer(self, mileage): ..."],
    ["c_inc", "    def increment_odometer(self, miles): ..."],
    ["c_fill", "    def fill_gas_tank(self): ..."],
    ["", ""]
  ];
  const EC_HEAD = [
    ["e_cls", "class ElectricCar(Car):"],
    ["", "    \"\"\"Represent aspects of a car, specific to electric vehicles.\"\"\""],
    ["", ""],
    ["e_init", "    def __init__(self, make, model, year):"],
    ["", "        \"\"\"Initialize attributes of the parent class.\"\"\""],
    ["sup", "        super().__init__(make, model, year)"]
  ];
  const CODE = {
    copy: [
      ["c_cls", "class Car:"], ...CAR_BODY, ["", ""],
      ["dup", "class ElectricCar:          # disalin dari Car"],
      ...CAR_BODY.map(([id, t]) => [id ? "d" + id.slice(1) : "", t])
    ],
    inh: [
      ...CAR_SHORT, ...EC_HEAD, ["", ""],
      ["mk", "my_leaf = ElectricCar('nissan', 'leaf', 2024)"],
      ["p1", "print(my_leaf.get_descriptive_name())"]
    ],
    child: [
      ...CAR_SHORT, ...EC_HEAD,
      ["+bsize", "        self.battery_size = 40"],
      ["", ""],
      ["+descb", "    def describe_battery(self):"],
      ["+", "        \"\"\"Print a statement describing the battery size.\"\"\""],
      ["+descbp", "        print(f\"This car has a {self.battery_size}-kWh battery.\")"],
      ["", ""],
      ["mk", "my_leaf = ElectricCar('nissan', 'leaf', 2024)"],
      ["p1", "print(my_leaf.get_descriptive_name())"],
      ["p2", "my_leaf.describe_battery()"]
    ],
    over: [
      ...CAR_SHORT,
      ["e_cls", "class ElectricCar(Car):"],
      ["", "    --snip--"],
      ["", ""],
      ["+fill", "    def fill_gas_tank(self):"],
      ["+", "        \"\"\"Electric cars don't have gas tanks.\"\"\""],
      ["+fillp", "        print(\"This car doesn't have a gas tank!\")"],
      ["", ""],
      ["p3", "my_leaf.fill_gas_tank()"]
    ],
    bat: [
      ["c_cls", "class Car:"],
      ["", "    --snip--"],
      ["", ""],
      ["b_cls", "class Battery:"],
      ["", "    \"\"\"A simple attempt to model a battery for an electric car.\"\"\""],
      ["b_init", "    def __init__(self, battery_size=40):"],
      ["", "        self.battery_size = battery_size"],
      ["", ""],
      ["b_desc", "    def describe_battery(self):"],
      ["b_descp", "        print(f\"This car has a {self.battery_size}-kWh battery.\")"],
      ["", ""],
      ["b_range", "    def get_range(self):"],
      ["", "        if self.battery_size == 40:"],
      ["", "            range = 150"],
      ["", "        elif self.battery_size == 65:"],
      ["", "            range = 225"],
      ["b_rangep", "        print(f\"This car can go about {range} miles on a full charge.\")"],
      ["", ""],
      ["e_cls", "class ElectricCar(Car):"],
      ["e_init", "    def __init__(self, make, model, year):"],
      ["sup", "        super().__init__(make, model, year)"],
      ["+bat", "        self.battery = Battery()"],
      ["", ""],
      ["mk", "my_leaf = ElectricCar('nissan', 'leaf', 2024)"],
      ["p4", "my_leaf.battery.describe_battery()"],
      ["p5", "my_leaf.battery.get_range()"]
    ],
    mus: [
      ...CAR_SHORT,
      ["e_cls", "class ElectricCar(Car):"],
      ["", "    --snip--"],
      ["", ""],
      ["mk3", "my_mustang = Car('ford', 'mustang', 2024)"],
      ["p6", "print(my_mustang.get_descriptive_name())"],
      ["p7", "my_mustang.describe_battery()"]
    ]
  };

  // ---------- metrik ----------
  const metricsOf = (f) => {
    const ec = (f.classes || []).find((c) => c.id === "ElectricCar");
    const own = ec ? ec.members.filter((m) => m.kind === "method").map((m) => m.id) : [];
    return {
      classes: (f.classes || []).length,
      dup: f.dup || 0,
      inherited: ec && ec.parent ? CAR_METHODS.filter((id) => !own.includes(id)).length : 0,
      objs: (f.objects || []).length
    };
  };

  const S = OOPStory({ classes: [carClass()], objects: [], vars: [], out: [], code: "copy", dup: 0 }, metricsOf);
  const steps = [];

  // 1 — MASALAH: salin-tempel
  S.snap({ line: "c_cls", note: "Butuh mobil listrik. Salin saja class Car?", dur: 1600 });
  S.s.classes.push({ id: "ElectricCar", ...EC, theme: "rose", members: CM });
  S.s.dup = DUP_LINES;
  S.snap({ line: "dup", note: DUP_LINES + " baris yang sama ditulis dua kali", tone: "alert", marks: Object.fromEntries(CM.map((m) => ["c:ElectricCar.m:" + m.id, "err"])), dur: 2200 });
  steps.push(S.take());

  // 2 — class anak
  S.s.code = "inh";
  S.s.dup = 0;
  S.s.classes = [carClass(), ecClass("init", "sup")];
  S.snap({ line: "e_cls", note: "class ElectricCar(Car): Car di dalam kurung = class induk", marks: { "c:ElectricCar": "new", "c:Car": "hl" }, dur: 2200 });
  S.snap({ line: "sup", note: "Semua method Car ikut dimiliki ElectricCar", marks: Object.fromEntries(CAR_METHODS.filter((m) => m !== "init").map((m) => ["c:Car.m:" + m, "hl"])), dur: 1800 });
  steps.push(S.take());

  // 3 — super().__init__()
  S.snap({ line: "mk", note: "ElectricCar('nissan', 'leaf', 2024)", marks: { "c:ElectricCar.m:init": "hl" }, dur: 1300 });
  S.snap({ line: "sup", note: "super() memanggil __init__ milik Car", flow: { path: ["c:ElectricCar.m:sup", "c:Car.m:init"] }, marks: { "c:ElectricCar.m:sup": "hl", "c:Car.m:init": "hl" }, dur: 1800 });
  S.s.objects.push({ id: "o1", title: "objek ElectricCar", ...O1, theme: "violet", attrs: [["make", "'nissan'"], ["model", "'leaf'"], ["year", "2024"], ["odometer_reading", "0"]] });
  S.s.vars.push({ id: "my_leaf", u: O1.u - 0.8, v: 2.6, to: "o1" });
  S.snap({ line: "sup", note: "Atribut dari Car terpasang di objek baru", flow: { path: ["c:Car.m:init", "o:o1"] }, marks: { "c:Car.m:init": "ok", "o:o1.a:make": "chg", "o:o1.a:model": "chg", "o:o1.a:year": "chg", "o:o1.a:odometer_reading": "chg" }, dur: 2000 });
  steps.push(S.take());

  // 4 — method warisan dicari ke atas
  S.snap({ line: "p1", note: "get_descriptive_name()? Tidak ada di ElectricCar…", tone: "alert", flow: { path: ["v:my_leaf", "o:o1", "c:ElectricCar"] }, marks: { "c:ElectricCar": "miss" }, dur: 1900 });
  S.s.out.push("2024 Nissan Leaf");
  S.snap({ line: "p1", note: "…lanjut dicari ke class induk: ketemu di Car", tone: "done", flow: { path: ["v:my_leaf", "o:o1", "c:ElectricCar", "c:Car.m:desc"] }, marks: { "c:ElectricCar": "miss", "c:Car.m:desc": "ok" }, dur: 2200 });
  steps.push(S.take());

  // 5 — atribut & method khusus anak
  S.s.code = "child";
  S.s.classes = [carClass(), ecClass("init", "sup", "bsize", "descb")];
  S.setAttr("o1", "battery_size", "40");
  S.snap({ line: "bsize", note: "Atribut baru yang hanya dimiliki mobil listrik", marks: { "c:ElectricCar.m:bsize": "new", "c:ElectricCar.m:descb": "new", "o:o1.a:battery_size": "chg" }, dur: 2000 });
  S.s.out.push("This car has a 40-kWh battery.");
  S.snap({ line: "p2", note: "describe_battery() langsung ketemu di ElectricCar", tone: "done", flow: { path: ["v:my_leaf", "o:o1", "c:ElectricCar.m:descb"] }, marks: { "c:ElectricCar.m:descb": "ok", "o:o1.a:battery_size": "hl" }, dur: 2000 });
  steps.push(S.take());

  // 6 — override
  S.s.code = "over";
  S.s.classes = [carClass(), ecClass("init", "sup", "bsize", "descb", "fill")];
  S.snap({ line: "fill", note: "Method dengan nama yang sama di class anak", marks: { "c:ElectricCar.m:fill": "new", "c:Car.m:fill": "over" }, dur: 1800 });
  S.s.out.push("This car doesn't have a gas tank!");
  S.snap({ line: "p3", note: "Pencarian berhenti di ElectricCar: milik Car diabaikan", tone: "done", flow: { path: ["v:my_leaf", "o:o1", "c:ElectricCar.m:fill"] }, marks: { "c:ElectricCar.m:fill": "ok", "c:Car.m:fill": "over" }, dur: 2200 });
  steps.push(S.take());

  // 7 — objek sebagai atribut (SOLUSI)
  S.s.code = "bat";
  S.s.out = [];
  S.s.classes = [carClass(), ecClass("init", "sup", "bat", "fill"), batClass()];
  S.obj("o1").attrs = [["make", "'nissan'"], ["model", "'leaf'"], ["year", "2024"], ["odometer_reading", "0"], ["battery", "<Battery>"]];
  S.snap({ line: "b_cls", note: "Bagian baterai dipindah ke class sendiri: Battery", marks: { "c:Battery": "new" }, dur: 2000 });
  S.s.objects.push({ id: "ob", title: "objek Battery", ...OB, theme: "teal", attrs: [["battery_size", "40"]] });
  S.s.links = [{ id: "bat", from: "o:o1.a:battery", to: "o:ob", label: "battery" }];
  S.snap({ line: "bat", note: "self.battery = Battery(): objek di dalam objek", flow: { path: ["c:ElectricCar.m:bat", "c:Battery.m:init", "o:ob"] }, marks: { "c:ElectricCar.m:bat": "hl", "o:o1.a:battery": "chg", "o:ob.a:battery_size": "chg" }, dur: 2400 });
  S.s.out.push("This car has a 40-kWh battery.");
  S.snap({ line: "p4", note: "my_leaf.battery.describe_battery()", flow: { path: ["v:my_leaf", "o:o1", "o:o1.a:battery", "o:ob", "c:Battery.m:descb"] }, marks: { "c:Battery.m:descb": "ok" }, dur: 2400 });
  S.s.out.push("This car can go about 150 miles on a full charge.");
  S.snap({ line: "p5", note: "get_range(): baterai 40 kWh  →  150 mil", tone: "done", flow: { path: ["v:my_leaf", "o:o1", "o:o1.a:battery", "o:ob", "c:Battery.m:range"] }, marks: { "c:Battery.m:range": "ok", "o:ob.a:battery_size": "hl" }, dur: 2400 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 8 — KASUS: mobil bensin tidak punya baterai
  S.s.code = "mus";
  S.s.out = [];
  S.s.links = [];
  S.s.classes = [carClass(), ecClass("init", "sup", "bsize", "descb", "fill")];
  S.s.objects = [
    { id: "o1", title: "objek ElectricCar", ...O1, theme: "violet", attrs: [["make", "'nissan'"], ["model", "'leaf'"], ["year", "2024"], ["odometer_reading", "0"], ["battery_size", "40"]] },
    { id: "o3", title: "objek Car", ...O3, theme: "sand", attrs: [["make", "'ford'"], ["model", "'mustang'"], ["year", "2024"], ["odometer_reading", "0"]] }
  ];
  S.s.vars = [{ id: "my_leaf", u: O1.u - 0.8, v: 2.6, to: "o1" }, { id: "my_mustang", u: O3.u - 0.6, v: 2.6, to: "o3" }];
  S.s.out.push("2024 Ford Mustang");
  S.snap({ line: "p6", note: "Car('ford', 'mustang', 2024): objek Car biasa", flow: { path: ["v:my_mustang", "o:o3", "c:Car.m:desc"] }, marks: { "c:Car.m:desc": "ok" }, dur: 2000 });
  S.s.out.push("!AttributeError: 'Car' object has no attribute 'describe_battery'");
  S.snap({ line: "p7", note: "Pencarian dimulai di Car dan tidak pernah turun ke anak", tone: "alert", flow: { path: ["v:my_mustang", "o:o3", "c:Car"], kind: "err" }, marks: { "c:Car": "miss", "o:o3": "err", "c:ElectricCar.m:descb": "ghost" }, dur: 2400 });
  steps.push(S.take());

  // 9 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  delete S.s.links;
  S.s.links = baseline.links;
  S.snap({ line: "e_cls", note: "Anak mewarisi induk, menambah, dan menimpa", tone: "done", marks: { "c:ElectricCar": "ok" }, dur: 900 });
  steps.push(S.take());

  const ML = (s) => s[s.length - 1].metrics;
  const m2 = ML(steps[1]), m6 = ML(steps[5]);

  Kelas.registerLesson({
    slug: "inheritance",
    renderer: "oop",
    title: "Inheritance: Mobil Listrik dari Class Car",
    subtitle: "Buat ElectricCar tanpa menyalin satu baris pun dari Car, lalu ikuti bagaimana Python mencari method: mulai dari class anak, naik ke class induk.",
    minutes: 16,
    level: "Menengah",
    lo: "LO 3",
    learn: [
      { text: "Membuat class anak: `class ElectricCar(Car):`", at: 1 },
      { text: "Memanggil `__init__()` induk dengan `super()`", at: 2 },
      { text: "Urutan pencarian method: anak dulu, lalu induk", at: 3 },
      { text: "Menambah atribut/method khusus dan meng-override method induk", at: 5 },
      { text: "Memakai objek sebagai atribut (Battery di dalam ElectricCar)", at: 6 }
    ],
    metrics: [
      { key: "classes", label: "Class", icon: "▣" },
      { key: "dup", label: "Baris duplikat", icon: "⧉" },
      { key: "inherited", label: "Method diwarisi", icon: "↑" },
      { key: "objs", label: "Objek", icon: "◆", total: true }
    ],
    legend: [
      { color: "#6366f1", label: "Class induk" },
      { color: "#d946ef", label: "Class anak" },
      { color: "#2dd4bf", label: "Battery" },
      { color: "#6366f1", round: true, label: "Jalur pencarian" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Salin-tempel", title: "Mobil listrik hasil salin-tempel",
        text: [
          "Kita butuh class untuk mobil listrik. Mobil listrik tetap mobil: punya merek, model, tahun, dan odometer. Cara paling cepat: salin seluruh isi `Car` ke class baru.",
          "Hasilnya **" + DUP_LINES + " baris kode yang sama** ditulis dua kali. Kalau suatu hari `update_odometer()` diperbaiki, kita harus ingat memperbaikinya di dua tempat."
        ],
        callout: { type: "IDE KUNCI", text: "Kalau class baru adalah versi khusus dari class yang sudah ada, gunakan **inheritance**, jangan menyalin. (Di diagram, `self` tidak ditulis agar ringkas; tanda tangan lengkapnya ada di panel kode.)" },
        changed: [["+", "Salinan class Car"], ["~", "Baris duplikat 0 → " + DUP_LINES]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Class anak", title: "class ElectricCar(Car)",
        text: [
          "Nama class induk ditulis di dalam kurung: `class ElectricCar(Car):`. `Car` disebut **parent class** (induk), `ElectricCar` disebut **child class** (anak).",
          "Tanpa menyalin apa pun, ElectricCar langsung memiliki **" + m2.inherited + " method** milik Car. Baris duplikat turun dari " + DUP_LINES + " menjadi 0."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Class induk harus didefinisikan lebih dulu, atau di-import, sebelum class anak di file yang sama." },
        changed: [["-", "Salinan class Car"], ["+", "class ElectricCar(Car)"], ["~", "Baris duplikat " + DUP_LINES + " → 0"], ["~", "Method diwarisi 0 → " + m2.inherited]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "super()", title: "super().__init__()",
        text: [
          "Saat `ElectricCar('nissan', 'leaf', 2024)` dibuat, `__init__()` milik anak berjalan. Isinya `super().__init__(make, model, year)`: panggil `__init__()` milik class induk.",
          "Car mengisi `make`, `model`, `year`, dan `odometer_reading = 0` ke objek baru. Kata *super* berasal dari *superclass*, sebutan lain untuk class induk."
        ],
        callout: { type: "IDE KUNCI", text: "Tanpa `super().__init__()`, atribut milik Car tidak pernah dibuat di objek ElectricCar." },
        changed: [["+", "Objek ElectricCar: my_leaf"], ["+", "4 atribut dari Car"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Pencarian", title: "Method dicari dari anak ke induk",
        text: [
          "`my_leaf.get_descriptive_name()`: Python mencari method itu di class objeknya, ElectricCar. Tidak ada.",
          "Pencarian naik ke class induk, Car, dan ketemu. Hasilnya `2024 Nissan Leaf`. Itulah arti \"mewarisi\": anak boleh memakai method induk seolah miliknya sendiri."
        ],
        callout: { type: "IDE KUNCI", text: "Urutan pencarian: objek → class anak → class induk. Yang pertama ketemu, itu yang dijalankan." },
        changed: [["+", "Output: 2024 Nissan Leaf"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Khusus anak", title: "Atribut & method khusus anak",
        text: [
          "Class anak boleh punya tambahan sendiri. `self.battery_size = 40` ditulis **setelah** `super().__init__()`, dan method baru `describe_battery()` mencetak ukuran baterainya.",
          "Kali ini pencarian berhenti di ElectricCar, karena `describe_battery()` memang ada di sana."
        ],
        changed: [["+", "Atribut battery_size = 40"], ["+", "Method describe_battery()"], ["+", "Output: This car has a 40-kWh battery."]],
        frames: steps[4]
      },
      {
        kind: "TEKNIK", short: "Override", title: "Override: menimpa method induk",
        text: [
          "Car punya `fill_gas_tank()`, tetapi mobil listrik tidak punya tangki bensin. Kita menulis method dengan **nama yang sama** di ElectricCar.",
          "Pencarian menemukan versi anak lebih dulu, jadi versi milik Car diabaikan: `This car doesn't have a gas tank!`. Method yang diwarisi tinggal " + m6.inherited + "."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Override hanya berlaku untuk objek ElectricCar. Objek Car biasa tetap memakai `fill_gas_tank()` milik Car." },
        changed: [["+", "fill_gas_tank() versi ElectricCar"], ["~", "Method diwarisi " + m2.inherited + " → " + m6.inherited]],
        frames: steps[5]
      },
      {
        kind: "SOLUSI", short: "Objek di objek", title: "Objek sebagai atribut",
        text: [
          "Class yang terus bertambah bisa dipecah. Urusan baterai dipindah ke class `Battery`, dan ElectricCar cukup menyimpan satu objeknya: `self.battery = Battery()`.",
          "Panggilan `my_leaf.battery.describe_battery()` berjalan dua titik: ke objek mobil, ke atribut `battery`, lalu ke objek Battery. Baterai 40 kWh memberi jangkauan **150 mil**."
        ],
        callout: { type: "IDE KUNCI", text: "Inheritance berarti \"adalah\" (mobil listrik **adalah** mobil). Objek sebagai atribut berarti \"punya\" (mobil listrik **punya** baterai)." },
        changed: [["+", "class Battery"], ["+", "Objek Battery di dalam my_leaf"], ["~", "battery_size pindah ke Battery"]],
        frames: steps[6]
      },
      {
        kind: "KASUS", short: "Mobil bensin", title: "Kasus: mobil bensin tanpa baterai",
        text: [
          "`my_mustang = Car('ford', 'mustang', 2024)` adalah objek Car biasa. `get_descriptive_name()` berjalan normal: `2024 Ford Mustang`.",
          "Tetapi `my_mustang.describe_battery()` gagal dengan `AttributeError`. Pencarian dimulai di Car dan hanya bisa **naik** ke induk, tidak pernah turun ke class anak."
        ],
        callout: { type: "IDE KUNCI", text: "Inheritance berjalan satu arah: anak mewarisi induk, induk tidak tahu apa-apa tentang anaknya." },
        changed: [["+", "Objek Car: my_mustang"], ["+", "AttributeError"]],
        frames: steps[7]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Mewarisi, menambah, menimpa",
        text: ["ElectricCar mendapat " + m2.inherited + " method dari Car tanpa satu baris duplikat, menambah miliknya sendiri, menimpa yang tidak cocok, dan menyimpan objek Battery sebagai atribut."],
        bullets: [
          "`class Anak(Induk):` membuat class anak.",
          "`super().__init__(...)` menjalankan `__init__()` milik induk.",
          "Method dicari dari class objek, lalu naik ke induk.",
          "Method dengan nama sama di anak meng-override milik induk.",
          "Objek bisa disimpan sebagai atribut objek lain."
        ],
        quiz: [
          { q: "Apa fungsi `super().__init__(make, model, year)` di ElectricCar?", options: ["Membuat class Car baru", "Menjalankan __init__ milik Car untuk objek ini", "Menghapus atribut Car", "Memanggil describe_battery()"], answer: 1, why: "`super()` merujuk ke class induk, sehingga atribut milik Car dibuat di objek ElectricCar." },
          { q: "`my_leaf.read_odometer()`: di class mana method itu ditemukan?", options: ["ElectricCar", "Car", "Battery", "Tidak ditemukan"], answer: 1, why: "ElectricCar tidak mendefinisikan read_odometer(), jadi pencarian naik ke Car." },
          { q: "Objek Car biasa memanggil `fill_gas_tank()`. Versi mana yang berjalan?", options: ["Versi ElectricCar", "Versi Car", "Keduanya", "Error"], answer: 1, why: "Override di ElectricCar hanya berlaku untuk objek ElectricCar. Objek Car tetap memakai versi Car." }
        ],
        changed: [],
        frames: steps[8]
      }
    ],
    next: "**Enkapsulasi**: melindungi atribut seperti odometer agar hanya bisa diubah lewat method."
  });
})();
