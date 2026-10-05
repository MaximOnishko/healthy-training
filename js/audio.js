/* Звук без файлов: мелодия синтезируется через Web Audio API.
   Браузеры разрешают звук только после клика — поэтому на старте есть кнопка. */
const Sound = (() => {
  let ctx = null;
  const ensure = () => {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const FREQ = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G4: 392 };

  function note(freq, start, dur, type = 'square', vol = 0.06) {
    const c = ctx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  }

  const play = (seq, type, vol) => {
    if (Store.isMuted() || !ensure()) return;
    seq.forEach(([n, s, d]) => note(FREQ[n], s, d, type, vol));
  };

  return {
    jingle() { // весёлая стартовая мелодия
      play([['C5', 0, .15], ['E5', .15, .15], ['G5', .3, .15], ['C6', .45, .25], ['G5', .75, .12], ['A5', .87, .12], ['C6', .99, .12], ['E6', 1.11, .4]], 'square', 0.05);
    },
    tick() { play([['A5', 0, .1]], 'square', 0.04); },
    go() { play([['E6', 0, .35]], 'square', 0.06); },
    blip() { play([['E6', 0, .08]], 'square', 0.04); },
    happy() { play([['G5', 0, .1], ['C6', .1, .18]], 'triangle', 0.08); },
    bad() { play([['G4', 0, .15], ['C5', .12, .2]], 'sawtooth', 0.04); },
    win() { play([['C5', 0, .1], ['E5', .1, .1], ['G5', .2, .1], ['C6', .3, .3]], 'triangle', 0.08); },
    toggleMute() { const m = !Store.isMuted(); Store.setMuted(m); return m; },
  };
})();
