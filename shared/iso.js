/* Iso — toolkit diagram isometrik untuk Kelas Interaktif.
 * Koordinat dunia: x ke kanan-bawah, y ke kiri-bawah, z ke atas. 1 unit = Iso.U piksel.
 * Dipakai oleh renderer; tidak bergantung pada isi pelajaran.
 *
 *   const sc = Iso.scene(container, { height: 400 });
 *   const b = Iso.box(sc.layers.obj, { theme: "slate" }); b.set({ x: 0, y: 0, z: 0, w: 1, d: 1, h: 2 });
 *   const p = Iso.pill(sc.layers.label, { text: "server" }); p.at(0.5, 0.5, 2.6);
 *   const c = Iso.connector(sc.layers.conn); c.set({ from: [0,0,1], to: [3,0,1], packets: true });
 *   sc.camera.fit([[0,0,0],[3,1,3]], { pad: 40 });
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const U = 40, C = Math.cos(Math.PI / 6), S = 0.5;
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let uid = 0;

  const P = (x, y, z = 0) => [(x - y) * C * U, (x + y) * S * U - z * U];
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  const ease = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3)
  };

  /** Animasi berbasis waktu. step(t) dipanggil dengan t 0→1 (sudah di-ease). Mengembalikan fungsi batal. */
  function tween(dur, step, done, easing = ease.inOut) {
    if (reduceMotion || dur <= 0) { step(1); done && done(); return () => {}; }
    let raf, t0 = null, alive = true;
    const tick = (now) => {
      if (!alive) return;
      if (t0 == null) t0 = now;
      const p = Math.min(1, (now - t0) / dur);
      step(easing(p));
      if (p < 1) raf = requestAnimationFrame(tick); else done && done();
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }

  /** Panggung SVG dengan latar grid isometrik, lapisan, dan kamera. */
  function scene(container, opts = {}) {
    const id = "iso" + ++uid;
    const svg = el("svg", { class: "iso-svg", role: "img", "aria-label": opts.label || "Diagram", preserveAspectRatio: "xMidYMid meet" }, container);
    const defs = el("defs", null, svg);
    // grid titik di setiap simpul kisi isometrik
    const gw = 2 * C * U;
    const pat = el("pattern", { id: id + "-grid", width: gw.toFixed(2), height: U, patternUnits: "userSpaceOnUse" }, defs);
    [[0, 0], [gw, 0], [0, U], [gw, U], [gw / 2, U / 2]].forEach(([cx, cy]) => el("circle", { cx, cy, r: 1.5, class: "iso-dot" }, pat));
    const mk = el("marker", { id: id + "-arrow", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M1 1.5 L9 5 L1 8.5 Q3 5 1 1.5 z", class: "iso-arrowhead" }, mk);
    sharedDefs(defs);
    el("rect", { x: -4000, y: -4000, width: 8000, height: 8000, fill: "url(#iso-sky)", class: "iso-bg" }, svg);
    el("rect", { x: -4000, y: -4000, width: 8000, height: 8000, fill: `url(#${id}-grid)`, class: "iso-bg-dots" }, svg);
    const root = el("g", { class: "iso-root" }, svg);
    const layers = {};
    ["floor", "obj", "conn", "label", "fx"].forEach((n) => (layers[n] = el("g", { class: "iso-" + n }, root)));
    const camera = makeCamera(svg);
    return { svg, root, layers, camera, arrow: `url(#${id}-arrow)` };
  }

  /** Gradasi & filter bersama (id tetap; satu panggung per halaman). */
  function sharedDefs(defs) {
    const lin = (id, stops, attrs) => {
      const g = el("linearGradient", Object.assign({ id }, attrs || { x1: 0, y1: 0, x2: 0, y2: 1 }), defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a == null ? 1 : a }, g));
    };
    lin("iso-sky", [[0, "#eef0ff"], [0.55, "#f7f3ff"], [1, "#fff6ec"]]);
    lin("iso-gloss", [[0, "#ffffff", 0.75], [0.6, "#ffffff", 0.08], [1, "#ffffff", 0]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    lin("iso-shade", [[0, "#1e1b4b", 0], [1, "#1e1b4b", 0.16]]);
    lin("iso-g-indigo", [[0, "#6366f1"], [1, "#8b5cf6"]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    lin("iso-g-amber", [[0, "#f59e0b"], [1, "#f97316"]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    lin("iso-g-emerald", [[0, "#10b981"], [1, "#059669"]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    lin("iso-g-fuchsia", [[0, "#d946ef"], [1, "#a855f7"]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    lin("iso-g-ink", [[0, "#312e81"], [1, "#1e1b4b"]], { x1: 0, y1: 0, x2: 0, y2: 1 });
    const soft = el("filter", { id: "iso-soft", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: 3.2 }, soft);
    const lift = el("filter", { id: "iso-lift", x: "-30%", y: "-40%", width: "160%", height: "200%" }, defs);
    el("feDropShadow", { dx: 0, dy: 2, stdDeviation: 2.2, "flood-color": "#1e1b4b", "flood-opacity": 0.2 }, lift);
    [["amber", "#f59e0b"], ["emerald", "#10b981"], ["indigo", "#6366f1"]].forEach(([n, c]) => {
      const f = el("filter", { id: "iso-glow-" + n, x: "-60%", y: "-60%", width: "220%", height: "220%" }, defs);
      el("feDropShadow", { dx: 0, dy: 0, stdDeviation: 5, "flood-color": c, "flood-opacity": 0.75 }, f);
    });
  }

  function makeCamera(svg) {
    let vb = null, cancel = () => {};
    const apply = (b) => svg.setAttribute("viewBox", b.map((v) => v.toFixed(1)).join(" "));
    return {
      /** Bingkai kamera agar semua titik dunia terlihat. Bergerak hanya bila perlu. */
      fit(worldPoints, o = {}) {
        const pad = o.pad == null ? 36 : o.pad;
        const sp = worldPoints.map((p) => P(p[0], p[1], p[2] || 0));
        const xs = sp.map((p) => p[0]), ys = sp.map((p) => p[1]);
        let x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
        let w = Math.max(...xs) + pad - x0, h = Math.max(...ys) + pad - y0;
        if (o.minAspect && w / h < o.minAspect) { const nw = h * o.minAspect; x0 -= (nw - w) / 2; w = nw; }
        const target = [x0, y0, w, h];
        cancel();
        if (!vb || o.instant) { vb = target; apply(vb); return; }
        const from = vb.slice();
        if (from.every((v, i) => Math.abs(v - target[i]) < 0.5)) return;
        cancel = tween(o.dur || 700, (t) => { vb = from.map((v, i) => v + (target[i] - v) * t); apply(vb); });
      }
    };
  }

  /** Balok isometrik (kolom, server, platform). Warna lewat kelas tema CSS: .t-<nama>. */
  function box(parent, o = {}) {
    const g = el("g", { class: "iso-box t-" + (o.theme || "slate") + (o.cls ? " " + o.cls : "") }, parent);
    const inner = el("g", null, g);
    if (o.drop != null) dropIn(inner, o.drop);
    const shadow = el("polygon", { class: "iso-shadow", filter: "url(#iso-soft)" }, inner);
    const body = el("g", { class: "iso-body" }, inner);
    const left = el("polygon", { class: "f-left" }, body);
    const right = el("polygon", { class: "f-right" }, body);
    const shade = el("polygon", { class: "f-shade", fill: "url(#iso-shade)" }, body);
    const top = el("polygon", { class: "f-top" }, body);
    const gloss = el("polygon", { class: "f-gloss", fill: "url(#iso-gloss)" }, body);
    const edge = el("polyline", { class: "f-edge" }, body);
    const s = { x: 0, y: 0, z: 0, w: 1, d: 1, h: 1, base: 0 };
    return {
      g, state: s,
      set(n) {
        Object.assign(s, n);
        const { x, y, z, w, d, h, base } = s;
        top.setAttribute("points", pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
        left.setAttribute("points", pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
        right.setAttribute("points", pts([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
        shade.setAttribute("points", right.getAttribute("points"));
        gloss.setAttribute("points", top.getAttribute("points"));
        edge.setAttribute("points", pts([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
        const lift = Math.max(0, z - base);
        const sp = 0.12 + lift * 0.18;
        shadow.setAttribute("points", pts([P(x - sp, y - sp, base), P(x + w + sp, y - sp, base), P(x + w + sp, y + d + sp, base), P(x - sp, y + d + sp, base)]));
        shadow.style.opacity = (0.26 - Math.min(0.14, lift * 0.1)).toFixed(2);
        return this;
      },
      theme(t) { g.setAttribute("class", "iso-box t-" + t + (o.cls ? " " + o.cls : "")); return this; }
    };
  }

  /** Animasi "jatuh ke panggung". Memakai Web Animations agar tidak terulang saat urutan DOM berubah. */
  function dropIn(node, delay = 0, dist = 60) {
    if (reduceMotion || !node.animate) return;
    node.animate(
      [{ transform: `translateY(${-dist}px)`, opacity: 0 }, { opacity: 1, offset: 0.6 }, { transform: "translateY(0)", opacity: 1 }],
      { duration: 750, delay, easing: "cubic-bezier(.2,.9,.25,1.15)", fill: "backwards" }
    );
  }

  /** Efek kilau: cincin cahaya + partikel bintang memancar dari satu titik dunia, lalu hilang. */
  function sparkle(layer, x, y, z, color = "#10b981", count = 14) {
    if (reduceMotion || !layer.animate) return;
    const [cx, cy] = P(x, y, z);
    // cincin isometrik (elips pipih) yang membesar dan memudar
    const ring = el("ellipse", { cx: 0, cy: 0, rx: 30, ry: 17, fill: "none", stroke: color, "stroke-width": 3 }, layer);
    ring.animate([
      { transform: `translate(${cx}px, ${cy}px) scale(.4)`, opacity: .95 },
      { transform: `translate(${cx}px, ${cy}px) scale(1.9)`, opacity: 0 }
    ], { duration: 750, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => ring.remove();
    const palette = [color, "#fbbf24", "#6366f1", "#ec4899"];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.35;
      const dist = 40 + Math.random() * 34;
      const star = i % 2 === 0;
      const c = palette[i % palette.length];
      const node = star
        ? el("path", { d: "M0 -9 L2.3 -2.3 L9 0 L2.3 2.3 L0 9 L-2.3 2.3 L-9 0 L-2.3 -2.3 Z", fill: c }, layer)
        : el("circle", { r: 3.6, fill: c }, layer);
      const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * 0.7;
      node.animate([
        { transform: `translate(${cx}px, ${cy}px) scale(.2) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${cx + dx}px, ${cy + dy - 22}px) scale(1.15) rotate(90deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${cx + dx * 1.2}px, ${cy + dy * 1.2 - 4}px) scale(.2) rotate(180deg)`, opacity: 0 }
      ], { duration: 950 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => node.remove();
    }
  }

  /** Silinder isometrik (database). r dalam unit dunia. */
  function cylinder(parent, o = {}) {
    const g = el("g", { class: "iso-box iso-cyl t-" + (o.theme || "teal") }, parent);
    const inner = el("g", null, g);
    if (o.drop != null) dropIn(inner, o.drop);
    const shadow = el("ellipse", { class: "iso-shadow", filter: "url(#iso-soft)" }, inner);
    const body = el("g", { class: "iso-body" }, inner);
    const side = el("path", { class: "f-left" }, body);
    const shade = el("path", { class: "f-shade", fill: "url(#iso-shade)" }, body);
    const bands = el("path", { class: "f-band" }, body);
    const top = el("ellipse", { class: "f-top" }, body);
    const gloss = el("ellipse", { class: "f-gloss", fill: "url(#iso-gloss)" }, body);
    return {
      g,
      set({ x, y, z = 0, r = 0.5, h = 1 }) {
        const rx = r * Math.SQRT2 * C * U, ry = r * Math.SQRT2 * S * U;
        const [cx, cyb] = P(x, y, z), cyt = cyb - h * U;
        side.setAttribute("d", `M${cx - rx} ${cyt} L${cx - rx} ${cyb} A${rx} ${ry} 0 0 0 ${cx + rx} ${cyb} L${cx + rx} ${cyt} Z`);
        shade.setAttribute("d", `M${cx} ${cyt + ry} L${cx} ${cyb + ry} A${rx} ${ry} 0 0 0 ${cx + rx} ${cyb} L${cx + rx} ${cyt} Z`);
        const b1 = cyt + (cyb - cyt) / 3, b2 = cyt + (2 * (cyb - cyt)) / 3;
        bands.setAttribute("d", `M${cx - rx} ${b1} A${rx} ${ry} 0 0 0 ${cx + rx} ${b1} M${cx - rx} ${b2} A${rx} ${ry} 0 0 0 ${cx + rx} ${b2}`);
        [top, gloss].forEach((e) => { e.setAttribute("cx", cx); e.setAttribute("cy", cyt); e.setAttribute("rx", rx); e.setAttribute("ry", ry); });
        shadow.setAttribute("cx", cx); shadow.setAttribute("cy", cyb); shadow.setAttribute("rx", rx * 1.15); shadow.setAttribute("ry", ry * 1.15);
        shadow.style.opacity = 0.22;
        return this;
      },
      theme(t) { g.setAttribute("class", "iso-box iso-cyl t-" + t); return this; }
    };
  }

  /** Awan (cloud) di titik dunia; ukuran skala layar. */
  function cloud(parent, o = {}) {
    const g = el("g", { class: "iso-cloud" }, parent);
    const inner = el("g", null, g);
    if (o.drop != null) dropIn(inner, o.drop, 30);
    el("path", { class: "cloud-body", d: "M-58 14 C-80 14 -82 -14 -60 -18 C-62 -44 -26 -52 -12 -32 C-2 -58 44 -56 46 -24 C72 -28 80 10 56 14 Z" }, inner);
    el("path", { class: "cloud-gloss", d: "M-50 -10 C-48 -30 -24 -36 -14 -22 C-4 -42 30 -42 36 -22", fill: "none" }, inner);
    let placed = false;
    return {
      g,
      at(x, y, z, scale = 1) {
        const [sx, sy] = P(x, y, z);
        if (!placed) { g.style.transition = "none"; requestAnimationFrame(() => requestAnimationFrame(() => (g.style.transition = ""))); placed = true; }
        g.style.transform = `translate(${sx}px, ${sy}px) scale(${scale})`;
        return this;
      }
    };
  }

  /** Ubin datar di lantai (untuk menandai slot/zona). */
  function tile(parent, o = {}) {
    const p = el("polygon", { class: "iso-tile " + (o.cls || "") }, parent);
    return {
      el: p,
      set(x, y, w, d, z = 0) { p.setAttribute("points", pts([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)])); return this; },
      cls(c) { p.setAttribute("class", "iso-tile " + c); return this; }
    };
  }

  /** Label pil yang menempel pada titik dunia. Posisi bergerak halus lewat transisi CSS. */
  function pill(parent, o = {}) {
    const g = el("g", { class: "iso-pill " + (o.cls || "") }, parent);
    const inner = el("g", null, g);
    const r = el("rect", { rx: 12, ry: 12, height: 24 }, inner);
    const dot = o.dot ? el("circle", { r: 5, cy: 12, fill: o.dot, class: "iso-pill-dot" }, inner) : null;
    const t = el("text", { y: 16.5 }, inner);
    if (o.drop != null) dropIn(inner, o.drop, 24);
    let cur = null, placed = false;
    const api = {
      g,
      text(s) {
        if (s === cur) return api;
        cur = s; t.textContent = s;
        let tw = 0;
        try { tw = t.getComputedTextLength(); } catch (e) { /* belum dirender */ }
        if (!tw) tw = s.length * 7.6;
        const w = Math.max(28, tw + 24 + (dot ? 14 : 0));
        r.setAttribute("width", w); r.setAttribute("x", -w / 2); t.setAttribute("x", dot ? 7 : 0);
        if (dot) dot.setAttribute("cx", -w / 2 + 13);
        return api;
      },
      at(x, y, z, dy = 0) {
        const [sx, sy] = P(x, y, z);
        if (!placed) { g.style.transition = "none"; requestAnimationFrame(() => requestAnimationFrame(() => (g.style.transition = ""))); placed = true; }
        g.style.transform = `translate(${sx.toFixed(1)}px, ${(sy + dy - 12).toFixed(1)}px)`;
        return api;
      },
      cls(c) { g.setAttribute("class", "iso-pill " + c); return api; },
      show(v) { g.style.opacity = v ? 1 : 0; return api; }
    };
    if (o.text) api.text(o.text);
    return api;
  }

  /** Garis/busur antar dua titik dunia, dengan panah dan paket yang mengalir bolak-balik. */
  function connector(parent, arrow) {
    const g = el("g", { class: "iso-conn" }, parent);
    const path = el("path", { class: "iso-line" }, g);
    let packets = [];
    return {
      g,
      set(o) {
        const a = P(...o.from), b = P(...o.to);
        const lift = (o.arc || 0) * U;
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - lift;
        const d = lift ? `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}` : `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
        const back = lift ? `M${b[0]} ${b[1]} Q${mx} ${my} ${a[0]} ${a[1]}` : `M${b[0]} ${b[1]} L${a[0]} ${a[1]}`;
        path.setAttribute("d", d);
        path.setAttribute("class", "iso-line" + (o.dashed ? " dashed" : ""));
        if (arrow) {
          path.setAttribute("marker-end", arrow);
          if (o.both) path.setAttribute("marker-start", arrow); else path.removeAttribute("marker-start");
        }
        packets.forEach((p) => p.remove()); packets = [];
        if (o.packets && !reduceMotion) {
          const dur = o.dur || 1.4;
          packets.push(packet(g, d, "go", dur, 0));
          if (o.both !== false) packets.push(packet(g, back, "back", dur, dur / 2));
        }
        g.style.opacity = 1;
        return this;
      },
      hide() { g.style.opacity = 0; packets.forEach((p) => p.remove()); packets = []; return this; }
    };
  }

  function packet(parent, d, kind, dur, begin) {
    const c = el("g", { class: "iso-packet " + kind }, parent);
    el("circle", { r: 9, class: "halo" }, c);
    el("circle", { r: 5, class: "core" }, c);
    // begin relatif terhadap waktu dokumen: dua paket tetap berselang setengah siklus
    el("animateMotion", { dur: dur + "s", begin: begin + "s", repeatCount: "indefinite", path: d, keyPoints: "0;1", keyTimes: "0;1", calcMode: "spline", keySplines: ".4 0 .2 1" }, c);
    return c;
  }

  window.Iso = { U, C, S, P, el, tween, ease, scene, box, cylinder, cloud, tile, pill, connector, dropIn, sparkle, reduceMotion };
})();
