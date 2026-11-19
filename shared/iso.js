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
    const pat = el("pattern", { id: id + "-grid", width: (2 * C * U).toFixed(2), height: U, patternUnits: "userSpaceOnUse" }, defs);
    el("path", { d: `M0 0 L${2 * C * U} ${U} M${2 * C * U} 0 L0 ${U}`, class: "iso-gridline" }, pat);
    const mk = el("marker", { id: id + "-arrow", viewBox: "0 0 10 10", refX: 8.5, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 1 L9 5 L0 9 z", class: "iso-arrowhead" }, mk);
    el("rect", { x: -4000, y: -4000, width: 8000, height: 8000, fill: `url(#${id}-grid)`, class: "iso-bg" }, svg);
    const root = el("g", { class: "iso-root" }, svg);
    const layers = {};
    ["floor", "obj", "conn", "label", "fx"].forEach((n) => (layers[n] = el("g", { class: "iso-" + n }, root)));
    const camera = makeCamera(svg);
    return { svg, root, layers, camera, arrow: `url(#${id}-arrow)` };
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
    const shadow = el("polygon", { class: "iso-shadow" }, inner);
    const left = el("polygon", { class: "f-left" }, inner);
    const right = el("polygon", { class: "f-right" }, inner);
    const top = el("polygon", { class: "f-top" }, inner);
    const s = { x: 0, y: 0, z: 0, w: 1, d: 1, h: 1, base: 0 };
    return {
      g, state: s,
      set(n) {
        Object.assign(s, n);
        const { x, y, z, w, d, h, base } = s;
        top.setAttribute("points", pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
        left.setAttribute("points", pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
        right.setAttribute("points", pts([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
        const lift = Math.max(0, z - base);
        shadow.setAttribute("points", pts([P(x, y, base), P(x + w, y, base), P(x + w, y + d, base), P(x, y + d, base)]));
        shadow.style.opacity = Math.min(0.6, lift * 0.9).toFixed(2);
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
    const t = el("text", { y: 16.5 }, inner);
    if (o.drop != null) dropIn(inner, o.drop, 24);
    let cur = null, placed = false;
    const api = {
      g,
      text(s) {
        if (s === cur) return api;
        cur = s; t.textContent = s;
        const w = Math.max(28, s.length * 7.4 + 22);
        r.setAttribute("width", w); r.setAttribute("x", -w / 2); t.setAttribute("x", 0);
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
    const c = el("circle", { r: 5.5, class: "iso-packet " + kind }, parent);
    // begin relatif terhadap waktu dokumen: dua paket tetap berselang setengah siklus
    el("animateMotion", { dur: dur + "s", begin: begin + "s", repeatCount: "indefinite", path: d, keyPoints: "0;1", keyTimes: "0;1", calcMode: "spline", keySplines: ".4 0 .2 1" }, c);
    return c;
  }

  window.Iso = { U, C, S, P, el, tween, ease, scene, box, tile, pill, connector, dropIn, reduceMotion };
})();
