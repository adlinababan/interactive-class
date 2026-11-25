/* Renderer "db" — untuk pelajaran basis data (SQL, indeks, halaman disk).
 *
 * Frame:
 *   items: [ ... ]   isi panggung, ditata berjajar (flex-wrap) sesuai urutan
 *     { id, type: "table", title, cap, cols, rows, state: { idx: "hl"|"ok"|"out"|"err"|"new"|"dim" }, group: [g|null per baris] }
 *     { id, type: "pages", title, cap, n, cols, read: [idx urut], hit: [idx], scale }   halaman disk (1 kotak = scale halaman)
 *     { id, type: "tree",  title, cap, levels: [[{ id, keys: [] , parent }]], path: [nodeId], hit: nodeId }
 *     { id, type: "bars",  title, cap, unit, items: [{ label, value, tone }] }
 *     { id, type: "badge", title, value, unit, tone }
 *     { id, type: "flow",  text }   panah kecil penghubung ("→ WHERE")
 *   sql: versi kode (kunci lesson.code), line: id baris atau [id, ...]
 *   result: { cols, rows, state } | null     tabel hasil di panel kanan bawah
 *   out: ["baris"] teks di panel hasil (awalan "!" = error, "#" = rencana eksekusi)
 *   note, tone, metrics
 */
