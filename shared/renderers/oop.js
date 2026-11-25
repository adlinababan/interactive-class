/* Renderer "oop" (isometrik) — untuk pelajaran class, objek, dan inheritance.
 *
 * Tata letak memakai koordinat (u, v): u = ke kanan di layar, v = ke bawah (ke depan).
 * Frame (keadaan panggung):
 *   classes: [{ id, title, u, v, theme, parent, members: [{ id, label, kind: "attr"|"method" }] }]
 *   objects: [{ id, title, u, v, theme, attrs: [[nama, nilai], ...] }]
 *   vars:    [{ id, u, v, to }]            tag variabel di lantai + panah ke objek
 *   loose:   [{ id, text, u, v, z }]       variabel lepas (tanpa class)
 *   links:   [{ from, to, label, dashed }] panah tambahan antar-anchor
 *   crowd:   { n, cols, u, v, theme, label }  banyak objek kecil (kasus skala)
 *   flow:    { path: [anchor...], kind: "go"|"err" }  jalur pemanggilan yang dianimasikan
 *   marks:   { anchor: "hl"|"chg"|"err"|"ok"|"new"|"miss"|"over"|"ghost" }
 *   out:     ["baris output", ...]          isi konsol (baris diawali "!" = error)
 *   code, line, note, tone, metrics
 * Anchor: "v:my_dog", "o:o1", "o:o1.a:name", "c:Dog", "c:Dog.m:sit".
 */
