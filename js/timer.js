/* Интервальный таймер: работа → отдых → N раундов. */
(function () {
  const $ = (id) => document.getElementById(id);
  const PRESETS = [
    ['Табата 20/10 × 8', 20, 10, 8],
    ['HIIT 40/20 × 10', 40, 20, 10],
    ['Круговая 45/15 × 12', 45, 15, 12],
    ['Планка 60/30 × 3', 60, 30, 3],
  ];
  let timer = null, phase = 'idle', left = 0, round = 0, paused = false;

  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const val = (id, d) => Math.max(parseInt($(id).value, 10) || d, id === 'rSec' ? 0 : 1);

  $('presets').innerHTML = PRESETS.map((p, i) => `<button class="chip" data-i="${i}">${p[0]}</button>`).join('');
  $('presets').querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
    const [, w, r, n] = PRESETS[b.dataset.i];
    $('wSec').value = w; $('rSec').value = r; $('rounds').value = n;
    reset(); Sound.blip();
  }));

  function show() {
    const labels = { idle: 'Готов', work: 'Работаем! 🔥', rest: 'Отдых 😮‍💨', done: 'Готово! 🎉' };
    $('phase').textContent = paused ? 'Пауза' : labels[phase];
    $('time').textContent = fmt(phase === 'idle' ? val('wSec', 20) : left);
    $('round').textContent = `Раунд ${round} / ${val('rounds', 8)}`;
    $('box').classList.toggle('work', phase === 'work' && !paused);
    $('box').classList.toggle('rest', phase === 'rest' && !paused);
    $('startBtn').textContent = phase === 'idle' || phase === 'done' ? '▶ Старт' : paused ? '▶ Продолжить' : '⏸ Пауза';
  }

  function begin(next) {
    phase = next;
    if (next === 'work') { round++; left = val('wSec', 20); Sound.go(); }
    if (next === 'rest') { left = val('rSec', 10); Sound.happy(); }
  }

  function tick() {
    if (paused) return;
    left--;
    if (left > 0 && left <= 3) Sound.tick();
    if (left <= 0) {
      if (phase === 'work') {
        if (round >= val('rounds', 8)) { phase = 'done'; left = 0; clearInterval(timer); Sound.win(); }
        else if (val('rSec', 10) > 0) begin('rest');
        else begin('work');
      } else begin('work');
    }
    show();
  }

  function reset() { clearInterval(timer); phase = 'idle'; round = 0; paused = false; left = 0; show(); }

  $('startBtn').addEventListener('click', () => {
    if (phase === 'idle' || phase === 'done') { reset(); round = 0; begin('work'); timer = setInterval(tick, 1000); }
    else paused = !paused;
    show();
  });
  $('resetBtn').addEventListener('click', reset);
  ['wSec', 'rSec', 'rounds'].forEach((id) => $(id).addEventListener('input', () => { if (phase === 'idle') show(); }));
  show();
})();