(function () {
  "use strict";
  const { h, esc } = Kelas.util;
  let st = null;

  const KW = /\b(SELECT|DISTINCT|FROM|WHERE|GROUP|BY|HAVING|ORDER|ASC|DESC|AND|OR|NOT|IN|EXISTS|UNIQUE|ANY|ALL|UNION|INTERSECT|EXCEPT|AS|ON|JOIN|LEFT|RIGHT|OUTER|INNER|IS|NULL|BETWEEN|LIKE|CREATE|INDEX|TABLE|VIEW|TRIGGER|ASSERTION|INSERT|INTO|VALUES|UPDATE|SET|DELETE|DROP|ALTER|ADD|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|CHECK|DEFAULT|AFTER|BEFORE|INSTEAD|OF|FOR|EACH|ROW|BEGIN|END|IF|THEN|ELSE|RETURN|RAISERROR|ROLLBACK|TRANSACTION|DECLARE|EXPLAIN|ANALYZE|CLUSTER|USING|INCLUDE|CASE|WHEN|TRUE|FALSE|UNKNOWN|INTEGER|INT|REAL|CHAR|VARCHAR|DATE|NUMERIC|PRINT)\b/g;
  const FN = /\b(COUNT|SUM|AVG|MIN|MAX|COALESCE)\b/g;
  function highlight(line) {
    const m = line.match(/^(.*?)(--.*)?$/);
    const parts = m[1].split(/('[^']*')/);
    let s = parts.map((p, i) => (i % 2 ? '<span class="st">' + esc(p) + "</span>"
      : esc(p).replace(FN, '<span class="nb">$1</span>').replace(KW, '<span class="kw">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>'))).join("");
    if (m[2]) s += '<span class="cm">' + esc(m[2]) + "</span>";
    return s;
  }

  Kelas.registerRenderer("db", {
    mount(stage, lesson) {
      const root = h("div", { class: "sv db" });
      const scene = h("div", { class: "sv-scene db-scene" });
      const note = h("div", { class: "db-note", hidden: true });
      const board = h("div", { class: "db-board" });
      const live = h("div", { class: "sr-only", "aria-live": "polite" });
      scene.append(note, board, live);
      const code = h("pre", { class: "sv-code db-code", "aria-label": "Kode SQL" });
      const res = h("div", { class: "db-res", "aria-label": "Hasil query" }, h("h5", null, "HASIL"), h("div", { class: "db-res-body" }));
      root.append(scene, h("div", { class: "sv-bottom db-bottom" }, code, res));
      stage.innerHTML = "";
      stage.append(root);
      st = { lesson, root, scene, note, board, live, codeEl: code, resEl: res.lastChild, items: new Map(), code: null, prev: null, resKey: "", outKey: "" };
      st.onResize = () => st && st.items.forEach((e) => e.type === "tree" && drawTreeLines(e));
      window.addEventListener("resize", st.onResize);
    },

    render(f, opts) {
      if (!st) return;
      const instant = !!opts.instant || Iso.reduceMotion;
      const prev = st.prev || {};
      const sounds = [];
      const items = f.items || [];
      const keep = new Set(items.map((it) => it.id));

      // keluarkan yang hilang
      for (const [id, e] of st.items) if (!keep.has(id)) {
        st.items.delete(id);
        if (instant) e.el.remove();
        else { const a = e.el.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.96)" }], { duration: 220, fill: "forwards" }); a.onfinish = () => e.el.remove(); }
      }
      // buat / perbarui, jaga urutan
      items.forEach((it, i) => {
        let e = st.items.get(it.id);
        if (!e || e.type !== it.type) {
          if (e) e.el.remove();
          e = { type: it.type, el: h("div", { class: "db-item db-" + it.type }) };
          st.items.set(it.id, e);
          e.fresh = true;
          if (!instant) { sounds.push(["drop", { pitch: 0.9 + i * 0.08 }]); e.el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, delay: 60 * i, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }); }
        } else e.fresh = false;
        const at = st.board.children[i];
        if (at !== e.el) st.board.insertBefore(e.el, at || null);
        e.el.style.flexBasis = it.w ? it.w + "px" : "";
        RENDER[it.type](e, it, instant, sounds);
      });

      renderNote(f, instant);
      renderCode(f);
      renderResult(f, instant, sounds);
      st.live.textContent = f.note || "";

      if (!instant && window.Sfx) {
        if ((f.note || "") !== (prev.note || "") && f.note) {
          if (f.tone === "alert") sounds.push(["alert", { delay: 0.2 }]);
          else if (f.tone === "done") sounds.push(["done", { delay: 0.45 }]);
        }
        const errs = sounds.some((s) => s[0] === "err");
        let drops = 0;
        sounds.forEach(([n, o]) => {
          if (n === "drop" && ++drops > 5) return;
          if (n === "done" && errs) return;
          Sfx.play(n, o);
        });
      }
      st.prev = f;
    },

    unmount() { if (st) window.removeEventListener("resize", st.onResize); st = null; }
  });

  // ---------- elemen panggung ----------
  const head = (e, it) => {
    if (!e.head) { e.head = h("div", { class: "db-head" }); e.el.prepend(e.head); }
    e.head.innerHTML = (it.title ? "<b>" + esc(it.title) + "</b>" : "") + (it.cap ? "<span>" + esc(it.cap) + "</span>" : "");
  };

  const RENDER = {
    table(e, it, instant, sounds) {
      head(e, it);
      if (!e.tbl) { e.tbl = h("table", { class: "db-tbl" }); e.el.append(e.tbl); e.rows = new Map(); }
      const colKey = JSON.stringify(it.cols);
      if (e.colKey !== colKey) {
        e.colKey = colKey;
        e.tbl.innerHTML = "";
        e.tbl.append(h("thead", null, h("tr", null, ...it.cols.map((c) => h("th", null, c)))), h("tbody"));
        e.rows = new Map();
      }
      const body = e.tbl.tBodies[0];
      // FLIP: catat posisi sebelum
      const before = new Map();
      if (!instant) e.rows.forEach((tr, k) => before.set(k, tr.getBoundingClientRect().top));
      const state = it.state || {}, group = it.group || [];
      const seen = new Set();
      const prevState = e.prevState || {};
      let nOut = 0, nHl = 0, nNew = 0;
      it.rows.forEach((r, i) => {
        const key = it.keys ? String(it.keys[i]) : String(r[0]) + "|" + i;
        seen.add(key);
        let tr = e.rows.get(key);
        if (!tr) {
          tr = h("tr");
          e.rows.set(key, tr);
          if (!instant && !e.fresh) { nNew++; tr.animate([{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: 40 * i, fill: "backwards" }); }
        }
        const cells = r.map((v) => (v === null ? '<td class="null">NULL</td>' : "<td>" + esc(String(v)) + "</td>")).join("");
        if (tr._c !== cells) { tr.innerHTML = cells; tr._c = cells; }
        const s = state[i] || "", g = group[i];
        tr.className = (s ? "r-" + s : "") + (g != null ? " g g" + (g % 6) : "");
        const ps = prevState[key];
        if (s && s !== ps) { if (s === "out") nOut++; else if (s === "hl" || s === "ok") nHl++; else if (s === "err") sounds.push(["err", { delay: 0.3 }]); }
        e._st = e._st || {}; e._st[key] = s;
        if (body.children[i] !== tr) body.insertBefore(tr, body.children[i] || null);
      });
      for (const [k, tr] of e.rows) if (!seen.has(k)) { e.rows.delete(k); tr.remove(); }
      e.prevState = Object.assign({}, e._st);
      if (!instant) {
        e.rows.forEach((tr, k) => {
          const t0 = before.get(k);
          if (t0 == null) return;
          const dy = t0 - tr.getBoundingClientRect().top;
          if (Math.abs(dy) > 1) tr.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" });
        });
        if (nOut) sounds.push(["tick", { pitch: 0.2, delay: 0.15 }]);
        if (nHl) sounds.push(["data", { delay: 0.2 }]);
        if (nNew) sounds.push(["link", { delay: 0.1 }]);
      }
    },

    pages(e, it, instant, sounds) {
      head(e, it);
      if (!e.grid || e.n !== it.n) {
        e.n = it.n;
        if (e.grid) e.grid.remove();
        e.grid = h("div", { class: "db-pages" });
        e.cells = [];
        for (let i = 0; i < it.n; i++) { const c = h("i"); e.cells.push(c); e.grid.append(c); }
        e.el.append(e.grid);
        e.read = new Set();
      }
      e.grid.style.gridTemplateColumns = "repeat(" + (it.cols || 20) + ", 1fr)";
      if (!e.foot) { e.foot = h("div", { class: "db-pages-foot" }); e.el.append(e.foot); }
      const read = it.read || [], hit = new Set(it.hit || []);
      const nowRead = new Set(read);
      const fresh = read.filter((i) => !e.read.has(i));
      const step = fresh.length ? Math.min(28, 1400 / fresh.length) : 0;
      e.cells.forEach((c, i) => {
        const was = e.read.has(i);
        c.className = (nowRead.has(i) ? "read" : "") + (hit.has(i) ? " hit" : "");
        if (nowRead.has(i) && !was && !instant) {
          c.style.animationDelay = Math.round(fresh.indexOf(i) * step) + "ms";
          c.classList.add("fresh");
        } else c.style.animationDelay = "";
      });
      e.read = nowRead;
      const sc = it.scale || 1;
      const shown = it.count != null ? it.count : read.length * sc, total = it.total || it.n * sc;
      if (it.foot) { e.foot.innerHTML = it.foot; } else e.foot.innerHTML = "<b>" + shown.toLocaleString("id-ID") + "</b> dari " + total.toLocaleString("id-ID") + " halaman tabel dibaca" + (sc > 1 ? " · 1 kotak ≈ " + sc + " halaman" : "");
      if (!instant && fresh.length) {
        const n = Math.min(fresh.length, 8);
        for (let k = 0; k < n; k++) sounds.push(["tick", { pitch: 0.3 + k * 0.08, delay: (k * (fresh.length * step) / n) / 1000 + 0.05 }]);
      }
    },

    tree(e, it, instant, sounds) {
      head(e, it);
      const key = JSON.stringify(it.levels);
      if (e.key !== key) {
        e.key = key;
        if (e.box) e.box.remove();
        e.box = h("div", { class: "db-tree" });
        e.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        e.svg.setAttribute("class", "db-tree-lines");
        e.box.append(e.svg);
        e.nodes = {};
        it.levels.forEach((lv, li) => {
          const row = h("div", { class: "db-tree-row" + (li === it.levels.length - 1 ? " leaf" : "") });
          lv.forEach((n) => {
            const el = h("div", { class: "db-node" }, ...n.keys.map((k) => h("span", null, String(k))));
            el._p = n.parent;
            e.nodes[n.id] = el;
            row.append(el);
          });
          e.box.append(row);
        });
        e.el.append(e.box);
        requestAnimationFrame(() => drawTreeLines(e));
      }
      const path = it.path || [];
      Object.entries(e.nodes).forEach(([id, el]) => {
        const k = path.indexOf(id);
        el.className = "db-node" + (k >= 0 ? " on" : "") + (it.hit === id ? " hit" : "");
        el.style.transitionDelay = k >= 0 && !instant ? k * 260 + "ms" : "0ms";
      });
      const pk = path.join(",");
      if (!instant && pk && pk !== e.pathKey) path.forEach((_, k) => sounds.push(["req", { delay: k * 0.26, pitch: 0.8 + k * 0.15 }]));
      e.pathKey = pk;
      requestAnimationFrame(() => drawTreeLines(e, path));
    },

    bars(e, it, instant) {
      head(e, it);
      if (!e.list) { e.list = h("div", { class: "db-bars" }); e.el.append(e.list); e.bars = {}; }
      const max = it.max || Math.max(1, ...it.items.map((b) => b.value));
      const keep = new Set();
      it.items.forEach((b, i) => {
        keep.add(b.label);
        let r = e.bars[b.label];
        if (!r) {
          r = { row: h("div", { class: "db-bar" }), fill: h("i"), val: h("b") };
          r.row.append(h("span", null, b.label), h("div", { class: "db-bar-track" }, r.fill), r.val);
          e.bars[b.label] = r;
          if (!instant) r.fill.style.width = "0%";
        }
        if (e.list.children[i] !== r.row) e.list.insertBefore(r.row, e.list.children[i] || null);
        r.row.className = "db-bar " + (b.tone || "");
        const w = Math.max(b.value > 0 ? 1.5 : 0, (100 * b.value) / max);
        if (instant) { r.fill.style.transition = "none"; r.fill.style.width = w + "%"; void r.fill.offsetWidth; r.fill.style.transition = ""; }
        else requestAnimationFrame(() => (r.fill.style.width = w + "%"));
        r.val.textContent = (b.text != null ? b.text : b.value.toLocaleString("id-ID") + (it.unit ? " " + it.unit : ""));
      });
      for (const k in e.bars) if (!keep.has(k)) { e.bars[k].row.remove(); delete e.bars[k]; }
    },

    badge(e, it) {
      e.el.className = "db-item db-badge " + (it.tone || "");
      e.el.innerHTML = "<span>" + esc(it.title || "") + "</span><b>" + esc(String(it.value)) + "</b>" + (it.unit ? "<em>" + esc(it.unit) + "</em>" : "");
    },

    flow(e, it) {
      e.el.className = "db-item db-flow " + (it.tone || "");
      e.el.innerHTML = "<span>" + esc(it.text || "→") + "</span>";
    }
  };

  function drawTreeLines(e, path) {
    if (!e.box || !e.box.isConnected) return;
    path = path || (e.pathKey ? e.pathKey.split(",") : []);
    const b = e.box.getBoundingClientRect();
    e.svg.setAttribute("width", b.width); e.svg.setAttribute("height", b.height);
    let d = "", dOn = "";
    Object.entries(e.nodes).forEach(([id, el]) => {
      const p = el._p && e.nodes[el._p];
      if (!p) return;
      const a = p.getBoundingClientRect(), c = el.getBoundingClientRect();
      const seg = "M" + (a.left + a.width / 2 - b.left).toFixed(1) + " " + (a.bottom - b.top).toFixed(1) + " L" + (c.left + c.width / 2 - b.left).toFixed(1) + " " + (c.top - b.top).toFixed(1) + " ";
      if (path.includes(id) && path.includes(el._p)) dOn += seg; else d += seg;
    });
    e.svg.innerHTML = '<path class="ln" d="' + d + '"/><path class="ln on" d="' + dOn + '"/>';
  }

  // ---------- catatan, kode, hasil ----------
  function renderNote(f, instant) {
    const n = st.note;
    if (!f.note) { n.hidden = true; n._t = ""; return; }
    n.hidden = false;
    n.className = "db-note " + (f.tone || "");
    if (n._t !== f.note) {
      n.textContent = f.note;
      n._t = f.note;
      if (!instant) n.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
    }
  }

  function renderCode(f) {
    const versions = st.lesson.code || {};
    const ver = f.sql || Object.keys(versions)[0];
    if (!ver || !versions[ver]) { st.codeEl.innerHTML = ""; st.code = null; return; }
    if (st.code !== ver) {
      st.code = ver;
      st.codeEl.innerHTML = "";
      versions[ver].forEach(([id, text], i) => {
        st.codeEl.append(h("div", { class: "ln" + (id && id.startsWith("+") ? " new" : ""), "data-id": (id || "").replace(/^\+/, ""), html: "<i>" + (i + 1) + "</i><span>" + (text ? highlight(text) : "&nbsp;") + "</span>" }));
      });
    }
    const on = new Set([].concat(f.line || []).map(String));
    let first = null;
    [...st.codeEl.children].forEach((ln) => {
      const yes = !!ln.dataset.id && on.has(ln.dataset.id);
      ln.classList.toggle("cur", yes);
      if (yes && !first) first = ln;
    });
    if (first) st.codeEl.scrollTo({ top: Math.max(0, first.offsetTop - st.codeEl.clientHeight / 3), behavior: Iso.reduceMotion ? "auto" : "smooth" });
  }

  function renderResult(f, instant, sounds) {
    const el = st.resEl;
    const key = JSON.stringify([f.result || null, f.out || []]);
    if (key === st.resKey) return;
    const prevRows = st.resRows || 0;
    st.resKey = key;
    el.innerHTML = "";
    const r = f.result;
    if (r) {
      const t = h("table", { class: "db-tbl res" },
        h("thead", null, h("tr", null, ...r.cols.map((c) => h("th", null, c)))),
        h("tbody", null, ...r.rows.map((row, i) => h("tr", { class: (r.state && r.state[i] ? "r-" + r.state[i] : "") + (!instant && i >= prevRows ? " fresh" : "") },
          ...row.map((v) => h("td", v === null ? { class: "null" } : null, v === null ? "NULL" : String(v)))))));
      el.append(t);
      if (!r.rows.length) el.append(h("div", { class: "ol empty" }, "(0 baris)"));
      else el.append(h("div", { class: "db-count" }, r.rows.length + " baris"));
      if (!instant && r.rows.length > prevRows) sounds.push(["data", { delay: 0.5 }]);
      st.resRows = r.rows.length;
    } else st.resRows = 0;
    (f.out || []).forEach((ln) => {
      const err = ln.startsWith("!"), plan = ln.startsWith("#");
      el.append(h("div", { class: "ol" + (err ? " err" : plan ? " plan" : "") + (instant ? "" : " fresh") }, err || plan ? ln.slice(1) : ln));
      if (err && !instant) sounds.push(["err", { delay: 0.35 }]);
    });
    if (!r && !(f.out || []).length) el.append(h("div", { class: "ol empty" }, "(belum dijalankan)"));
  }

  /** Penyusun frame: ubah keadaan lalu ambil potret. */
  window.DBStory = function (init, metricsOf) {
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
      item(id) { return s.items.find((x) => x.id === id); }
    };
  };
})();
