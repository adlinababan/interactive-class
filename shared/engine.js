/* Kelas Interaktif — mesin kursus & pemutar pelajaran.
 * Isi pelajaran ada di file data (lessons/*.js); tampilan panggung diserahkan ke "renderer".
 * Lihat PANDUAN.md untuk format data pelajaran.
 */
(function () {
  "use strict";

  const lessons = {};
  const renderers = {};
  const loading = {};
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- utilitas ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Markup ringan: `kode` dan **tebal**
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const fmt = (n) => (typeof n === "number" ? Math.round(n).toLocaleString("id-ID") : n);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  };

  // ---------- registri ----------
  const Kelas = (window.Kelas = {
    registerLesson(lesson) {
      lessons[lesson.slug] = lesson;
      (loading[lesson.slug] || []).forEach((cb) => cb(lesson));
      delete loading[lesson.slug];
    },
    registerRenderer(name, r) { renderers[name] = r; },
    start(course) { new App(course); },
    util: { h, esc, rich, fmt }
  });

  function loadLesson(slug) {
    return new Promise((resolve, reject) => {
      if (lessons[slug]) return resolve(lessons[slug]);
      if (loading[slug]) return loading[slug].push(resolve);
      loading[slug] = [resolve];
      const s = document.createElement("script");
      s.src = "lessons/" + slug + ".js";
      s.onerror = () => { delete loading[slug]; reject(new Error("Gagal memuat pelajaran " + slug)); };
      document.head.append(s);
    });
  }

  // ---------- aplikasi kursus ----------
  function App(course) {
    this.course = course;
    this.flat = [];
    course.modules.forEach((m) => m.lessons.forEach((l, i) => this.flat.push({ ...l, module: m, index: i })));
    this.progressKey = "kelas:" + course.slug + ":selesai";
    this.done = store.get(this.progressKey, {});
    this.root = document.getElementById("app");
    this.player = null;
    this.buildShell();
    window.addEventListener("hashchange", () => this.route());
    this.route();
  }

  App.prototype.buildShell = function () {
    const c = this.course;
    this.side = h("nav", { class: "sidebar", "aria-label": "Daftar pelajaran" });
    this.main = h("main", { class: "main", id: "main", tabindex: "-1" });
    const top = h("div", { class: "topbar" },
      h("button", { class: "icon-btn", "aria-label": "Buka daftar pelajaran", onclick: () => this.root.classList.add("menu-open") }, "☰"),
      h("strong", null, c.titleId));
    const scrim = h("div", { class: "scrim", onclick: () => this.root.classList.remove("menu-open") });
    this.root.className = "app";
    this.root.append(this.side, h("div", null, top, this.main), scrim);
    this.renderSide();
  };

  App.prototype.renderSide = function (activeSlug) {
    const c = this.course;
    const openMod = activeSlug ? (this.flat.find((l) => l.slug === activeSlug) || {}).module : null;
    const total = this.flat.length;
    const doneCount = this.flat.filter((l) => this.done[l.slug]).length;
    this.side.innerHTML = "";
    this.side.append(
      h("a", { class: "brand", href: "#/" },
        h("span", { class: "brand-mark" }, "AP"),
        h("span", null, h("b", null, c.titleId), h("small", null, c.code + " · " + c.program))),
      h("a", { class: "side-link" + (activeSlug ? "" : " active"), href: "#/" }, "Ikhtisar kursus"),
      h("div", { class: "side-head" }, h("span", null, "Modul"), h("span", null, total + " pelajaran"))
    );
    c.modules.forEach((m) => {
      const dn = m.lessons.filter((l) => this.done[l.slug]).length;
      const wrap = h("div", { class: "mod" + (m === openMod ? " open" : "") });
      const btn = h("button", { class: "mod-btn", "aria-expanded": String(m === openMod), onclick: () => {
        wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(wrap.classList.contains("open")));
      } }, h("span", { class: "chev" }, "▶"), h("span", { class: "num" }, m.id + "."), m.title, h("span", { class: "count" }, dn + "/" + m.lessons.length));
      const ul = h("ul");
      m.lessons.forEach((l) => {
        const dot = h("i", { class: "dot" + (this.done[l.slug] ? " done" : "") });
        ul.append(h("li", null, l.ready
          ? h("a", { href: "#/" + l.slug, class: l.slug === activeSlug ? "active" : null, "aria-current": l.slug === activeSlug ? "page" : null }, dot, l.title)
          : h("span", { title: "Segera hadir" }, dot, l.title, h("em", { class: "soon" }, "segera"))));
      });
      wrap.append(btn, ul);
      this.side.append(wrap);
    });
    this.side.append(h("div", { class: "progress-box" },
      "Progres: " + doneCount + " dari " + total + " pelajaran",
      h("div", { class: "bar" }, h("i", { style: "width:" + (100 * doneCount / total) + "%" }))));
  };

  App.prototype.route = function () {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    this.root.classList.remove("menu-open");
    const slug = parts[0];
    const step = Math.max(1, parseInt(parts[1], 10) || 1) - 1;
    if (!slug) return this.showOverview();
    const meta = this.flat.find((l) => l.slug === slug);
    if (!meta) return this.showOverview();
    if (this.player && this.player.lesson.slug === slug) { this.player.go(step); return; }
    if (!meta.ready) return this.showSoon(meta);
    this.main.innerHTML = "";
    this.main.append(h("p", { class: "crumb" }, "Memuat pelajaran…"));
    loadLesson(slug).then((lesson) => {
      if (this.player) this.player.destroy();
      this.renderSide(slug);
      this.player = new Player(this, lesson, meta, step);
      window.scrollTo(0, 0);
    }).catch((e) => { this.main.innerHTML = ""; this.main.append(h("p", null, e.message)); });
  };

  App.prototype.leave = function () {
    if (this.player) { this.player.destroy(); this.player = null; }
  };

  App.prototype.showOverview = function () {
    this.leave();
    const c = this.course;
    this.renderSide();
    this.main.innerHTML = "";
    const firstReady = this.flat.find((l) => l.ready);
    const ov = h("div", { class: "overview" },
      h("div", { class: "eyebrow" }, c.code + " · " + c.program),
      h("h1", null, c.titleId),
      h("p", { class: "lead" }, c.description),
      firstReady ? h("p", null, h("a", { class: "btn primary", href: "#/" + firstReady.slug }, "Mulai: " + firstReady.title + " →")) : null,
      h("h2", { class: "eyebrow", style: "margin-top:26px" }, "Capaian pembelajaran"),
      h("div", { class: "lo-grid" }, c.outcomes.map((o) => h("div", { class: "lo" }, h("b", null, o.id), o.text))),
      h("h2", { class: "eyebrow" }, "Modul"),
      h("div", { class: "mod-grid" }, c.modules.map((m) => h("section", { class: "mod-card" },
        h("h3", null, m.id + ". " + m.title),
        h("div", { class: "meta" }, m.lo.join(", ") + " · " + m.lessons.length + " pelajaran"),
        h("ol", null, m.lessons.map((l) => h("li", null,
          l.ready ? h("a", { href: "#/" + l.slug }, l.title) : h("span", { class: "t" }, l.title), " ",
          h("span", { class: "pill" + (l.ready ? " ready" : "") }, l.ready ? (this.done[l.slug] ? "selesai ✓" : "tersedia") : "segera"),
          h("small", null, l.goal + " · " + l.sessions))))))),
      h("p", { style: "margin-top:28px;font-size:13px;color:var(--muted)" }, "Buku acuan: " + c.textbook)
    );
    this.main.append(ov);
    document.title = c.titleId + " · Kelas Interaktif";
  };

  App.prototype.showSoon = function (meta) {
    this.leave();
    this.renderSide(meta.slug);
    this.main.innerHTML = "";
    this.main.append(h("div", { class: "empty" },
      h("div", { class: "eyebrow" }, meta.module.id + ". " + meta.module.title),
      h("h1", null, meta.title),
      h("p", null, meta.goal),
      h("p", null, h("span", { class: "pill" }, "Segera hadir"), " ", meta.sessions),
      h("p", null, h("a", { href: "#/" }, "← Kembali ke ikhtisar"))));
  };

  App.prototype.markDone = function (slug) {
    if (this.done[slug]) return;
    this.done[slug] = true;
    store.set(this.progressKey, this.done);
    this.renderSide(slug);
  };

  App.prototype.nextOf = function (slug) {
    const i = this.flat.findIndex((l) => l.slug === slug);
    return i >= 0 ? this.flat[i + 1] : null;
  };

  // ---------- pemutar pelajaran ----------
  function Player(app, lesson, meta, startStep) {
    this.app = app;
    this.lesson = lesson;
    this.meta = meta;
    this.k = -1;
    this.fi = 0;
    this.timer = null;
    this.paused = false;
    this.shown = {};
    this.renderer = renderers[lesson.renderer];
    if (!this.renderer) throw new Error("Renderer tidak ditemukan: " + lesson.renderer);
    this.build();
    this.onKey = this.onKey.bind(this);
    document.addEventListener("keydown", this.onKey);
    this.go(Math.min(startStep, lesson.steps.length - 1));
  }

  Player.prototype.build = function () {
    const L = this.lesson, m = this.meta.module;
    const main = this.app.main;
    main.innerHTML = "";
    document.title = L.title + " · " + this.app.course.titleId;

    this.metricEls = {};
    const metrics = h("div", { class: "metrics", style: "--cols:" + L.metrics.length, role: "group", "aria-label": "Metrik" },
      L.metrics.map((mt) => {
        const b = h("b", null, "—");
        const box = h("div", { class: "metric" + (mt.total ? " total" : "") }, h("small", null, mt.label), b);
        this.metricEls[mt.key] = { box, b, cfg: mt };
        return box;
      }));

    this.playBtn = h("button", { class: "btn", onclick: () => this.togglePause(), "aria-label": "Jeda animasi" }, "❚❚ Jeda");
    const tools = h("div", { class: "stage-tools" },
      h("div", { class: "legend" }, (L.legend || []).map((g) => h("span", null, h("i", { style: "background:" + g.color + (g.border ? ";border:2px solid " + g.border : "") }), g.label))),
      h("button", { class: "btn", onclick: () => this.replay(), "aria-label": "Ulangi animasi langkah ini" }, "↺ Ulangi"),
      this.playBtn);
    this.stage = h("div", { class: "stage" });
    this.stepper = h("div", { class: "stepper", role: "tablist", "aria-label": "Langkah pelajaran" },
      L.steps.map((s, i) => h("button", { role: "tab", onclick: () => this.go(i), title: s.title }, h("span", { class: "n" }, String(i + 1)), h("span", { class: "lbl" }, s.short))));

    const left = h("div", null,
      h("div", { class: "crumb" }, m.id + ". " + m.title + " / Pelajaran " + (this.meta.index + 1) + " dari " + m.lessons.length),
      h("h1", null, L.title),
      h("div", { class: "tags" },
        h("span", { class: "tag" }, "⏱ " + L.minutes + " menit"),
        h("span", { class: "tag" }, L.level),
        h("span", { class: "tag" }, L.steps.length + " langkah"),
        L.lo ? h("span", { class: "tag" }, L.lo) : null,
        this.meta.sessions ? h("span", { class: "tag" }, this.meta.sessions) : null),
      h("p", { class: "subtitle" }, L.subtitle),
      metrics,
      h("div", { class: "stage-card" }, tools, this.stage),
      this.stepper);

    this.panelCard = h("div", { class: "card", "aria-live": "polite" });
    this.extra = h("div", { class: "panel-extra" });
    const learn = h("div", { class: "card box" }, h("h4", null, "YANG AKAN KAMU PELAJARI"), h("ul", null, L.learn.map((t) => h("li", { html: rich(t) }))));
    const panel = h("aside", { class: "panel" }, this.panelCard, this.extra, learn);

    main.append(h("div", { class: "lesson" }, left, panel));
    this.renderer.mount(this.stage, L);
  };

  Player.prototype.go = function (k) {
    const n = this.lesson.steps.length;
    k = Math.max(0, Math.min(n - 1, k));
    this.k = k;
    history.replaceState(null, "", "#/" + this.lesson.slug + "/" + (k + 1));
    [...this.stepper.children].forEach((b, i) => {
      b.className = i < k ? "done" : i === k ? "cur" : "";
      b.setAttribute("aria-selected", String(i === k));
    });
    const cur = this.stepper.children[k];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
    this.renderPanel();
    if (k === n - 1) this.app.markDone(this.lesson.slug);
    this.play();
  };

  Player.prototype.baseFrame = function (k) {
    return k > 0 ? last(this.lesson.steps[k - 1].frames) : this.lesson.initial;
  };

  Player.prototype.play = function () {
    clearTimeout(this.timer);
    const st = this.lesson.steps[this.k];
    this.paused = false;
    this.fi = -1;
    this.show(this.baseFrame(this.k), true);
    if (reduceMotion) { this.fi = st.frames.length - 1; this.show(last(st.frames), true); this.setPlayBtn("done"); return; }
    this.setPlayBtn("playing");
    this.timer = setTimeout(() => this.tick(), 380);
  };

  Player.prototype.tick = function () {
    const st = this.lesson.steps[this.k];
    this.fi++;
    const fr = st.frames[this.fi];
    if (!fr) return this.setPlayBtn("done");
    this.show(fr, false);
    if (this.fi < st.frames.length - 1) {
      const d = (fr.dur || 900) * (st.tempo || 1);
      this.timer = setTimeout(() => this.tick(), d);
    } else this.setPlayBtn("done");
  };

  Player.prototype.togglePause = function () {
    const st = this.lesson.steps[this.k];
    if (this.fi >= st.frames.length - 1 && !this.paused) return this.replay();
    if (this.paused) { this.paused = false; this.setPlayBtn("playing"); this.tick(); }
    else { clearTimeout(this.timer); this.paused = true; this.setPlayBtn("paused"); }
  };

  Player.prototype.replay = function () { this.play(); };

  Player.prototype.setPlayBtn = function (state) {
    const b = this.playBtn;
    if (state === "playing") { b.textContent = "❚❚ Jeda"; b.setAttribute("aria-label", "Jeda animasi"); }
    else if (state === "paused") { b.textContent = "▶ Lanjut"; b.setAttribute("aria-label", "Lanjutkan animasi"); }
    else { b.textContent = "▶ Putar"; b.setAttribute("aria-label", "Putar ulang animasi"); }
  };

  Player.prototype.show = function (frame, instant) {
    this.renderer.render(frame, { instant, lesson: this.lesson });
    this.updateMetrics(frame.metrics || {}, frame.approx || {}, instant);
  };

  Player.prototype.updateMetrics = function (vals, approx, instant) {
    const L = this.lesson;
    const resolved = {};
    L.metrics.forEach((mt) => {
      let v = vals[mt.key];
      if (mt.sum) {
        const parts = mt.sum.map((k) => vals[k]);
        v = parts.some((x) => typeof x !== "number") ? undefined : parts.reduce((a, b) => a + b, 0);
        if (mt.sum.some((k) => approx[k])) approx = { ...approx, [mt.key]: true };
      }
      resolved[mt.key] = v;
    });
    L.metrics.forEach((mt) => {
      const el = this.metricEls[mt.key];
      const v = resolved[mt.key];
      const prev = this.shown[mt.key];
      const pre = approx[mt.key] ? "≈ " : "";
      const unit = mt.unit ? " " + mt.unit : "";
      if (typeof v !== "number") { el.b.textContent = "—"; this.shown[mt.key] = undefined; return; }
      if (instant || typeof prev !== "number" || reduceMotion || prev === v) {
        el.b.textContent = pre + fmt(v) + unit;
      } else {
        countUp(el.b, prev, v, pre, unit);
        el.box.classList.add("bump");
        clearTimeout(el.t);
        el.t = setTimeout(() => el.box.classList.remove("bump"), 650);
      }
      this.shown[mt.key] = v;
    });
  };

  function countUp(el, from, to, pre, unit) {
    const t0 = performance.now(), dur = 450;
    cancelAnimationFrame(el._raf);
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(from + (to - from) * e) + unit;
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  Player.prototype.renderPanel = function () {
    const L = this.lesson, k = this.k, st = L.steps[k], n = L.steps.length;
    const card = this.panelCard;
    card.innerHTML = "";
    card.append(h("div", null,
      h("div", { class: "step-no" }, h("span", null, "LANGKAH " + (k + 1) + " / " + n), h("span", { class: "kind " + st.kind }, st.kind)),
      h("h2", null, st.title),
      st.text.map((t) => h("p", { html: rich(t) })),
      st.bullets ? h("ul", { class: "bullets" }, st.bullets.map((b) => h("li", { html: rich(b) }))) : null,
      st.callout ? h("div", { class: "callout " + st.callout.type.split(" ")[0] }, h("b", null, st.callout.type), h("span", { html: rich(st.callout.text) })) : null,
      st.changed && st.changed.length ? h("div", { class: "changed" }, h("h4", null, "YANG BERUBAH"),
        h("ul", null, st.changed.map(([s, t]) => h("li", null,
          h("span", { class: "sym " + (s === "+" ? "add" : s === "~" ? "mod" : "del"), "aria-label": s === "+" ? "baru" : s === "~" ? "berubah" : "dihapus" }, s === "-" ? "−" : s),
          h("span", { html: rich(t) }))))) : null,
      st.quiz ? this.quiz(st.quiz) : null,
      h("div", { class: "nav" },
        h("button", { class: "btn", disabled: k === 0, onclick: () => this.go(k - 1) }, "← Kembali"),
        k < n - 1
          ? h("button", { class: "btn primary", onclick: () => this.go(k + 1) }, "Berikutnya: " + L.steps[k + 1].short + " →")
          : this.nextLink()),
      h("div", { class: "hint", html: "<kbd>←</kbd> <kbd>→</kbd> langkah · <kbd>R</kbd> ulangi · <kbd>Spasi</kbd> jeda" })
    ));
    this.extra.innerHTML = "";
    if (k === n - 1 && L.next) {
      const nx = this.app.nextOf(L.slug);
      this.extra.append(h("div", { class: "card box next-box" }, h("h4", null, "SELANJUTNYA"),
        h("div", { html: rich(L.next) }),
        nx ? h("p", { style: "margin:8px 0 0;font-size:13px;color:#b8c1d6" }, nx.ready ? h("a", { href: "#/" + nx.slug }, nx.title + " →") : nx.title + " · segera hadir") : null));
    }
  };

  Player.prototype.nextLink = function () {
    const nx = this.app.nextOf(this.lesson.slug);
    if (nx && nx.ready) return h("a", { class: "btn primary", href: "#/" + nx.slug }, "Pelajaran berikutnya →");
    return h("a", { class: "btn primary", href: "#/" }, "Kembali ke ikhtisar");
  };

  Player.prototype.quiz = function (qs) {
    return h("div", { class: "quiz" }, h("h4", null, "CEK PEMAHAMAN"), qs.map((q) => {
      const why = h("div", { class: "why", hidden: true, html: rich(q.why) });
      const opts = q.options.map((o, i) => h("button", { html: rich(o), onclick: (e) => {
        opts.forEach((b, j) => { b.classList.remove("right", "wrong"); if (j === q.answer) b.classList.add("right"); });
        if (i !== q.answer) e.currentTarget.classList.add("wrong");
        why.hidden = false;
      } }));
      return h("div", { class: "q" }, h("p", { html: rich(q.q) }), opts, why);
    }));
  };

  Player.prototype.onKey = function (e) {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowRight") { e.preventDefault(); this.go(this.k + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); this.go(this.k - 1); }
    else if (e.key === "r" || e.key === "R") { this.replay(); }
    else if (e.key === " " && tag !== "button" && tag !== "a") { e.preventDefault(); this.togglePause(); }
  };

  Player.prototype.destroy = function () {
    clearTimeout(this.timer);
    document.removeEventListener("keydown", this.onKey);
    if (this.renderer.unmount) this.renderer.unmount();
  };

  function last(a) { return a[a.length - 1]; }
})();
