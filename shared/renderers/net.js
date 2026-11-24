/* Renderer "net" (isometrik) — untuk arsitektur sistem, jaringan, dan strategi pengembangan.
 *
 * Tata letak memakai (u, v): u ke kanan di layar, v ke depan (bawah).
 * Frame:
 *   nodes: [{ id, kind, label, sub, u, v, theme, state, range, n }]
 *          kind: server | app | mainframe | pc | terminal | laptop | phone | db | cloud | switch |
 *                router | proxy | printer | ap | box | stack | token | bar
 *          bar: n = tinggi bertanda dalam unit dunia (negatif = turun di bawah lantai), w = lebar alas,
 *               z0 = alas tumpukan (untuk batang bertumpuk); label "" menyembunyikan label
 *          state: hl | ok | err | off | busy   ·  sub: lencana kecil di atas label (mis. "CPU 30%")
 *   edges: [{ id, a, b, kind: wire|wan|wifi|logic, state: cut|off|hl, label }]
 *   zones: [{ id, label, u0, v0, u1, v1, theme }]      area lantai (LAN, cabang, cloud)
 *   flows: [{ path: [nodeId...], kind: req|res|data|err|file, arc, dur }]  paket berjalan
 *   card:  { at: "center"|"right", type: "chart"|"table"|"lab", ... }      kartu di panggung
 *   note, tone, noteAt, metrics
 */