(function () {
  "use strict";
  const { h, esc } = Kelas.util;
  const W = (u, v) => [u + v, -u + v];          // (u, v) → koordinat dunia (x, y)
  const CLS = { w: 1.6, h: 0.7 }, OBJ = { w: 1.05, h: 0.75 }, STEP = 0.64;

  const KW = /\b(class|def|for|in|if|elif|else|not|and|or|return|break|while|True|False|None|import|from|as|pass|self|super)\b/g;
  const BI = /\b(print|len|range|isinstance)\b/g;
  function highlight(line) {
    const m = line.match(/^(.*?)(#[^"']*)?$/);
    const parts = m[1].split(/(f?"[^"]*"|'[^']*')/);
    let s = parts.map((p, i) => (i % 2
      ? '<span class="st">' + esc(p) + "</span>"
      : esc(p).replace(KW, '<span class="kw">$1</span>').replace(BI, '<span class="nb">$1</span>'))).join("");
    s = s.replace(/(<span class="kw">(?:def|class)<\/span> )([A-Za-z_]+)/, '$1<span class="fn">$2</span>');
    if (m[2]) s += '<span class="cm">' + esc(m[2]) + "</span>";
    return s;
  }

  // Java (lesson.lang = "java")
  const JKW = /\b(abstract|class|interface|extends|implements|new|public|private|protected|static|final|void|return|if|else|for|while|this|super|instanceof|import|package|default)\b/g;
  const JTY = /\b(int|double|float|long|boolean|char|String|Object|Integer|Double)\b/g;
  function highlightJava(line) {
    const m = line.match(/^(.*?)(\/\/.*)?$/);
    const parts = m[1].split(/("[^"]*")/);
    let s = parts.map((p, i) => (i % 2
      ? '<span class="st">' + esc(p) + "</span>"
      : esc(p).replace(JKW, '<span class="kw">$1</span>').replace(JTY, '<span class="nb">$1</span>')
          .replace(/(@[A-Za-z]+)/g, '<span class="an">$1</span>').replace(/\b(System\.out\.println)\b/g, '<span class="nb">$1</span>'))).join("");
    s = s.replace(/(<span class="kw">(?:class|interface)<\/span> )([A-Za-z_]+)/, '$1<span class="fn">$2</span>');
    if (m[2]) s += '<span class="cm">' + esc(m[2]) + "</span>";
    return s;
  }

  let st = null;

  // titik kamera untuk pil: ikut lebar teksnya agar tidak terpotong di tepi panggung
  function camPill(cam, x, y, z, text) {
    const half = (String(text).length * 7.6) / 2 + 16;
    const k = half / (2 * Iso.C * Iso.U);
    cam.push([x + k, y - k, z + 0.6], [x - k, y + k, z + 0.6], [x - k, y + k, z - 0.1]);
  }

  Kelas.registerRenderer("oop", {
    mount(stage, lesson) {
      const root = h("div", { class: "sv oop" });
      const sceneWrap = h("div", { class: "sv-scene" });
      const live = h("div", { class: "sr-only", "aria-live": "polite" });
      sceneWrap.append(live);
      const sc = Iso.scene(sceneWrap, { label: "Diagram class dan objek" });
      const note = Iso.pill(sc.layers.fx, { cls: "note" }).show(false);
      const code = h("pre", { class: "sv-code", "aria-label": lesson.lang === "java" ? "Kode Java" : "Kode Python" });
      const out = h("div", { class: "oop-out", "aria-label": "Output program" }, h("h5", null, "OUTPUT"), h("div", { class: "oop-lines" }));
      root.append(sceneWrap, h("div", { class: "sv-bottom oop-bottom" }, code, out));
      stage.innerHTML = "";
      stage.append(root);
      st = { lesson, sc, root, live, note, codeEl: code, outEl: out.lastChild, els: new Map(), anchors: {}, code: null, outLines: [], flow: null, camKey: "" };
    },

    render(f, opts) {
      if (!st) return;
      const instant = !!opts.instant;
      const before = new Set(st.els.keys()), prevFlow = st.flowKey, prevOut = (st.outLines || []).slice(), prevMarks = st.prevMarks || {};
      const seen = new Set();
      st.anchors = {};
      const marks = f.marks || {};
      const camPts = [];

      (f.classes || []).forEach((c) => renderClass(c, marks, instant, seen, camPts));
      (f.objects || []).forEach((o) => renderObject(o, marks, instant, seen, camPts));
      if (f.crowd) renderCrowd(f.crowd, instant, seen, camPts);
      (f.loose || []).forEach((l) => renderLoose(l, marks, instant, seen, camPts));
      (f.vars || []).forEach((v) => renderVar(v, marks, instant, seen, camPts));
      const java = st.lesson.lang === "java";
      (f.classes || []).forEach((c) => c.parent && renderLink({ id: "inh:" + c.id, from: "c:" + c.id + ".base", to: "c:" + c.parent + ".base", label: c.extLabel === false ? null : java ? "extends" : "mewarisi", inherit: true }, instant, seen));
      (f.classes || []).forEach((c) => (c.impl || []).forEach((t, i) => renderLink({ id: "imp:" + c.id + ":" + t, from: "c:" + c.id + ".base", to: "c:" + t + ".base", label: "implements", inherit: true, impl: true, lift: i }, instant, seen)));
      (f.links || []).forEach((l, i) => renderLink({ id: "lk:" + (l.id || i), ...l }, instant, seen));

      // hapus yang tidak lagi ada
      for (const [id, e] of st.els) if (!seen.has(id)) { st.els.delete(id); removeEl(e, instant); }

      renderFlow(f.flow);
      renderNote(f, camPts);
      fitCamera(camPts, instant);
      renderCode(f);
      renderOut(f.out || [], instant);
      st.live.textContent = f.note || "";
      if (!instant) playSounds(f, before, prevFlow, prevOut, prevMarks);
      st.prevMarks = f.marks || {};
      st.prevNote = f.note || "";
    },

    unmount() { st = null; }
  });

  // ---------- suara (aktif bila halaman memuat shared/sfx.js) ----------
  function playSounds(f, before, prevFlow, prevOut, prevMarks) {
    if (!window.Sfx) return;
    let drops = 0;
    for (const id of st.els.keys()) {
      if (before.has(id) || drops >= 6) continue;
      if (id.startsWith("c:")) Sfx.play("drop", { pitch: 0.8 });
      else if (id.startsWith("o:")) { Sfx.play("drop", { pitch: 1.1 }); Sfx.play("sparkle", { delay: 0.65 }); }
      else continue;
      drops++;
    }
    if (f.flow && st.flowKey !== prevFlow) Sfx.play(f.flow.kind === "err" ? "err" : "req", { delay: 0.1 });
    const marks = f.marks || {};
    const changed = (v) => Object.keys(marks).some((k) => marks[k] === v && prevMarks[k] !== v);
    const ok = changed("ok"), out = f.out || [];
    let same = 0;
    while (same < prevOut.length && same < out.length && prevOut[same] === out[same]) same++;
    const fresh = out.slice(same), errOut = fresh.some((ln) => ln.startsWith("!"));
    const err = changed("err") || errOut;
    if (err && !(f.flow && f.flow.kind === "err")) Sfx.play("err", { delay: 0.35 });   // satu bunyi error per frame
    else if (ok) Sfx.play("ok", { delay: 0.6 });
    else if (changed("new")) Sfx.play("link", { delay: 0.3 });
    fresh.filter((ln) => !ln.startsWith("!")).slice(0, 3).forEach((ln, i) => Sfx.play("data", { delay: 0.75 + i * 0.15 }));
    if ((f.note || "") !== (st.prevNote || "") && f.note && !ok && !err) {
      if (f.tone === "alert") Sfx.play("alert", { delay: 0.2 });
      else if (f.tone === "done") Sfx.play("done", { delay: 0.4 });
    }
  }

  // ---------- elemen ----------
  function getEl(id, make, instant, seen) {
    seen.add(id);
    let e = st.els.get(id);
    if (!e) { e = make(instant ? null : 0); st.els.set(id, e); e.fresh = true; } else e.fresh = false;
    return e;
  }
  function removeEl(e, instant) {
    const nodes = e.nodes || [];
    if (instant || Iso.reduceMotion) { nodes.forEach((n) => n.remove()); return; }
    nodes.forEach((n) => {
      const a = n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" });
      a.onfinish = () => n.remove();
    });
  }
  const markCls = (m) => (m ? " m-" + m : "");

  function renderClass(c, marks, instant, seen, cam) {
    const [x, y] = W(c.u, c.v);
    const id = "c:" + c.id;
    const e = getEl(id, (d) => {
      const base = Iso.box(st.sc.layers.obj, { theme: c.theme || "blue", cls: "cls-box", drop: d });
      const head = Iso.pill(st.sc.layers.label, { cls: "cls-head", drop: d == null ? null : d + 200 });
      return { base, head, mem: {}, nodes: [base.g, head.g] };
    }, instant, seen);
    const abs = c.kind === "abstract" || c.kind === "interface";
    e.base.theme((c.theme || "blue") + (abs ? " abs" : "") + (marks[id] === "miss" ? " miss" : "")).set({ x: x - CLS.w / 2, y: y - CLS.w / 2, z: 0, w: CLS.w, d: CLS.w, h: CLS.h, base: 0 });
    const mems = c.members || [];
    const zBase = CLS.h + 0.55, zHead = zBase + mems.length * STEP;
    const headText = (c.kind === "interface" ? "interface " : c.kind === "abstract" ? "abstract class " : "class ") + (c.title || c.id);
    e.head.text(headText).cls("cls-head" + (abs ? " abs " + c.kind : "") + markCls(marks[id])).at(x, y, zHead);
    st.anchors[id] = [x, y, zHead];
    st.anchors[id + ".base"] = [x, y, CLS.h * 0.55];
    cam.push([x - 1.3, y - 1.3, 0], [x + 1.3, y + 1.3, 0]);
    camPill(cam, x, y, zHead, headText);
    const keep = new Set();
    mems.forEach((m, k) => {
      const mid = id + ".m:" + m.id;
      keep.add(mid);
      let p = e.mem[mid];
      if (!p) {
        p = Iso.pill(st.sc.layers.label, { cls: "mem", drop: instant ? null : 300 + k * 70 });
        e.mem[mid] = p; e.nodes.push(p.g);
      }
      const z = zBase + (mems.length - 1 - k) * STEP;
      p.text(m.label).cls("mem " + (m.kind || "method") + markCls(marks[mid])).at(x, y, z).show(true);
      st.anchors[mid] = [x, y, z];
      camPill(cam, x, y, z, m.label);
    });
    for (const mid in e.mem) if (!keep.has(mid)) { e.mem[mid].g.remove(); e.nodes = e.nodes.filter((n) => n !== e.mem[mid].g); delete e.mem[mid]; }
  }

  function renderObject(o, marks, instant, seen, cam) {
    const [x, y] = W(o.u, o.v);
    const id = "o:" + o.id;
    const e = getEl(id, (d) => {
      const pad = Iso.box(st.sc.layers.floor, { theme: "board", cls: "board", drop: d });
      const box = Iso.box(st.sc.layers.obj, { theme: o.theme || "sand", drop: d == null ? null : d + 120 });
      const head = Iso.pill(st.sc.layers.label, { cls: "obj-head", drop: d == null ? null : d + 320 });
      return { pad, box, head, at: {}, nodes: [pad.g, box.g, head.g] };
    }, instant, seen);
    if (e.fresh && !instant) setTimeout(() => st && Iso.sparkle(st.sc.layers.fx, x, y, OBJ.h + 0.2, "#6366f1", 10), 650);
    const err = marks[id] === "err";
    e.pad.set({ x: x - 0.75, y: y - 0.75, z: -0.25, w: 1.5, d: 1.5, h: 0.25, base: -0.25 });
    e.box.theme(err ? "rose" : o.theme || "sand").set({ x: x - OBJ.w / 2, y: y - OBJ.w / 2, z: 0, w: OBJ.w, d: OBJ.w, h: OBJ.h, base: 0 });
    const attrs = o.attrs || [];
    const zBase = OBJ.h + 0.55, zHead = zBase + attrs.length * STEP;
    e.head.text(o.title || o.id).cls("obj-head" + markCls(marks[id])).at(x, y, zHead);
    st.anchors[id] = [x, y, zHead];
    st.anchors[id + ".base"] = [x, y, OBJ.h * 0.5];
    cam.push([x - 1.2, y - 1.2, 0], [x + 1.2, y + 1.2, 0]);
    camPill(cam, x, y, zHead, o.title || o.id);
    const keep = new Set();
    attrs.forEach(([name, val], k) => {
      const aid = id + ".a:" + name;
      keep.add(aid);
      let p = e.at[aid];
      if (!p) {
        p = Iso.pill(st.sc.layers.label, { cls: "attr-val", drop: instant || e.fresh ? (instant ? null : 520 + k * 110) : 0 });
        e.at[aid] = p; e.nodes.push(p.g);
      }
      const z = zBase + (attrs.length - 1 - k) * STEP;
      p.text(name + " = " + val).cls("attr-val" + markCls(marks[aid])).at(x, y, z).show(true);
      st.anchors[aid] = [x, y, z];
      camPill(cam, x, y, z, name + " = " + val);
    });
    for (const aid in e.at) if (!keep.has(aid)) { e.at[aid].g.remove(); e.nodes = e.nodes.filter((n) => n !== e.at[aid].g); delete e.at[aid]; }
  }

  function renderCrowd(cr, instant, seen, cam) {
    const n = Math.min(cr.n, cr.show || 30), cols = cr.cols || 6;
    for (let i = 0; i < n; i++) {
      const u = cr.u + (i % cols) * 0.95, v = cr.v + Math.floor(i / cols) * 0.95;
      const [x, y] = W(u, v);
      const e = getEl("cr:" + i, (d) => {
        const b = Iso.box(st.sc.layers.obj, { theme: cr.theme || "sand", drop: d == null ? null : d + i * 25 });
        return { b, nodes: [b.g] };
      }, instant, seen);
      e.b.set({ x: x - 0.25, y: y - 0.25, z: 0, w: 0.5, d: 0.5, h: 0.42, base: 0 });
      cam.push([x - 0.4, y - 0.4, 0], [x + 0.4, y + 0.4, 0]);
    }
    const lu = cr.u + ((cols - 1) * 0.95) / 2, lv = cr.v - 0.2;
    const [lx, ly] = W(lu, lv);
    const e = getEl("cr:label", (d) => {
      const p = Iso.pill(st.sc.layers.label, { cls: "obj-head", drop: d == null ? null : d + 400 });
      return { p, nodes: [p.g] };
    }, instant, seen);
    e.p.text(cr.label).at(lx, ly, 1.6);
    st.anchors["crowd"] = [lx, ly, 1.6];
    cam.push([lx, ly, 2.2]);
  }

  function renderLoose(l, marks, instant, seen, cam) {
    const [x, y] = W(l.u, l.v);
    const id = "l:" + l.id;
    const e = getEl(id, (d) => {
      const p = Iso.pill(st.sc.layers.label, { cls: "loose", drop: d });
      return { p, nodes: [p.g] };
    }, instant, seen);
    e.p.text(l.text).cls("loose" + (l.cls ? " " + l.cls : "") + markCls(marks[id])).at(x, y, l.z || 0.6);
    st.anchors[id] = [x, y, l.z || 0.6];
    camPill(cam, x, y, l.z || 0.6, l.text);
    cam.push([x, y, 0]);
  }

  function renderVar(v, marks, instant, seen, cam) {
    const [x, y] = W(v.u, v.v);
    const id = "v:" + v.id;
    const e = getEl(id, (d) => {
      const p = Iso.pill(st.sc.layers.label, { cls: "var", drop: d == null ? null : d + 500 });
      const c = Iso.connector(st.sc.layers.conn, st.sc.arrow);
      c.hide();
      return { p, c, nodes: [p.g, c.g] };
    }, instant, seen);
    e.p.text(v.label || v.id).cls("var" + markCls(marks[id])).at(x, y, 0);
    st.anchors[id] = [x, y, 0.15];
    camPill(cam, x, y, 0, v.label || v.id);
    cam.push([x, y + 0.5, 0]);
    const target = v.to && (st.anchors["o:" + v.to + ".base"] || st.anchors["o:" + v.to] || st.anchors[v.to]);
    if (target) e.c.set({ from: [x, y, 0.35], to: [target[0] + 0.3, target[1] + 0.3, 0.25], arc: 0.25, dashed: false });
    else e.c.hide();
  }

  function renderLink(l, instant, seen) {
    const a = st.anchors[l.from], b = st.anchors[l.to];
    const e = getEl(l.id, () => {
      const c = Iso.connector(st.sc.layers.conn, st.sc.arrow);
      const p = Iso.pill(st.sc.layers.label, { cls: "link-label" });
      return { c, p, nodes: [c.g, p.g] };
    }, instant, seen);
    if (!a || !b) { e.c.hide(); e.p.show(false); return; }
    const arc = l.impl ? 0.75 + (l.lift || 0) * 0.4 : l.inherit ? 0.35 : 0.6;
    // panah warisan berjalan di depan balok (bukan di antara tumpukan label)
    const f0 = l.inherit ? [a[0] + 0.9, a[1] + 0.9, a[2]] : a, t0 = l.inherit ? [b[0] + 0.9, b[1] + 0.9, b[2]] : b;
    e.c.set({ from: f0, to: t0, arc, dashed: !!l.dashed || l.inherit });
    if (l.label) {
      // label panah pewarisan diletakkan lebih dekat ke induk agar tidak menutupi anggota class anak
      const k = l.inherit ? 0.8 : 0.5;
      const mx = f0[0] + (t0[0] - f0[0]) * k, my = f0[1] + (t0[1] - f0[1]) * k, mz = f0[2] + (t0[2] - f0[2]) * k + arc * 0.5;
      e.p.text(l.label).cls("link-label" + (l.inherit ? " inherit" : "") + (l.impl ? " impl" : "")).at(mx, my, mz).show(true);
    } else e.p.show(false);
  }

  // Jalur pemanggilan: satu path melalui beberapa anchor, paket berulang dari awal ke akhir
  function renderFlow(fl) {
    const key = fl ? JSON.stringify(fl) : "";
    if (st.flowKey === key && st.flow) return;
    st.flowKey = key;
    if (st.flow) { st.flow.remove(); st.flow = null; }
    if (!fl) return;
    const pts = fl.path.map((a) => st.anchors[a]).filter(Boolean).map((p) => Iso.P(p[0], p[1], p[2]));
    if (pts.length < 2) return;
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const lift = Math.min(70, 26 + Math.hypot(bx - ax, by - ay) * 0.18);
      d += ` Q${((ax + bx) / 2).toFixed(1)} ${(Math.min(ay, by) - lift).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    }
    const g = Iso.el("g", { class: "oop-flow " + (fl.kind || "go") }, st.sc.layers.conn);
    Iso.el("path", { d, class: "oop-flow-line" }, g);
    if (!Iso.reduceMotion) {
      const dur = Math.max(1.2, pts.length * 0.75);
      [0, dur / 2].forEach((begin) => {
        const p = Iso.el("g", { class: "iso-packet " + (fl.kind === "err" ? "err" : "go") }, g);
        Iso.el("circle", { r: 9, class: "halo" }, p);
        Iso.el("circle", { r: 5, class: "core" }, p);
        Iso.el("animateMotion", { dur: dur + "s", begin: begin + "s", repeatCount: "indefinite", path: d, calcMode: "linear" }, p);
      });
    }
    st.flow = g;
  }

  function renderNote(f, camPts) {
    // slot catatan default: di atas tengah panggung; selalu ikut dibingkai kamera agar tidak meloncat
    const xs = camPts.map((p) => p[0] - p[1]), ys = camPts.map((p) => (p[0] + p[1]) * 0.5 - p[2]);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2, top = Math.min(...ys);
    const slot = [mid / 2, -mid / 2, 0.75 - top];
    camPts.push([slot[0], slot[1], slot[2] + 0.6]);
    if (f.note) camPill(camPts, slot[0], slot[1], slot[2], f.note);
    if (!f.note) { st.note.show(false); return; }
    const a = f.noteAt && st.anchors[f.noteAt];
    const [x, y, z] = a ? [a[0], a[1], a[2] + 1.0] : slot;
    st.note.text(f.note).cls("note " + (f.tone || "")).at(x, y, z).show(true);
    if (a) camPill(camPts, x, y, z, f.note);
  }

  function fitCamera(pts, instant) {
    if (!pts.length) return;
    const key = pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(";");
    if (key === st.camKey) return;
    const first = !st.camKey;
    st.camKey = key;
    st.sc.camera.fit(pts, { pad: 16, minAspect: 1.55, instant: instant || first, dur: 800 });
  }

  function renderCode(f) {
    const versions = st.lesson.code;
    const ver = f.code || Object.keys(versions)[0];
    if (st.code !== ver) {
      st.code = ver;
      st.codeEl.innerHTML = "";
      versions[ver].forEach(([id, text], i) => {
        st.codeEl.append(h("div", { class: "ln" + (id && id.startsWith("+") ? " new" : ""), "data-id": id || "", html: "<i>" + (i + 1) + "</i><span>" + (text ? (st.lesson.lang === "java" ? highlightJava(text) : highlight(text)) : "&nbsp;") + "</span>" }));
      });
    }
    let cur = null;
    [...st.codeEl.children].forEach((ln) => {
      const id = ln.dataset.id.replace(/^\+/, "");
      const on = !!f.line && id === String(f.line).replace(/^\+/, "");
      ln.classList.toggle("cur", on);
      if (on) cur = ln;
    });
    if (cur) {
      const box = st.codeEl;
      const top = cur.offsetTop - box.clientHeight / 2 + cur.clientHeight / 2;
      box.scrollTo({ top: Math.max(0, top), behavior: Iso.reduceMotion ? "auto" : "smooth" });
    }
  }

  function renderOut(lines, instant) {
    const el = st.outEl, prev = st.outLines || [];
    let same = 0;
    while (same < prev.length && same < lines.length && prev[same] === lines[same]) same++;
    if (same < prev.length) { [...el.querySelectorAll(".ol")].slice(same).forEach((n) => n.remove()); }
    const ph = el.querySelector(".empty");
    if (ph) ph.remove();
    for (let i = same; i < lines.length; i++) {
      const err = lines[i].startsWith("!");
      el.append(h("div", { class: "ol" + (err ? " err" : "") + (instant ? "" : " fresh") }, err ? lines[i].slice(1) : lines[i]));
    }
    st.outLines = lines.slice();
    if (!lines.length) el.append(h("div", { class: "ol empty" }, "(belum ada output)"));
    el.scrollTop = el.scrollHeight;
  }

  /** Penyusun frame: ubah keadaan lalu ambil potret. Metrik dihitung otomatis lewat metricsOf. */
  window.OOPStory = function (init, metricsOf) {
    const s = JSON.parse(JSON.stringify(init));
    let buf = [];
    return {
      s,
      snap(extra) {
        const fr = JSON.parse(JSON.stringify(Object.assign({}, s, extra || {})));
        if (metricsOf) fr.metrics = metricsOf(fr);
        buf.push(fr);
        return fr;
      },
      take() { const out = buf; buf = []; return out; },
      obj(id) { return s.objects.find((o) => o.id === id); },
      cls(id) { return s.classes.find((c) => c.id === id); },
      setAttr(oid, name, val) {
        const o = this.obj(oid), a = o.attrs.find((p) => p[0] === name);
        if (a) a[1] = val; else o.attrs.push([name, val]);
      }
    };
  };
})();
