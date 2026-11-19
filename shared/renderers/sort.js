/* Renderer "sort" — untuk pelajaran pengurutan (bubble, selection, insertion, ...).
 * Data pelajaran: lesson.sort = { items: [{id, name, v}], code: { versi: [[id, teks], ...] }, newLines: { versi: [id...] } }
 * Frame: { order:[id], vals:{id:v}, cmp:[a,b], result:"swap"|"keep", sortedFrom, note, tone,
 *          code, line, vars:{}, revised:[id], view:"growth"|"summary", growth:[...], summary:{...} }
 */
(function () {
  const { h, esc, fmt, rich } = Kelas.util;
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

  let st = null;

  Kelas.registerRenderer("sort", {
    mount(stage, lesson) {
      const S = lesson.sort;
      st = { S, items: {}, bars: {}, code: null, vars: {}, growthRows: {}, view: null };
      S.items.forEach((it) => (st.items[it.id] = it));
      const root = h("div", { class: "sv" });
      const note = h("div", { class: "sv-note", role: "status" }, h("span", null, ""));
      const bars = h("div", { class: "sv-bars", "aria-hidden": "true" });
      const zone = h("div", { class: "sv-zone" }, h("b", null, "SUDAH FINAL"));
      bars.append(zone, h("div", { class: "sv-base" }));
      S.items.forEach((it) => {
        const val = h("span", { class: "sv-val" }, String(it.v));
        const col = h("div", { class: "sv-col" }, val);
        const bar = h("div", { class: "sv-bar" }, col, h("div", { class: "sv-name" }, it.name));
        bars.append(bar);
        st.bars[it.id] = { bar, col, val };
      });
      const ptr = h("div", { class: "sv-ptr" }, h("span", { style: "left:25%" }, "j"), h("span", { style: "left:75%" }, "j+1"));
      bars.append(ptr);
      const code = h("pre", { class: "sv-code", "aria-label": "Kode Python" });
      const vars = h("div", { class: "sv-vars" }, h("h5", null, "VARIABEL"), h("div"));
      const arr = h("div", { class: "sv-arr" }, h("h5", null, "ISI LIST"), h("span"));
      const main = h("div", { class: "sv-main" }, note, bars, h("div", { class: "sv-bottom" }, code, h("div", { class: "sv-side" }, vars, arr)));
      const alt = h("div", { class: "sv-alt", hidden: true });
      root.append(main, alt);
      stage.innerHTML = "";
      stage.append(root);
      Object.assign(st, { root, note, zone, ptr, codeEl: code, varsEl: vars.lastChild, arrEl: arr.lastChild, main, alt });
    },

    render(f, opts) {
      if (!st) return;
      const r = st.root;
      if (opts.instant) r.classList.add("instant");
      if (f.view === "growth" || f.view === "summary") {
        st.main.hidden = true; st.alt.hidden = false;
        if (f.view === "growth") renderGrowth(f); else renderSummary(f);
      } else {
        st.main.hidden = false; st.alt.hidden = true; st.view = null;
        renderBars(f);
      }
      if (opts.instant) { void r.offsetWidth; requestAnimationFrame(() => r.classList.remove("instant")); }
    },

    unmount() { st = null; }
  });

  function renderBars(f) {
    const n = f.order.length, w = 100 / n;
    const vals = f.vals || {};
    const cmp = f.cmp || [];
    const sf = f.sortedFrom == null ? n : f.sortedFrom;
    f.order.forEach((id, i) => {
      const b = st.bars[id];
      const v = vals[id] != null ? vals[id] : st.items[id].v;
      b.bar.style.left = i * w + "%";
      b.bar.style.width = w + "%";
      b.col.style.height = "calc(" + (14 + v * 0.8) + "% - 30px)";
      b.val.textContent = v;
      b.bar.className = "sv-bar" +
        (cmp.includes(i) ? " cmp" : "") +
        (cmp.includes(i) && f.result === "swap" ? " swap" : "") +
        (i >= sf ? " final" : "") +
        ((f.revised || []).includes(id) ? " revised" : "");
    });
    st.zone.style.left = sf * w + "%";
    st.zone.style.width = (n - sf) * w + "%";
    st.zone.style.opacity = sf >= n ? 0 : 1;
    if (cmp.length) { st.ptr.classList.add("on"); st.ptr.style.left = cmp[0] * w + "%"; st.ptr.style.width = 2 * w + "%"; }
    else st.ptr.classList.remove("on");

    st.note.className = "sv-note " + (f.tone || "");
    st.note.firstChild.textContent = f.note || "";
    st.note.style.visibility = f.note ? "visible" : "hidden";

    // kode
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
    const curLn = st.codeEl.querySelector(".cur");
    if (curLn && st.codeEl.scrollWidth > st.codeEl.clientWidth) { /* biarkan pengguna menggulir sendiri */ }

    // variabel
    const vs = f.vars || {};
    const keys = Object.keys(vs);
    st.varsEl.innerHTML = "";
    if (!keys.length) st.varsEl.append(h("span", { class: "sv-chip" }, "—"));
    keys.forEach((k) => {
      const shown = k + " = " + py(vs[k]);
      const chg = st.vars[k] !== undefined && st.vars[k] !== vs[k];
      st.varsEl.append(h("span", { class: "sv-chip" + (chg ? " chg" : "") }, shown));
    });
    st.vars = { ...vs };
    st.arrEl.textContent = (st.S.listName || "nilai") + " = [" + f.order.map((id) => (vals[id] != null ? vals[id] : st.items[id].v)).join(", ") + "]";
  }

  function renderGrowth(f) {
    const g = f.growth;
    if (st.view !== "growth") {
      st.view = "growth";
      st.growthRows = {};
      st.alt.innerHTML = "";
      st.alt.append(h("h3", null, g.title), h("p", { class: "sub" }, g.sub), h("div", { class: "gr-rows" }), h("div", { class: "gr-foot", hidden: true }));
    }
    const rows = st.alt.querySelector(".gr-rows");
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
    const foot = st.alt.querySelector(".gr-foot");
    foot.hidden = !g.foot;
    if (g.foot) foot.innerHTML = rich(g.foot);
  }

  function renderSummary(f) {
    const s = f.summary;
    st.view = "summary";
    st.alt.innerHTML = "";
    st.alt.append(h("h3", null, s.title), s.sub ? h("p", { class: "sub" }, s.sub) : null,
      h("table", { class: "sum-table" }, h("tbody", null, s.rows.map((row) =>
        h("tr", { class: row.hl ? "hl" : null }, h("td", { html: rich(row.label) + (row.note ? "<small>" + esc(row.note) + "</small>" : "") }), h("td", null, row.value))))),
      s.foot ? h("div", { class: "gr-foot" , html: rich(s.foot) }) : null);
  }
})();
