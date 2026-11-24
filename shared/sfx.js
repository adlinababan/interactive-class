/* Efek suara sintetis (Web Audio API), tanpa file audio.
 * Dipakai renderer "net" (modul System Architecture & Development Strategies).
 *   Sfx.play(nama, { delay, pitch })   ·   Sfx.enabled / Sfx.setEnabled(bool)
 * Nama: drop, link, req, res, data, file, err, ok, cut, sparkle, card, rise, fall, alert, done, tick
 * Browser hanya mengizinkan suara setelah interaksi pertama (klik/tombol). Sebelum itu, suara diabaikan.
 */
(function () {
  const KEY = "kelas:suara";
  let ctx = null, master = null, enabled = true, last = {};
  try { enabled = localStorage.getItem(KEY) !== "0"; } catch (e) {}

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 6;
    master = ctx.createGain(); master.gain.value = 0.32;
    master.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  const unlock = () => { const c = ensure(); if (c && c.state === "suspended") c.resume(); };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));

  // ---------- bahan dasar ----------
  function tone(t, { f = 440, f2, type = "sine", dur = 0.15, vol = 0.5, attack = 0.005, out } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out || master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(t, { dur = 0.2, vol = 0.3, type = "bandpass", f = 1200, f2, q = 1.2 } = {}) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  // ---------- katalog suara ----------
  const SOUNDS = {
    drop: (t, p) => { tone(t, { f: 520 * p, f2: 190 * p, dur: 0.12, vol: 0.35 }); tone(t + 0.01, { f: 1600 * p, dur: 0.03, vol: 0.06, type: "triangle" }); },
    link: (t) => tone(t, { f: 1250, f2: 1500, dur: 0.06, vol: 0.12, type: "triangle" }),
    req: (t, p) => tone(t, { f: 620 * p, f2: 980 * p, dur: 0.1, vol: 0.18, type: "triangle" }),
    res: (t, p) => tone(t, { f: 900 * p, f2: 560 * p, dur: 0.1, vol: 0.18, type: "triangle" }),
    data: (t, p) => { tone(t, { f: 740 * p, dur: 0.05, vol: 0.14, type: "square" }); tone(t + 0.07, { f: 880 * p, dur: 0.05, vol: 0.12, type: "square" }); },
    file: (t) => { noise(t, { dur: 0.28, vol: 0.18, f: 600, f2: 2400 }); tone(t + 0.05, { f: 330, f2: 500, dur: 0.18, vol: 0.12 }); },
    err: (t) => { tone(t, { f: 150, dur: 0.14, vol: 0.28, type: "sawtooth" }); tone(t + 0.18, { f: 120, dur: 0.2, vol: 0.28, type: "sawtooth" }); },
    ok: (t) => { tone(t, { f: 784, dur: 0.18, vol: 0.22 }); tone(t + 0.09, { f: 1175, dur: 0.3, vol: 0.2 }); },
    cut: (t) => { noise(t, { dur: 0.12, vol: 0.45, type: "highpass", f: 2500, q: 0.7 }); tone(t, { f: 220, f2: 70, dur: 0.18, vol: 0.25, type: "square" }); },
    sparkle: (t) => [1319, 1568, 1976, 2637].forEach((f, i) => tone(t + i * 0.055, { f, dur: 0.22, vol: 0.11, type: "triangle" })),
    card: (t) => noise(t, { dur: 0.32, vol: 0.16, f: 400, f2: 3200, q: 0.8 }),
    rise: (t, p) => tone(t, { f: 260, f2: 260 + 520 * p, dur: 0.8, vol: 0.09, type: "triangle", attack: 0.08 }),
    fall: (t) => tone(t, { f: 420, f2: 150, dur: 0.8, vol: 0.1, type: "triangle", attack: 0.08 }),
    alert: (t) => { tone(t, { f: 660, dur: 0.14, vol: 0.2, type: "square" }); tone(t + 0.17, { f: 494, dur: 0.22, vol: 0.2, type: "square" }); },
    done: (t) => [523, 659, 784].forEach((f, i) => tone(t + i * 0.08, { f, dur: 0.28, vol: 0.17 })),
    tick: (t, p) => tone(t, { f: 900 + 900 * p, dur: 0.03, vol: 0.1, type: "square" })
  };
  // jarak minimum (dtk) antar-pemutaran suara yang sama, agar tidak menumpuk
  const GAP = { drop: 0.055, link: 0.05, tick: 0.035, req: 0.12, res: 0.12, data: 0.12, rise: 0.4, fall: 0.4 };

  window.Sfx = {
    get enabled() { return enabled; },
    hush: false,   // true = bisukan sementara (mis. putaran ulang otomatis)
    setEnabled(v) {
      enabled = !!v;
      try { localStorage.setItem(KEY, enabled ? "1" : "0"); } catch (e) {}
      if (enabled) { unlock(); this.play("tick", { pitch: 0.6 }); }
    },
    play(name, o) {
      if (!enabled || this.hush || !ctx || ctx.state !== "running" || !SOUNDS[name]) return;
      o = o || {};
      let t = ctx.currentTime + (o.delay || 0) + 0.005;
      const gap = GAP[name] || 0.08;
      if (last[name] != null && t < last[name] + gap) {
        if (name === "drop" || name === "link") t = last[name] + gap; // benda jatuh berurutan → bunyi berurutan
        else return;
      }
      if (t - ctx.currentTime > 2) return;
      last[name] = t;
      SOUNDS[name](t, o.pitch == null ? 1 : o.pitch);
    }
  };
})();
