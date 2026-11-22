/* Pelajaran: Mengubah Atribut Objek (Modul 07 · Teori 9 · Lab 9 · LO 3)
 * Contoh kode mengikuti slide "Classes" bagian Working with Classes and Instances: class Car.
 * Semua output konsol sudah dicocokkan dengan menjalankan programnya di Python 3.13.
 */
(function () {
  const CAR = { u: -3.7, v: 0 };
  const O1 = { u: 0.3, v: 0 }, O2 = { u: 3.1, v: 0 };
  const M = {
    init: { id: "init", label: "__init__(self, make, model, year)", kind: "method" },
    basic: { id: "basic", label: "self.make · self.model · self.year", kind: "attr" },
    odo: { id: "odo", label: "self.odometer_reading = 0", kind: "attr" },
    desc: { id: "desc", label: "get_descriptive_name(self)", kind: "method" },
    read: { id: "read", label: "read_odometer(self)", kind: "method" },
    upd: { id: "upd", label: "update_odometer(self, mileage)", kind: "method" },
    inc: { id: "inc", label: "increment_odometer(self, miles)", kind: "method" }
  };
  const carClass = (...ids) => ({ id: "Car", ...CAR, theme: "blue", members: ids.map((k) => M[k]) });

  const HEAD = [
    ["cls", "class Car:"],
    ["", "    \"\"\"A simple attempt to represent a car.\"\"\""],
    ["", ""],
    ["init", "    def __init__(self, make, model, year):"],
    ["", "        \"\"\"Initialize attributes to describe a car.\"\"\""],
    ["", "        self.make = make"],
    ["", "        self.model = model"],
    ["", "        self.year = year"]
  ];
  const CODE = {
    v1: [
      ...HEAD,
      ["", ""],
      ["desc", "    def get_descriptive_name(self):"],
      ["", "        \"\"\"Return a neatly formatted descriptive name.\"\"\""],
      ["", "        long_name = f\"{self.year} {self.make} {self.model}\""],
      ["ret", "        return long_name.title()"],
      ["", ""],
      ["mk", "my_new_car = Car('audi', 'a4', 2024)"],
      ["p1", "print(my_new_car.get_descriptive_name())"],
      ["p2", "print(my_new_car.odometer_reading)"]
    ],
    v2: [
      ...HEAD,
      ["+odo", "        self.odometer_reading = 0"],
      ["", ""],
      ["desc", "    def get_descriptive_name(self):"],
      ["", "        --snip--"],
      ["", ""],
      ["+read", "    def read_odometer(self):"],
      ["+", "        \"\"\"Print a statement showing the car's mileage.\"\"\""],
      ["+readp", "        print(f\"This car has {self.odometer_reading} miles on it.\")"],
      ["", ""],
      ["mk", "my_new_car = Car('audi', 'a4', 2024)"],
      ["rd1", "my_new_car.read_odometer()"],
      ["", ""],
      ["dir", "my_new_car.odometer_reading = 23"],
      ["rd2", "my_new_car.read_odometer()"]
    ],
    v3: [
      ["cls", "class Car:"],
      ["", "    --snip--"],
      ["", ""],
      ["+upd", "    def update_odometer(self, mileage):"],
      ["+", "        \"\"\"Set the odometer reading to the given value.\"\"\""],
      ["+set", "        self.odometer_reading = mileage"],
      ["", ""],
      ["mk", "my_new_car = Car('audi', 'a4', 2024)"],
      ["u1", "my_new_car.update_odometer(23)"],
      ["rd1", "my_new_car.read_odometer()"]
    ],
    v4: [
      ["cls", "class Car:"],
      ["", "    --snip--"],
      ["", ""],
      ["upd", "    def update_odometer(self, mileage):"],
      ["+chk", "        if mileage >= self.odometer_reading:"],
      ["set", "            self.odometer_reading = mileage"],
      ["+els", "        else:"],
      ["+no", "            print(\"You can't roll back an odometer!\")"],
      ["", ""],
      ["", "my_new_car.update_odometer(23)"],
      ["u2", "my_new_car.update_odometer(10)"],
      ["rd1", "my_new_car.read_odometer()"]
    ],
    v5: [
      ["cls", "class Car:"],
      ["", "    --snip--"],
      ["", ""],
      ["upd", "    def update_odometer(self, mileage):"],
      ["", "        --snip--"],
      ["", ""],
      ["+inc", "    def increment_odometer(self, miles):"],
      ["+", "        \"\"\"Add the given amount to the odometer reading.\"\"\""],
      ["+add", "        self.odometer_reading += miles"],
      ["", ""],
      ["mk2", "my_used_car = Car('subaru', 'outback', 2019)"],
      ["p3", "print(my_used_car.get_descriptive_name())"],
      ["", ""],
      ["u3", "my_used_car.update_odometer(23_500)"],
      ["rd3", "my_used_car.read_odometer()"],
      ["", ""],
      ["i1", "my_used_car.increment_odometer(100)"],
      ["rd4", "my_used_car.read_odometer()"]
    ],
    v6: [
      ["cls", "class Car:"],
      ["", "    --snip--"],
      ["", ""],
      ["mk2", "my_used_car = Car('subaru', 'outback', 2019)"],
      ["", "my_used_car.update_odometer(23_500)"],
      ["", "my_used_car.increment_odometer(100)"],
      ["", ""],
      ["bad", "my_used_car.odometer_reading = 100   # langsung, tanpa method"],
      ["rd5", "my_used_car.read_odometer()"]
    ]
  };

  const metricsOf = (f) => ({ changes: f.changes || 0, rejected: f.rejected || 0, invalid: f.invalid || 0, odo: f.odo });
  const S = OOPStory({
    classes: [carClass("init", "basic", "desc")], objects: [], vars: [], out: [], code: "v1",
    changes: 0, rejected: 0, invalid: 0
  }, metricsOf);
  const newCar = (id, pos, make, model, year, odo) => ({
    id, title: "objek Car", ...pos, theme: id === "o1" ? "sand" : "teal",
    attrs: [["make", `'${make}'`], ["model", `'${model}'`], ["year", String(year)]].concat(odo == null ? [] : [["odometer_reading", String(odo)]])
  });
  const steps = [];

  // 1 — MASALAH: mobil tanpa odometer
  S.s.objects.push(newCar("o1", O1, "audi", "a4", 2024));
  S.s.vars.push({ id: "my_new_car", u: O1.u - 0.8, v: 2.4, to: "o1" });
  S.snap({ line: "mk", note: "Car('audi', 'a4', 2024): 3 atribut", dur: 1800 });
  S.s.out.push("2024 Audi A4");
  S.snap({ line: "ret", note: "get_descriptive_name() mengembalikan teks", flow: { path: ["v:my_new_car", "o:o1", "c:Car.m:desc"] }, marks: { "c:Car.m:desc": "ok" }, dur: 1700 });
  S.s.out.push("!AttributeError: 'Car' object has no attribute 'odometer_reading'");
  S.snap({ line: "p2", note: "Berapa jarak tempuhnya? Atributnya tidak ada", tone: "alert", flow: { path: ["v:my_new_car", "o:o1"], kind: "err" }, marks: { "o:o1": "err" }, dur: 1700 });
  steps.push(S.take());

  // 2 — nilai default di __init__
  S.s.code = "v2";
  S.s.out = [];
  S.s.classes = [carClass("init", "basic", "odo", "desc", "read")];
  S.s.objects = [newCar("o1", O1, "audi", "a4", 2024, 0)];
  S.s.odo = 0;
  S.snap({ line: "odo", note: "self.odometer_reading = 0: nilai default, bukan parameter", marks: { "c:Car.m:odo": "new", "o:o1.a:odometer_reading": "chg" }, dur: 2000 });
  S.s.out.push("This car has 0 miles on it.");
  S.snap({ line: "rd1", note: "read_odometer()  →  0 mil", flow: { path: ["v:my_new_car", "o:o1", "c:Car.m:read"] }, marks: { "c:Car.m:read": "ok", "o:o1.a:odometer_reading": "hl" }, dur: 1600 });
  steps.push(S.take());

  // 3 — cara 1: ubah langsung
  S.setAttr("o1", "odometer_reading", "23");
  S.s.changes = 1; S.s.odo = 23;
  S.snap({ line: "dir", note: "Cara 1: ubah langsung lewat objek", flow: { path: ["v:my_new_car", "o:o1", "o:o1.a:odometer_reading"] }, marks: { "o:o1.a:odometer_reading": "chg" }, dur: 1800 });
  S.s.out.push("This car has 23 miles on it.");
  S.snap({ line: "rd2", note: "read_odometer()  →  23 mil", flow: { path: ["v:my_new_car", "o:o1", "c:Car.m:read"] }, marks: { "c:Car.m:read": "ok" }, dur: 1500 });
  steps.push(S.take());

  // 4 — cara 2: lewat method
  S.s.code = "v3";
  S.s.out = [];
  S.s.classes = [carClass("init", "basic", "odo", "desc", "read", "upd")];
  S.s.objects = [newCar("o1", O1, "audi", "a4", 2024, 0)];
  S.s.odo = 0;
  S.snap({ line: "upd", note: "Method baru: update_odometer(mileage)", marks: { "c:Car.m:upd": "new" }, dur: 1600 });
  S.setAttr("o1", "odometer_reading", "23");
  S.s.changes = 2; S.s.odo = 23;
  S.snap({ line: "set", note: "Cara 2: method yang mengubah atributnya", flow: { path: ["v:my_new_car", "o:o1", "c:Car.m:upd", "o:o1.a:odometer_reading"] }, marks: { "c:Car.m:upd": "hl", "o:o1.a:odometer_reading": "chg" }, dur: 2100 });
  S.s.out.push("This car has 23 miles on it.");
  S.snap({ line: "rd1", note: "Hasilnya sama: 23 mil", marks: { "c:Car.m:read": "ok" }, dur: 1300 });
  steps.push(S.take());

  // 5 — method bisa menolak nilai yang salah
  S.s.code = "v4";
  S.snap({ line: "chk", note: "update_odometer(10): cek dulu 10 ≥ 23?", flow: { path: ["v:my_new_car", "o:o1", "c:Car.m:upd", "o:o1.a:odometer_reading"] }, marks: { "c:Car.m:upd": "hl", "o:o1.a:odometer_reading": "hl" }, dur: 1900 });
  S.s.rejected = 1;
  S.s.out.push("You can't roll back an odometer!");
  S.snap({ line: "no", note: "Ditolak: odometer tidak boleh mundur", tone: "alert", marks: { "c:Car.m:upd": "err", "o:o1.a:odometer_reading": "ok" }, dur: 1800 });
  S.s.out.push("This car has 23 miles on it.");
  S.snap({ line: "rd1", note: "Odometer tetap 23 mil", tone: "done", marks: { "o:o1.a:odometer_reading": "ok" }, dur: 1300 });
  steps.push(S.take());

  // 6 — cara 3: menambah lewat method (SOLUSI)
  S.s.code = "v5";
  S.s.out = [];
  S.s.classes = [carClass("init", "basic", "odo", "desc", "read", "upd", "inc")];
  S.s.objects.push(newCar("o2", O2, "subaru", "outback", 2019, 0));
  S.s.vars.push({ id: "my_used_car", u: O2.u - 0.8, v: 2.4, to: "o2" });
  S.s.odo = 0;
  S.snap({ line: "mk2", note: "Mobil bekas: Car('subaru', 'outback', 2019)", marks: { "c:Car.m:inc": "new" }, dur: 1700 });
  S.s.out.push("2019 Subaru Outback");
  S.setAttr("o2", "odometer_reading", "23500");
  S.s.changes = 3; S.s.odo = 23500;
  S.s.out.push("This car has 23500 miles on it.");
  S.snap({ line: "u3", note: "update_odometer(23_500)", flow: { path: ["v:my_used_car", "o:o2", "c:Car.m:upd", "o:o2.a:odometer_reading"] }, marks: { "c:Car.m:upd": "hl", "o:o2.a:odometer_reading": "chg" }, dur: 2000 });
  S.setAttr("o2", "odometer_reading", "23600");
  S.s.changes = 4; S.s.odo = 23600;
  S.s.out.push("This car has 23600 miles on it.");
  S.snap({ line: "add", note: "Cara 3: increment_odometer(100)  →  23500 + 100", tone: "done", flow: { path: ["v:my_used_car", "o:o2", "c:Car.m:inc", "o:o2.a:odometer_reading"] }, marks: { "c:Car.m:inc": "ok", "o:o2.a:odometer_reading": "chg" }, dur: 2000 });
  steps.push(S.take());
  const baseline = JSON.parse(JSON.stringify(S.s));

  // 7 — KASUS: memutar balik odometer secara langsung
  S.s.code = "v6";
  S.setAttr("o2", "odometer_reading", "100");
  S.s.changes = 5; S.s.invalid = 1; S.s.odo = 100;
  S.snap({ line: "bad", note: "Ubah langsung: validasi di method terlewati", tone: "alert", flow: { path: ["v:my_used_car", "o:o2", "o:o2.a:odometer_reading"], kind: "err" }, marks: { "o:o2.a:odometer_reading": "err", "c:Car.m:upd": "ghost" }, dur: 2000 });
  S.s.out.push("This car has 100 miles on it.");
  S.snap({ line: "rd5", note: "23.600 mil menjadi 100 mil: data rusak", tone: "alert", marks: { "o:o2.a:odometer_reading": "err" }, dur: 1600 });
  steps.push(S.take());

  // 8 — RANGKUMAN
  Object.assign(S.s, JSON.parse(JSON.stringify(baseline)));
  S.snap({ line: "inc", note: "3 cara mengubah atribut: langsung, set lewat method, tambah lewat method", tone: "done", marks: { "c:Car.m:upd": "ok", "c:Car.m:inc": "ok" }, dur: 900 });
  steps.push(S.take());

  Kelas.registerLesson({
    slug: "atribut-objek",
    renderer: "oop",
    title: "Mengubah Atribut Objek: Odometer Mobil",
    subtitle: "Beri setiap mobil odometer, lalu coba tiga cara mengubahnya, dan temukan kenapa method lebih aman daripada mengubah atribut secara langsung.",
    minutes: 14,
    level: "Pemula",
    lo: "LO 3",
    learn: [
      { text: "Memberi atribut nilai default di `__init__()`", at: 1 },
      { text: "Cara 1: mengubah atribut langsung lewat objek", at: 2 },
      { text: "Cara 2: mengubah atribut lewat method", at: 3 },
      { text: "Method bisa memvalidasi nilai sebelum menyimpannya", at: 4 },
      { text: "Cara 3: menambah nilai atribut lewat method", at: 5 }
    ],
    metrics: [
      { key: "changes", label: "Perubahan atribut", icon: "✎" },
      { key: "rejected", label: "Ditolak method", icon: "⊘" },
      { key: "invalid", label: "Data tidak valid", icon: "!" },
      { key: "odo", label: "Odometer", unit: "mil", icon: "◷", total: true }
    ],
    legend: [
      { color: "#6366f1", label: "Class Car" },
      { color: "#fde68a", label: "Objek" },
      { color: "#f59e0b", label: "Atribut berubah" },
      { color: "#e11d48", label: "Ditolak / tidak valid" }
    ],
    code: CODE,
    initial: steps[0][0],
    steps: [
      {
        kind: "MASALAH", short: "Tanpa odometer", title: "Mobil tanpa odometer",
        text: [
          "Class `Car` menyimpan merek, model, dan tahun. `get_descriptive_name()` merangkainya menjadi teks lalu **mengembalikannya** dengan `return`, sehingga `print()` mencetak `2024 Audi A4`.",
          "Diler ingin tahu jarak tempuh mobil itu. Tetapi objeknya tidak punya atribut `odometer_reading`, jadi Python berhenti dengan `AttributeError`."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "`AttributeError` berarti kita meminta atribut yang tidak pernah dibuat di objek itu. Periksa `__init__()`." },
        changed: [["+", "Objek Car dengan 3 atribut"], ["+", "AttributeError"]],
        frames: steps[0]
      },
      {
        kind: "TEKNIK", short: "Nilai default", title: "Nilai default di __init__()",
        text: [
          "Tambahkan `self.odometer_reading = 0` di `__init__()`. Atribut ini **tidak** diambil dari parameter; setiap mobil baru otomatis mulai dari 0.",
          "Method `read_odometer()` membaca atribut itu dan mencetak `This car has 0 miles on it.`"
        ],
        callout: { type: "IDE KUNCI", text: "Atribut tidak harus berasal dari parameter. Atribut yang selalu punya nilai awal yang sama cukup diberi nilai default di `__init__()`." },
        changed: [["+", "Atribut odometer_reading = 0"], ["+", "Method read_odometer()"], ["~", "Odometer — → 0"]],
        frames: steps[1]
      },
      {
        kind: "TEKNIK", short: "Langsung", title: "Cara 1: ubah langsung",
        text: [
          "Cara paling sederhana: akses atribut lewat objek lalu beri nilai baru, `my_new_car.odometer_reading = 23`.",
          "Jalurnya pendek: dari variabel, ke objek, langsung ke atributnya. Class sama sekali tidak dilewati."
        ],
        changed: [["~", "odometer_reading 0 → 23"], ["~", "Perubahan atribut 0 → 1"]],
        frames: steps[2]
      },
      {
        kind: "TEKNIK", short: "Lewat method", title: "Cara 2: ubah lewat method",
        text: [
          "Daripada mengubah atributnya sendiri, kita mengirim nilai baru ke method: `my_new_car.update_odometer(23)`. Method itulah yang menulis `self.odometer_reading = mileage`.",
          "Perhatikan jalurnya: kini melewati method di class sebelum sampai ke atribut. Di situlah kita bisa menambahkan aturan."
        ],
        callout: { type: "IDE KUNCI", text: "Kode di luar class cukup tahu nama method-nya. Cara atribut itu disimpan dan diperiksa menjadi urusan class." },
        changed: [["+", "Method update_odometer(mileage)"], ["~", "Perubahan atribut 1 → 2"]],
        frames: steps[3]
      },
      {
        kind: "TEKNIK", short: "Validasi", title: "Method bisa menolak",
        text: [
          "Odometer tidak boleh mundur. Kita tambahkan pemeriksaan di `update_odometer()`: nilai baru hanya disimpan jika `mileage >= self.odometer_reading`.",
          "`update_odometer(10)` ditolak dengan pesan `You can't roll back an odometer!`, dan odometer tetap **23 mil**."
        ],
        callout: { type: "PERLU DIKETAHUI", text: "Pemeriksaan ini mengikuti versi lengkap `update_odometer()` di buku Python Crash Course (Bab 9)." },
        changed: [["+", "if mileage >= self.odometer_reading"], ["~", "Ditolak method 0 → 1"], ["~", "odometer_reading tetap 23"]],
        frames: steps[4]
      },
      {
        kind: "SOLUSI", short: "Menambah", title: "Cara 3: menambah lewat method",
        text: [
          "Untuk mobil bekas, kita sering ingin **menambah** jarak, bukan mengganti. `increment_odometer(miles)` menjalankan `self.odometer_reading += miles`.",
          "Subaru dicatat 23.500 mil, lalu bertambah 100 mil menjadi **23.600 mil**. Total ada 4 perubahan atribut, dan tidak ada data yang rusak."
        ],
        callout: { type: "IDE KUNCI", text: "Tiga cara mengubah atribut: langsung lewat objek, set lewat method, dan tambah lewat method." },
        changed: [["+", "Method increment_odometer(miles)"], ["+", "Objek kedua: my_used_car"], ["~", "Odometer 23.500 → 23.600"]],
        frames: steps[5]
      },
      {
        kind: "KASUS", short: "Diputar balik", title: "Kasus: memutar balik odometer",
        text: [
          "Seseorang menulis `my_used_car.odometer_reading = 100` secara langsung. Jalurnya tidak melewati `update_odometer()`, jadi pemeriksaannya tidak pernah dijalankan.",
          "Odometer langsung turun dari 23.600 menjadi **100 mil**. Programnya tidak error, tetapi datanya kini salah."
        ],
        callout: { type: "IDE KUNCI", text: "Validasi hanya melindungi data jika perubahan dilakukan lewat method. Inilah alasan enkapsulasi, yang dibahas di pelajaran berikutnya." },
        changed: [["~", "Odometer 23.600 → 100"], ["~", "Data tidak valid 0 → 1"]],
        frames: steps[6]
      },
      {
        kind: "RANGKUMAN", short: "Rangkuman", title: "Tiga cara, satu yang paling aman",
        text: ["Lewat method, 4 perubahan berjalan aman dan 1 percobaan yang salah ditolak. Sebaliknya, satu perubahan langsung sudah cukup untuk merusak data."],
        bullets: [
          "Nilai default diberikan di `__init__()` tanpa parameter.",
          "Cara 1: `objek.atribut = nilai` (sederhana, tanpa pemeriksaan).",
          "Cara 2: method yang mengganti nilai, misalnya `update_odometer()`.",
          "Cara 3: method yang menambah nilai, misalnya `increment_odometer()`.",
          "Method bisa memvalidasi data sebelum menyimpannya."
        ],
        quiz: [
          { q: "Objek dibuat dengan `Car('audi', 'a4', 2024)`. Berapa nilai `odometer_reading`-nya?", options: ["None", "0", "2024", "Error"], answer: 1, why: "`__init__()` memberi nilai default `self.odometer_reading = 0`." },
          { q: "Odometer 23.600. Apa yang terjadi setelah `update_odometer(500)`?", options: ["Menjadi 500", "Menjadi 24.100", "Ditolak, tetap 23.600", "Error"], answer: 2, why: "500 < 23.600, jadi method mencetak \"You can't roll back an odometer!\" dan tidak mengubah apa pun." },
          { q: "Cara mana yang melewati pemeriksaan di `update_odometer()`?", options: ["`update_odometer(30_000)`", "`increment_odometer(10)`", "`odometer_reading = 10`", "`read_odometer()`"], answer: 2, why: "Mengubah atribut secara langsung tidak memanggil method apa pun, jadi pemeriksaannya tidak berjalan." }
        ],
        changed: [],
        frames: steps[7]
      }
    ],
    next: "**Inheritance**: membuat `ElectricCar` dari `Car` tanpa menyalin kode, lalu menambahkan baterai."
  });
})();