(function () {
  "use strict";
  const { h, esc, rich, fmt } = Kelas.util;
  const W = (u, v) => [u + v, -u + v];
  const BOX = {
    server: { w: 0.9, d: 0.9, h: 1.5, theme: "blue" },
    app: { w: 0.9, d: 0.9, h: 1.25, theme: "violet" },
    mainframe: { w: 1.5, d: 1.5, h: 1.9, theme: "slate" },
    switch: { w: 1.2, d: 0.7, h: 0.28, theme: "blue" },
    router: { w: 0.95, d: 0.95, h: 0.4, theme: "violet" },
    proxy: { w: 0.9, d: 0.9, h: 0.95, theme: "rose" },
    printer: { w: 0.95, d: 0.75, h: 0.5, theme: "board" },
    ap: { w: 0.55, d: 0.55, h: 0.24, theme: "sand" },
    phone: { w: 0.38, d: 0.2, h: 0.74, theme: "slate" },
    box: { w: 0.9, d: 0.9, h: 0.9, theme: "sand" }
  };
  const STATE_THEME = { hl: "warm", ok: "ok", err: "rose", busy: "warm-strong" };

  let st = null;

  function camPill(cam, x, y, z, text) {
    const half = (String(text).length * 7.6) / 2 + 16, k = half / (2 * Iso.C * Iso.U);
    cam.push([x + k, y - k, z + 0.6], [x - k, y + k, z + 0.6], [x - k, y + k, z - 0.1]);
  }

  Kelas.registerRenderer("net", {
    mount(stage, lesson) {
      const root = h("div", { class: "sv net" });
      const wrap = h("div", { class: "sv-scene" });
      const live = h("div", { class: "sr-only", "aria-live": "polite" });
      const card = h("div", { class: "net-card-wrap", hidden: true });
      wrap.append(live, card);
      const sc = Iso.scene(wrap, { label: "Diagram arsitektur sistem" });
      wrap.insertBefore(sc.svg, card);
      const note = Iso.pill(sc.layers.fx, { cls: "note" }).show(false);
      root.append(wrap);
      stage.innerHTML = "";
      stage.append(root);
      st = { lesson, sc, root, live, note, cardEl: card, els: new Map(), anchors: {}, flowKey: "", flowEls: [], camKey: "", cardKey: "", labCleanup: null };
    },

    render(f, opts) {
      if (!st) return;
      const instant = !!opts.instant, seen = new Set(), cam = [];
      st.anchors = {};
      (f.zones || []).forEach((z) => renderZone(z, instant, seen, cam));
      (f.nodes || []).forEach((n) => renderNode(n, instant, seen, cam));
      (f.edges || []).forEach((e) => renderEdge(e, instant, seen));
      for (const [id, e] of st.els) if (!seen.has(id)) { st.els.delete(id); removeEl(e, instant); }
      renderFlows(f.flows || []);
      renderNote(f, cam);
      renderCard(f.card, instant);
      if (f.card && f.card.at === "right" && cam.length) {
        // geser bingkai agar diagram berada di kiri dan kartu tidak menutupinya
        const xs = cam.map((p) => p[0] - p[1]);
        const span = Math.max(...xs) - Math.min(...xs), right = Math.max(...xs) + span * 1.05;
        cam.push([right / 2, -right / 2, 0]);
      }
      fitCamera(cam, instant);
      st.sc.svg.classList.toggle("dim", !!(f.card && f.card.at !== "right"));
      st.live.textContent = f.note || "";
    },

    unmount() { if (st && st.labCleanup) st.labCleanup(); st = null; }
  });

  // ---------- elemen umum ----------
  function getEl(id, make, instant, seen) {
    seen.add(id);
    let e = st.els.get(id);
    if (!e) { e = make(instant ? null : 0); e.fresh = true; st.els.set(id, e); } else e.fresh = false;
    return e;
  }
  function removeEl(e, instant) {
    if (e.cancel) e.cancel();
    (e.nodes || []).forEach((n) => {
      if (instant || Iso.reduceMotion || !n.animate) return n.remove();
      n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" }).onfinish = () => n.remove();
    });
  }

  // ---------- zona ----------
  function renderZone(z, instant, seen, cam) {
    const id = "z:" + z.id;
    const e = getEl(id, (d) => {
      const poly = Iso.el("rect", { class: "net-zone", rx: 22, ry: 22 }, st.sc.layers.floor);
      const lab = Iso.pill(st.sc.layers.label, { cls: "zone-label", drop: d });
      if (d != null && poly.animate) poly.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
      return { poly, lab, nodes: [poly, lab.g] };
    }, instant, seen);
    const c = [W(z.u0, z.v0), W(z.u1, z.v0), W(z.u1, z.v1), W(z.u0, z.v1)];
    const sp = c.map(([x, y]) => Iso.P(x, y, 0));
    const xs = sp.map((p) => p[0]), ys = sp.map((p) => p[1]);
    e.poly.setAttribute("x", Math.min(...xs)); e.poly.setAttribute("y", Math.min(...ys));
    e.poly.setAttribute("width", Math.max(...xs) - Math.min(...xs)); e.poly.setAttribute("height", Math.max(...ys) - Math.min(...ys));
    e.poly.setAttribute("class", "net-zone zone-" + (z.theme || "blue") + (z.state ? " s-" + z.state : ""));
    const [lx, ly] = W(z.u0 + 0.15, z.v0 + 0.15);
    e.lab.text(z.label).cls("zone-label zone-" + (z.theme || "blue")).at(lx, ly, 0, 4);
    c.forEach(([x, y]) => cam.push([x, y, 0]));
    camPill(cam, lx, ly, 0, z.label);
  }

  // ---------- node ----------
  function makeNode(n, d) {
    const L = st.sc.layers, parts = [], nodes = [];
    const box = (o) => { const b = Iso.box(L.obj, { theme: o.theme, drop: d }); parts.push(b); nodes.push(b.g); return b; };
    let geo;
    if (BOX[n.kind]) {
      const s = BOX[n.kind], b = box(s);
      geo = { top: s.h, place: (x, y) => b.set({ x: x - s.w / 2, y: y - s.d / 2, z: 0, w: s.w, d: s.d, h: s.h, base: 0 }) };
    } else if (n.kind === "pc" || n.kind === "terminal") {
      const stand = box({ theme: "board" }), scr = box({ theme: n.kind === "terminal" ? "sand" : "slate" });
      geo = { top: 0.98, screen: scr, place: (x, y) => {
        stand.set({ x: x - 0.13, y: y - 0.13, z: 0, w: 0.26, d: 0.26, h: 0.32, base: 0 });
        scr.set({ x: x - 0.5, y: y - 0.07, z: 0.32, w: 1.0, d: 0.14, h: 0.66, base: 0 });
      } };
    } else if (n.kind === "laptop") {
      const base = box({ theme: "board" }), scr = box({ theme: "slate" });
      geo = { top: 0.68, screen: scr, place: (x, y) => {
        base.set({ x: x - 0.5, y: y - 0.35, z: 0, w: 1.0, d: 0.7, h: 0.08, base: 0 });
        scr.set({ x: x - 0.5, y: y - 0.35, z: 0.08, w: 1.0, d: 0.07, h: 0.6, base: 0 });
      } };
    } else if (n.kind === "db") {
      const c = Iso.cylinder(L.obj, { theme: "teal", drop: d }); parts.push(c); nodes.push(c.g);
      geo = { top: 0.9, place: (x, y) => c.set({ x, y, z: 0, r: 0.48, h: 0.9 }) };
    } else if (n.kind === "cloud") {
      const c = Iso.cloud(L.label, { drop: d }); nodes.push(c.g);
      geo = { top: 1.9, place: (x, y) => c.at(x, y, 1.1, n.scale || 1), noTheme: true };
    } else if (n.kind === "stack") {
      const slabs = [];
      for (let i = 0; i < 6; i++) { const b = box({ theme: "sand" }); slabs.push(b); }
      geo = { top: 0.9, slabs, place: (x, y, nn) => {
        const k = Math.max(1, Math.min(6, nn == null ? 3 : nn));
        slabs.forEach((b, i) => { b.g.style.display = i < k ? "" : "none"; b.set({ x: x - 0.5, y: y - 0.36, z: i * 0.15, w: 1.0, d: 0.72, h: 0.11, base: 0 }); });
        geo.top = k * 0.15;
      } };
    } else if (n.kind === "bar") {
      // batang grafik 3D: tinggi bertanda, bertransisi halus saat nilainya berubah
      const b = box({ theme: n.theme || "blue" });
      const w = n.w || 0.8;
      geo = { top: 0, bar: b, place: (x, y, val, z0) => {
        const v = val || 0, zb = z0 || 0;
        b.set({ x: x - w / 2, y: y - w / 2, z: zb + Math.min(0, v), w, d: w, h: Math.max(Math.abs(v), 0.02), base: zb === 0 ? Math.min(0, v) : zb + Math.min(0, v) });
        geo.top = zb + Math.max(v, 0);
      } };
    } else { // token: hanya label
      geo = { top: 0, place: () => {} };
    }
    const range = n.range ? Iso.el("ellipse", { class: "net-range" }, L.floor) : null;
    if (range) nodes.push(range);
    const label = Iso.pill(L.label, { cls: "node-label", drop: d == null ? null : d + 200 });
    const sub = Iso.pill(L.label, { cls: "node-sub", drop: d == null ? null : d + 320 }).show(false);
    nodes.push(label.g, sub.g);
    return { parts, nodes, geo, label, sub, range, cur: null };
  }

  function renderNode(n, instant, seen, cam) {
    const id = "n:" + n.id;
    const e = getEl(id, (d) => makeNode(n, d), instant, seen);
    const target = { u: n.u, v: n.v };
    const zlOf = (top) => Math.max(top, 0) + (n.kind === "token" ? 0.3 : 0.55);
    const placeGeo = (u, v) => {
      const [x, y] = W(u, v);
      e.geo.place(x, y, n.n);
      const zl = zlOf(e.geo.top);
      e.label.at(x, y, zl);
      if (n.sub) e.sub.at(x, y, zl + 0.64);
      if (e.range) {
        const rx = n.range * Math.SQRT2 * Iso.C * Iso.U, ry = n.range * Math.SQRT2 * Iso.S * Iso.U, [cx, cy] = Iso.P(x, y, 0);
        e.range.setAttribute("cx", cx); e.range.setAttribute("cy", cy); e.range.setAttribute("rx", rx); e.range.setAttribute("ry", ry);
      }
    };
    // geser halus bila posisi berubah (mis. laptop berpindah area Wi-Fi)
    const moving = e.cur && (e.cur.u !== target.u || e.cur.v !== target.v) && !instant;
    if (e.cancel) { e.cancel(); e.cancel = null; }
    if (n.kind === "bar") {
      // tween tinggi batang dari nilai yang sedang tampil
      const fromN = e.curN == null ? (instant ? n.n : 0) : e.curN, toN = n.n || 0;
      const fromZ = e.curZ == null ? (n.z0 || 0) : e.curZ, toZ = n.z0 || 0;
      const [bx, by] = W(target.u, target.v);
      const set = (val, z0) => {
        e.curN = val; e.curZ = z0;
        e.geo.place(bx, by, val, z0);
        const zl = z0 + Math.max(val, 0) + 0.55;
        e.label.at(bx, by, val < 0 ? 0.2 : zl);
        if (n.sub) e.sub.at(bx, by, (val < 0 ? 0.2 : zl) + 0.64);
      };
      if (instant || Iso.reduceMotion || (Math.abs(fromN - toN) < 1e-6 && Math.abs(fromZ - toZ) < 1e-6)) set(toN, toZ);
      else e.cancel = Iso.tween(900, (t) => set(fromN + (toN - fromN) * t, fromZ + (toZ - fromZ) * t));
    } else if (moving) {
      const from = { ...e.cur };
      e.cancel = Iso.tween(1100, (t) => placeGeo(from.u + (target.u - from.u) * t, from.v + (target.v - from.v) * t));
    } else placeGeo(target.u, target.v);
    e.cur = target;
    {
      const [x, y] = W(target.u, target.v);
      const top = n.kind === "bar" ? (n.z0 || 0) + Math.max(n.n || 0, 0) : e.geo.top, zl = n.kind === "bar" && (n.n || 0) < 0 ? 0.2 : zlOf(top);
      st.anchors[n.id] = { port: [x, y, 0.18], top: [x, y, top + 0.15], label: [x, y, zl] };
      if (n.kind === "bar" && (n.n || 0) < 0) cam.push([x - 0.6, y - 0.6, n.n], [x + 0.6, y + 0.6, n.n]);
      if (n.kind === "bar") cam.push([x, y, top + 0.6]);
    }
    const th = STATE_THEME[n.state] || n.theme || (BOX[n.kind] && BOX[n.kind].theme);
    if (!e.geo.noTheme) {
      if (e.geo.screen && !STATE_THEME[n.state]) e.geo.screen.theme(n.theme || (n.kind === "terminal" ? "sand" : "slate"));
      else if (e.geo.screen) e.geo.screen.theme(th);
      else if (e.geo.slabs) e.geo.slabs.forEach((b) => b.theme(th || "sand"));
      else e.parts.forEach((p) => th && p.theme(th));
    }
    const off = n.state === "off";
    e.nodes.forEach((nd) => nd.classList && nd.classList.toggle("net-off", off));
    if (e.range) e.range.setAttribute("class", "net-range" + (n.state === "err" ? " s-err" : ""));
    e.label.text(n.label || n.id).cls("node-label k-" + n.kind + (n.state ? " s-" + n.state : "")).show(n.label !== "");
    if (n.sub) e.sub.text(n.sub).cls("node-sub" + (n.subTone ? " t-" + n.subTone : "")).show(true); else e.sub.show(false);
    const [x, y] = W(n.u, n.v), zl = st.anchors[n.id].label[2];
    cam.push([x - 1, y - 1, 0], [x + 1, y + 1, 0]);
    camPill(cam, x, y, zl, n.label || n.id);
    if (n.sub) camPill(cam, x, y, zl + 0.64, n.sub);
    if (n.range) { const r = n.range; cam.push([x - r, y - r, 0], [x + r, y + r, 0], [x + r, y - r, 0], [x - r, y + r, 0]); }
    if (e.fresh && !instant && n.sparkle) setTimeout(() => st && Iso.sparkle(st.sc.layers.fx, x, y, e.geo.top + 0.2, "#6366f1"), 650);
  }

  // ---------- kabel ----------
  function renderEdge(ed, instant, seen) {
    const id = "e:" + (ed.id || ed.a + "-" + ed.b);
    const e = getEl(id, (d) => {
      const c = Iso.connector(st.sc.layers.conn);
      const cut = Iso.pill(st.sc.layers.label, { cls: "edge-cut", text: "✕" }).show(false);
      const lab = Iso.pill(st.sc.layers.label, { cls: "edge-label" }).show(false);
      if (d != null && c.g.animate) c.g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 250, fill: "backwards" });
      return { c, cut, lab, nodes: [c.g, cut.g, lab.g] };
    }, instant, seen);
    const A = st.anchors[ed.a], B = st.anchors[ed.b];
    if (!A || !B) { e.c.hide(); return; }
    const kind = ed.kind || "wire";
    const air = kind === "wan" || kind === "wifi";
    const from = air ? A.top : A.port, to = air ? B.top : B.port;
    const arc = kind === "wan" ? 0.9 : kind === "wifi" ? 0.45 : 0;
    e.c.set({ from, to, arc, dashed: kind !== "wire" });
    e.c.g.setAttribute("class", "iso-conn net-" + kind + (ed.state ? " s-" + ed.state : ""));
    e.c.g.style.opacity = ed.state === "off" ? 0.25 : 1;
    const mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2, mz = (from[2] + to[2]) / 2 + arc * 0.5;
    if (ed.state === "cut") e.cut.at(mx, my, mz).show(true); else e.cut.show(false);
    if (ed.label) e.lab.text(ed.label).at(mx, my, mz + (ed.state === "cut" ? 0.65 : 0.1)).show(true); else e.lab.show(false);
  }

  // ---------- paket ----------
  function renderFlows(flows) {
    const key = JSON.stringify(flows) + JSON.stringify(flows.map((f) => f.path.map((p) => st.anchors[p] && st.anchors[p].port)));
    if (key === st.flowKey) return;
    st.flowKey = key;
    st.flowEls.forEach((g) => g.remove());
    st.flowEls = [];
    flows.forEach((fl) => {
      const pts = fl.path.map((id) => st.anchors[id]).filter(Boolean).map((a) => Iso.P(...(fl.arc ? a.top : a.port)));
      if (pts.length < 2) return;
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
        if (fl.arc) d += ` Q${((ax + bx) / 2).toFixed(1)} ${(Math.min(ay, by) - fl.arc * Iso.U).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
        else d += ` L${bx.toFixed(1)} ${by.toFixed(1)}`;
      }
      const g = Iso.el("g", { class: "net-flow k-" + (fl.kind || "req") }, st.sc.layers.fx);
      if (fl.arc) Iso.el("path", { d, class: "net-flow-line" }, g);
      if (!Iso.reduceMotion) {
        const dur = fl.dur || Math.max(1.1, pts.length * 0.6), count = fl.count || 1;
        for (let k = 0; k < count; k++) {
          const p = Iso.el("g", { class: "iso-packet k-" + (fl.kind || "req") }, g);
          Iso.el("circle", { r: fl.kind === "file" ? 13 : 9, class: "halo" }, p);
          Iso.el("circle", { r: fl.kind === "file" ? 8 : 5, class: "core" }, p);
          Iso.el("animateMotion", { dur: dur + "s", begin: (fl.delay || 0) + (k * dur) / count + "s", repeatCount: "indefinite", path: d, calcMode: "linear" }, p);
        }
      }
      st.flowEls.push(g);
    });
  }

  // ---------- catatan & kamera ----------
  function renderNote(f, cam) {
    if (!cam.length) cam.push([0, 0, 0]);
    const xs = cam.map((p) => p[0] - p[1]), ys = cam.map((p) => (p[0] + p[1]) * 0.5 - p[2]);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2, top = Math.min(...ys);
    const slot = [mid / 2, -mid / 2, 0.75 - top];
    cam.push([slot[0], slot[1], slot[2] + 0.6]);
    if (!f.note) { st.note.show(false); return; }
    const a = f.noteAt && st.anchors[f.noteAt];
    const [x, y, z] = a ? [a.label[0], a.label[1], a.label[2] + 1.0] : slot;
    st.note.text(f.note).cls("note " + (f.tone || "")).at(x, y, z).show(true);
    camPill(cam, x, y, z, f.note);
  }
  function fitCamera(pts, instant) {
    const key = pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(";");
    if (key === st.camKey) return;
    const first = !st.camKey;
    st.camKey = key;
    st.sc.camera.fit(pts, { pad: 16, minAspect: 1.55, instant: instant || first, dur: 850 });
  }

  // ---------- kartu: grafik, tabel, lab ----------
  function renderCard(card, instant) {
    const key = card ? JSON.stringify(card) : "";
    if (key === st.cardKey) return;
    const prev = st.cardKey ? JSON.parse(st.cardKey) : null;
    st.cardKey = key;
    if (st.labCleanup && (!card || !prev || card.lab !== prev.lab)) { st.labCleanup(); st.labCleanup = null; st.labUpdate = null; }
    const wrap = st.cardEl;
    if (!card) { wrap.hidden = true; wrap.innerHTML = ""; return; }
    wrap.hidden = false;
    wrap.className = "net-card-wrap at-" + (card.at || "center");
    // grafik yang sama (judul sama) diperbarui di tempat agar garis/penanda bergerak halus
    const same = prev && prev.type === card.type && prev.title === card.title && prev.lab === card.lab && wrap.firstChild;
    if (same && card.type === "chart") { NetChart(wrap.querySelector(".net-chart"), card); updateCardText(wrap, card); return; }
    if (same && card.lab) { updateCardText(wrap, card); if (st.labUpdate) st.labUpdate(card); return; }
    wrap.innerHTML = "";
    const box = h("div", { class: "sv-card net-card" + (instant ? "" : " anim") },
      card.title ? h("h3", null, card.title) : null,
      card.sub ? h("p", { class: "sub", html: rich(card.sub) }) : null);
    wrap.append(box);
    if (card.type === "chart") { const c = h("div", { class: "net-chart" }); box.append(c); NetChart(c, card); }
    if (card.type === "table") box.append(NetTable(card));
    if (card.lab) {
      const body = h("div", { class: "net-lab" });
      box.append(body);
      const fn = st.lesson.labs && st.lesson.labs[card.lab];
      // lab boleh mengembalikan fungsi pembersih, atau { cleanup, update(card) } agar bisa diberi nilai awal per frame
      const r = fn ? fn(body, { h, fmt, rich, chart: NetChart, table: NetTable, card }) : null;
      st.labCleanup = typeof r === "function" ? r : r && r.cleanup ? r.cleanup : null;
      st.labUpdate = r && r.update ? r.update : null;
    }
    box.append(h("div", { class: "gr-foot net-foot", hidden: !card.foot, html: card.foot ? rich(card.foot) : "" }));
  }
  function updateCardText(wrap, card) {
    const sub = wrap.querySelector(".sub"); if (sub && card.sub) sub.innerHTML = rich(card.sub);
    const foot = wrap.querySelector(".net-foot");
    if (foot) { foot.hidden = !card.foot; foot.innerHTML = card.foot ? rich(card.foot) : ""; }
  }

  /** Grafik garis SVG sederhana. spec: { x:{min,max,ticks,label,fmt}, y:{...}, series:[{name,color,points,dash}], markers, vlines, hlines } */
  function NetChart(el, spec) {
    const Wd = 560, Ht = 250, m = { l: 58, r: 16, t: 14, b: 40 };
    const X = spec.x, Y = spec.y;
    const sx = (v) => m.l + ((v - X.min) / (X.max - X.min)) * (Wd - m.l - m.r);
    const sy = (v) => Ht - m.b - ((Math.min(Math.max(v, Y.min), Y.max) - Y.min) / (Y.max - Y.min)) * (Ht - m.t - m.b);
    const NS = "http://www.w3.org/2000/svg";
    let svg = el.querySelector("svg");
    const fresh = !svg;
    if (fresh) {
      el.innerHTML = "";
      svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", `0 0 ${Wd} ${Ht}`);
      svg.setAttribute("class", "chart-svg");
      el.append(svg);
      const legend = document.createElement("div");
      legend.className = "chart-legend";
      el.append(legend);
    }
    const mk = (tag, at, parent) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); (parent || svg).appendChild(n); return n; };
    const f = (ax, v) => (ax.fmt ? ax.fmt(v) : fmt(v));
    // sumbu & grid (digambar ulang tiap kali; murah)
    svg.querySelectorAll(".ax").forEach((n) => n.remove());
    const axg = mk("g", { class: "ax" });
    (Y.ticks || []).forEach((t) => {
      mk("line", { x1: m.l, x2: Wd - m.r, y1: sy(t), y2: sy(t), class: "grid" }, axg);
      const tx = mk("text", { x: m.l - 8, y: sy(t) + 4, class: "tick", "text-anchor": "end" }, axg); tx.textContent = (Y.pre || "") + f(Y, t) + (Y.suf || "");
    });
    (X.ticks || []).forEach((t) => {
      const tx = mk("text", { x: sx(t), y: Ht - m.b + 18, class: "tick", "text-anchor": "middle" }, axg); tx.textContent = (X.pre || "") + f(X, t) + (X.suf || "");
    });
    mk("line", { x1: m.l, x2: Wd - m.r, y1: Ht - m.b, y2: Ht - m.b, class: "axis" }, axg);
    const xl = mk("text", { x: (m.l + Wd - m.r) / 2, y: Ht - 4, class: "alabel", "text-anchor": "middle" }, axg); xl.textContent = X.label || "";
    const yl = mk("text", { x: 14, y: (m.t + Ht - m.b) / 2, class: "alabel", "text-anchor": "middle", transform: `rotate(-90 14 ${(m.t + Ht - m.b) / 2})` }, axg); yl.textContent = Y.label || "";
    (spec.hlines || []).forEach((l) => {
      mk("line", { x1: m.l, x2: Wd - m.r, y1: sy(l.y), y2: sy(l.y), class: "hline" }, axg);
      if (l.label) { const t = mk("text", { x: Wd - m.r - 4, y: sy(l.y) - 5, class: "hlabel", "text-anchor": "end" }, axg); t.textContent = l.label; }
    });
    (spec.vlines || []).forEach((l) => {
      mk("line", { x1: sx(l.x), x2: sx(l.x), y1: m.t, y2: Ht - m.b, class: "vline" + (l.tone ? " t-" + l.tone : "") }, axg);
      if (l.label) { const t = mk("text", { x: sx(l.x) + 4, y: m.t + 12, class: "vlabel" + (l.tone ? " t-" + l.tone : "") }, axg); t.textContent = l.label; }
    });
    // seri: path diperbarui di tempat agar bertransisi
    const keep = new Set();
    (spec.series || []).forEach((s, i) => {
      const sid = "s" + i + "-" + s.name;
      keep.add(sid);
      let p = svg.querySelector(`path[data-id="${CSS.escape(sid)}"]`);
      const d = s.points.map((pt, k) => (k ? "L" : "M") + sx(pt[0]).toFixed(1) + " " + sy(pt[1]).toFixed(1)).join(" ");
      if (!p) {
        p = mk("path", { "data-id": sid, class: "series", stroke: s.color, "stroke-dasharray": s.dash || "" });
        p.setAttribute("d", d);
        if (!Iso.reduceMotion && p.getTotalLength) {
          const len = p.getTotalLength();
          p.style.strokeDasharray = s.dash ? "" : len; p.style.strokeDashoffset = s.dash ? 0 : len;
          requestAnimationFrame(() => { p.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.3,.7,.2,1)"; p.style.strokeDashoffset = 0; });
        }
      } else p.setAttribute("d", d);
    });
    svg.querySelectorAll("path.series").forEach((p) => { if (!keep.has(p.dataset.id)) p.remove(); });
    // penanda
    svg.querySelectorAll(".mk").forEach((n) => n.remove());
    (spec.markers || []).forEach((mkr) => {
      const g = mk("g", { class: "mk" + (mkr.tone ? " t-" + mkr.tone : "") });
      g.style.transform = `translate(${sx(mkr.x)}px, ${sy(mkr.y)}px)`;
      mk("circle", { r: 9, class: "mk-halo" }, g);
      mk("circle", { r: 5.5, class: "mk-dot" }, g);
      if (mkr.label) {
        const left = sx(mkr.x) > Wd * 0.62;
        const t = mk("text", { x: left ? -12 : 12, y: -10, class: "mk-label", "text-anchor": left ? "end" : "start" }, g);
        t.textContent = mkr.label;
      }
    });
    const legend = el.querySelector(".chart-legend");
    legend.innerHTML = (spec.series || []).filter((s) => s.name && !s.hideLegend).map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join("");
  }

  /** Tabel kartu. spec: { cols: [...], rows: [[...]], hl: { row, col }, rowTone: {i: "ok"} } */
  function NetTable(spec) {
    return h("table", { class: "net-table" },
      h("thead", null, h("tr", null, spec.cols.map((c) => h("th", { html: rich(c) })))),
      h("tbody", null, spec.rows.map((r, i) => h("tr", { class: (spec.rowTone && spec.rowTone[i] ? "t-" + spec.rowTone[i] : "") + (spec.hl && spec.hl.row === i ? " hl" : "") },
        r.map((c, j) => h(j === 0 ? "th" : "td", { class: spec.hl && spec.hl.col === j && spec.hl.row == null ? "hl" : spec.hl && spec.hl.row === i && spec.hl.col === j ? "hl" : null, html: rich(String(c)) }))))));
  }

  window.NetChart = NetChart;
  window.NetTable = NetTable;

  /** Penyusun frame: ubah keadaan s lalu snap(). */
  window.NetStory = function (init) {
    const s = JSON.parse(JSON.stringify(init));
    let buf = [];
    const api = {
      s,
      snap(extra) { const fr = JSON.parse(JSON.stringify(Object.assign({}, s, extra || {}))); buf.push(fr); return fr; },
      take() { const out = buf; buf = []; return out; },
      node(id) { return s.nodes.find((n) => n.id === id); },
      set(id, props) { const n = api.node(id); if (n) Object.assign(n, props); return n; },
      drop(...ids) { s.nodes = s.nodes.filter((n) => !ids.includes(n.id)); s.edges = (s.edges || []).filter((e) => !ids.includes(e.a) && !ids.includes(e.b)); },
      edge(a, b) { return (s.edges || []).find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a)); }
    };
    return api;
  };
})();
