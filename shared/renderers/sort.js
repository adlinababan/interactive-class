/* Renderer "sort" (isometrik) — untuk pelajaran pengurutan (bubble, selection, insertion, ...).
 * Data pelajaran: lesson.sort = { items: [{id, name, v}], code: { versi: [[id, teks], ...] }, newLines: { versi: [id...] }, listName, range: [min, max] }
 * Frame: { order:[id], vals:{id:v}, cmp:[a,b], result:"swap"|"keep", sortedFrom, note, tone,
 *          code, line, vars:{}, revised:[id], view:"growth"|"summary", growth:{...}, summary:{...} }
 */
(function () {
  const { h, esc, fmt, rich } = Kelas.util;
  const SLOT = 1.35;                       // jarak antar-slot di sepanjang arah (1, −1): tampak horizontal
  const sx = (u) => u * SLOT, sy = (u) => -u * SLOT;
  const KW = /\b(def|for|in|if|elif|else|not|and|or|return|break|while|True|False|None)\b/g;
  const BI = /\b(range|len|print|sorted)\b/g;

  function highlight(line) {
    const m = line.match(/^(.*?)(#.*)?$/);
    let s = esc(m[1]).replace(KW, '<span class="kw">$1</span>').replace(BI, '<span class="nb">$1</span>')
      .replace(/(<span class="kw">def<\/span> )([a-z_]+)/, '$1<span class="fn">$2</span>');
    if (m[2]) s += '<span class="cm">' + esc(m[2]) + "</span>";
    return s;
  }
  const py = (v) => (v === true ? "True" : v === false ? "False" : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  // warna avatar per mahasiswa, agar mudah diikuti saat posisinya berpindah
  const AVATAR = ["#6366f1", "#0ea5e9", "#a855f7", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6", "#06b6d4"];

  let st = null;

  Kelas.registerRenderer("sort", {
    mount(stage, lesson) {
      const S = lesson.sort;
      const [lo, hi] = S.range || [40, 100];
      st = { S, items: {}, cols: {}, code: null, vars: {}, growthRows: {}, view: null, cancel: () => {}, n: S.items.length, depthKey: "" };
      st.hOf = (v) => Math.max(0.45, 0.5 + ((v - lo) / (hi - lo)) * 3.2);
      S.items.forEach((it) => (st.items[it.id] = it));

      const root = h("div", { class: "sv" });
      const sceneWrap = h("div", { class: "sv-scene" });
      const live = h("div", { class: "sr-only", "aria-live": "polite" });
      const overlay = h("div", { class: "sv-overlay", hidden: true });
      sceneWrap.append(live, overlay);
      const sc = Iso.scene(sceneWrap, { label: "Diagram pengurutan" });
      sceneWrap.insertBefore(sc.svg, overlay);

      // alas per slot, lalu kolom nilai
      const n = st.n;
      st.pads = S.items.map((_, i) => {
        const pad = Iso.box(sc.layers.floor, { theme: "board", cls: "board", drop: i * 60 });
        return pad.set({ x: sx(i) - 0.15, y: sy(i) - 0.15, z: -0.28, w: 1.3, d: 1.3, h: 0.28, base: -0.28 });
      });
      S.items.forEach((it, i) => {
        const box = Iso.box(sc.layers.obj, { theme: "slate", drop: 220 + i * 90 });
        const val = Iso.pill(sc.layers.label, { cls: "live dark", drop: 520 + i * 90 });
        const name = Iso.pill(sc.layers.label, { cls: "live name", drop: 120 + i * 60, dot: it.color || AVATAR[i % AVATAR.length] });
        st.cols[it.id] = { box, val, name, cur: { u: i, lift: 0, h: st.hOf(it.v) }, fin: false };
      });
      st.conn = Iso.connector(sc.layers.conn, sc.arrow);
      st.conn.hide();
      st.ptrA = Iso.pill(sc.layers.label, { cls: "ptr", text: "j" }).show(false);
      st.ptrB = Iso.pill(sc.layers.label, { cls: "ptr", text: "j+1" }).show(false);
      st.note = Iso.pill(sc.layers.label, { cls: "note" }).show(false);

      const code = h("pre", { class: "sv-code", "aria-label": "Kode Python" });
      const vars = h("div", { class: "sv-vars" }, h("h5", null, "VARIABEL"), h("div"));
      const arr = h("div", { class: "sv-arr" }, h("h5", null, "ISI LIST"), h("span"));
      root.append(sceneWrap, h("div", { class: "sv-bottom" }, code, h("div", { class: "sv-side" }, vars, arr)));
      stage.innerHTML = "";
      stage.append(root);
      Object.assign(st, { root, sc, live, overlay, codeEl: code, varsEl: vars.lastChild, arrEl: arr.lastChild });
      if (lesson.initial && lesson.initial.order) renderCode(lesson.initial);

      const L = n - 1, top = 4.9;
      sc.camera.fit([[-0.2, 1.2, -0.3], [-0.2, -0.2, top], [sx(L) + 1.2, sy(L) - 0.2, top], [sx(L) + 1.2, sy(L) + 1.2, -0.3],
        [1.2, 1.2, -1.6], [sx(L) + 1.2, sy(L) + 1.2, -1.6]], { pad: 22, minAspect: 1.5, instant: true });
    },

    render(f, opts) {
      if (!st) return;
      if (f.view === "growth" || f.view === "summary") {
        st.sc.svg.classList.add("dim");
        st.root.classList.add("alt");
        st.overlay.hidden = false;
        if (f.view === "growth") renderGrowth(f); else renderSummary(f);
        return;
      }
      st.sc.svg.classList.remove("dim");
      st.root.classList.remove("alt");
      st.overlay.hidden = true;
      st.view = null;
      renderScene(f, opts.instant);
      renderCode(f);
    },

    unmount() { if (st) st.cancel(); st = null; }
  });

  function renderScene(f, instant) {
    const n = f.order.length, vals = f.vals || {}, cmp = f.cmp || [], rev = f.revised || [];
    const sf = f.sortedFrom == null ? n : f.sortedFrom;
    const tg = {};
    f.order.forEach((id, i) => {
      const v = vals[id] != null ? vals[id] : st.items[id].v;
      const inCmp = cmp.includes(i), fin = i >= sf, isRev = rev.includes(id);
      tg[id] = { u: i, lift: inCmp ? 0.32 : 0, h: st.hOf(v), v, i,
        theme: inCmp ? (f.result === "swap" ? "warm-strong" : "warm") : fin ? "ok" : isRev ? "violet" : "slate", fin, isRev };
    });

    // warna & teks langsung; geometri lewat tween
    const newlyFinal = [];
    f.order.forEach((id) => {
      const c = st.cols[id], t = tg[id];
      if (t.fin && !c.fin && !instant) newlyFinal.push(id);
      c.fin = t.fin;
      c.box.theme(t.theme);
      c.val.text(String(t.v)).cls("live dark" + (t.fin ? " okv" : ""));
      c.name.text(st.items[id].name + (t.fin ? " ✓" : "") + (t.isRev ? " · revisi" : "")).cls("live name" + (t.fin ? " ok" : "") + (t.isRev ? " violet" : ""));
    });
    st.pads.forEach((pad, i) => pad.theme(cmp.includes(i) ? "warm" : i >= sf ? "ok" : "board"));

    // kolom yang bergerak ke kanan saat ditukar akan "melompat" melewati pasangannya
    let hopper = null;
    if (f.result === "swap") hopper = f.order.find((id) => tg[id].u > st.cols[id].cur.u + 0.01) || null;
    const from = {};
    f.order.forEach((id) => (from[id] = { ...st.cols[id].cur }));
    const moving = f.order.some((id) => Math.abs(from[id].u - tg[id].u) > 0.01);
    st.cancel();
    if (f.result === "swap" || !cmp.length) st.conn.hide();
    st.cancel = Iso.tween(instant ? 0 : moving ? 720 : 380, (t) => {
      f.order.forEach((id) => {
        const a = from[id], b = tg[id], c = st.cols[id];
        c.cur = { u: lerp(a.u, b.u, t), lift: lerp(a.lift, b.lift, t), h: lerp(a.h, b.h, t) };
        const hop = id === hopper ? Math.sin(Math.PI * t) * 1.6 : 0;
        place(c, c.cur.u, c.cur.lift + hop, c.cur.h);
      });
      depthSort(f.order, hopper);
    }, () => {
      newlyFinal.forEach((id, k) => {
        const t = tg[id];
        setTimeout(() => st && Iso.sparkle(st.sc.layers.fx, sx(t.u) + 0.5, sy(t.u) + 0.5, t.h + 0.2), k * 90);
      });
      if (cmp.length && f.result !== "swap") {
        const A = tg[f.order[cmp[0]]], B = tg[f.order[cmp[1]]];
        st.conn.set({ from: [sx(A.u) + 0.5, sy(A.u) + 0.5, A.lift + A.h + 0.1], to: [sx(B.u) + 0.5, sy(B.u) + 0.5, B.lift + B.h + 0.1], arc: 1.0, packets: true, both: true, dur: 1.3 });
      }
    });

    // penunjuk j / j+1 dan catatan
    if (cmp.length) {
      st.ptrA.at(sx(cmp[0]) + 1.15, sy(cmp[0]) + 1.15, -0.28, 44).show(true);
      st.ptrB.at(sx(cmp[1]) + 1.15, sy(cmp[1]) + 1.15, -0.28, 44).show(true);
    } else { st.ptrA.show(false); st.ptrB.show(false); }
    if (f.note) {
      let x, top;
      if (cmp.length) {
        const A = tg[f.order[cmp[0]]], B = tg[f.order[cmp[1]]];
        x = (A.u + B.u) / 2; top = Math.max(A.h, B.h) + 0.32 + 1.75;
      } else {
        x = (n - 1) / 2; top = Math.max(...f.order.map((id) => tg[id].h)) + 1.35;
      }
      st.note.text(f.note).cls("note " + (f.tone || "")).at(sx(x) + 0.5, sy(x) + 0.5, top).show(true);
    } else st.note.show(false);
    st.live.textContent = f.note || "";
  }

  function place(c, u, z, hgt) {
    const x = sx(u), y = sy(u);
    c.box.set({ x, y, z, w: 1, d: 1, h: hgt, base: 0 });
    c.val.at(x + 0.5, y + 0.5, z + hgt, -16);
    c.name.at(x + 1.15, y + 1.15, -0.28, 16);
  }

  // Semua slot sedalam sama; kolom yang melompat digambar paling akhir agar tampak melintas di atas
  function depthSort(order, hopper) {
    const ids = order.slice().sort((a, b) => (a === hopper) - (b === hopper));
    const key = ids.join();
    if (key === st.depthKey) return;
    st.depthKey = key;
    const layer = st.sc.layers.obj;
    ids.forEach((id) => layer.appendChild(st.cols[id].box.g));
  }

  function renderCode(f) {
    const ver = f.code || "basic";
    if (st.code !== ver) {
      st.code = ver;
      const fresh = (st.S.newLines || {})[ver] || [];
      st.codeEl.innerHTML = "";
      st.S.code[ver].forEach(([id, text], i) => {
        st.codeEl.append(h("div", { class: "ln" + (fresh.includes(id) ? " new" : ""), "data-id": id, html: "<i>" + (i + 1) + "</i><span>" + highlight(text) + "</span>" }));
      });
    }
    [...st.codeEl.children].forEach((ln) => ln.classList.toggle("cur", ln.dataset.id === f.line));

    const vs = f.vars || {};
    const keys = Object.keys(vs);
    st.varsEl.innerHTML = "";
    if (!keys.length) st.varsEl.append(h("span", { class: "sv-chip" }, "—"));
    keys.forEach((k) => {
      const chg = st.vars[k] !== undefined && st.vars[k] !== vs[k];
      st.varsEl.append(h("span", { class: "sv-chip" + (chg ? " chg" : "") }, k + " = " + py(vs[k])));
    });
    st.vars = { ...vs };
    const vals = f.vals || {};
    st.arrEl.textContent = (st.S.listName || "nilai") + " = [" + f.order.map((id) => (vals[id] != null ? vals[id] : st.items[id].v)).join(", ") + "]";
  }

  function renderGrowth(f) {
    const g = f.growth;
    if (st.view !== "growth") {
      st.view = "growth";
      st.growthRows = {};
      st.overlay.innerHTML = "";
      st.overlay.append(h("div", { class: "sv-card" }, h("h3", null, g.title), h("p", { class: "sub" }, g.sub), h("div", { class: "gr-rows" }), h("div", { class: "gr-foot", hidden: true })));
    }
    const rows = st.overlay.querySelector(".gr-rows");
    const max = Math.max(...g.rows.map((x) => x.value));
    g.rows.forEach((x) => {
      let row = st.growthRows[x.label];
      if (!row) {
        const fill = h("div", { class: "gr-fill" });
        row = { el: h("div", { class: "gr-row" }, h("div", { class: "lab", html: rich(x.label) + (x.note ? "<small>" + esc(x.note) + "</small>" : "") }), h("div", { class: "gr-track" }, fill), h("div", { class: "val" }, fmt(x.value))), fill };
        rows.append(row.el);
        st.growthRows[x.label] = row;
        void row.fill.offsetWidth;
      }
      row.fill.style.width = (100 * x.value / max) + "%";
    });
    const foot = st.overlay.querySelector(".gr-foot");
    foot.hidden = !g.foot;
    if (g.foot) foot.innerHTML = rich(g.foot);
  }

  function renderSummary(f) {
    const s = f.summary;
    st.view = "summary";
    st.overlay.innerHTML = "";
    st.overlay.append(h("div", { class: "sv-card" }, h("h3", null, s.title), s.sub ? h("p", { class: "sub" }, s.sub) : null,
      h("table", { class: "sum-table" }, h("tbody", null, s.rows.map((row) =>
        h("tr", { class: row.hl ? "hl" : null }, h("td", { html: rich(row.label) + (row.note ? "<small>" + esc(row.note) + "</small>" : "") }), h("td", null, row.value))))),
      s.foot ? h("div", { class: "gr-foot", html: rich(s.foot) }) : null));
  }
})();
