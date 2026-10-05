/* Мини-игра: ловим полезную еду корзинкой. */
(function () {
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const GOOD = ['🍎', '🥦', '🥕', '🍌', '🍓'];
  const BAD = ['🍔', '🍩', '🍟'];
  const $ = (id) => document.getElementById(id);

  let items = [], score = 0, timeLeft = 30, running = false, last = 0, spawn = 0, timerId = null;
  const basket = { x: W / 2, w: 90 };
  $('best').textContent = Store.getBest();

  const moveTo = (clientX) => {
    const r = cv.getBoundingClientRect();
    basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, ((clientX - r.left) / r.width) * W));
  };
  cv.addEventListener('mousemove', (e) => moveTo(e.clientX));
  cv.addEventListener('touchmove', (e) => { moveTo(e.touches[0].clientX); }, { passive: true });
  cv.addEventListener('touchstart', (e) => { moveTo(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') basket.x = Math.max(basket.w / 2, basket.x - 30);
    if (e.key === 'ArrowRight') basket.x = Math.min(W - basket.w / 2, basket.x + 30);
  });

  function start() {
    items = []; score = 0; timeLeft = 30; running = true; last = performance.now(); spawn = 0;
    $('score').textContent = 0; $('time').textContent = timeLeft; $('play').disabled = true;
    clearInterval(timerId);
    timerId = setInterval(() => {
      timeLeft--; $('time').textContent = timeLeft;
      if (timeLeft <= 0) end();
    }, 1000);
    requestAnimationFrame(loop);
  }

  function end() {
    running = false; clearInterval(timerId); $('play').disabled = false; $('play').textContent = '↻ Ещё раз';
    if (score > Store.getBest()) { Store.setBest(score); $('best').textContent = score; }
    Sound.win();
  }

  function loop(t) {
    if (!running) { draw(true); return; }
    const dt = Math.min((t - last) / 1000, 0.05); last = t;
    spawn -= dt;
    if (spawn <= 0) {
      const good = Math.random() < 0.7;
      const set = good ? GOOD : BAD;
      items.push({ x: 30 + Math.random() * (W - 60), y: -30, v: 160 + Math.random() * 140 + (30 - timeLeft) * 4, e: set[Math.floor(Math.random() * set.length)], good });
      spawn = 0.55;
    }
    const by = H - 70;
    items = items.filter((it) => {
      it.y += it.v * dt;
      if (it.y > by - 20 && it.y < by + 30 && Math.abs(it.x - basket.x) < basket.w / 2 + 10) {
        score += it.good ? 1 : -2; if (score < 0) score = 0;
        $('score').textContent = score; it.good ? Sound.blip() : Sound.bad();
        return false;
      }
      return it.y < H + 40;
    });
    draw(false);
    requestAnimationFrame(loop);
  }

  function draw(over) {
    ctx.clearRect(0, 0, W, H);
    ctx.font = '40px serif'; ctx.textAlign = 'center';
    items.forEach((it) => ctx.fillText(it.e, it.x, it.y));
    ctx.font = '56px serif';
    ctx.fillText('🧺', basket.x, H - 40);
    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(40, H / 2 - 90, W - 80, 160);
      ctx.fillStyle = '#fff'; ctx.font = '800 30px Inter, sans-serif';
      ctx.fillText(score ? `Счёт: ${score} 🎉` : 'Нажми «Играть»!', W / 2, H / 2 - 20);
      ctx.font = '20px Inter, sans-serif';
      ctx.fillText(score >= 20 ? 'Фитик сыт и счастлив!' : score ? 'Фитик ещё хочет добавки!' : '', W / 2, H / 2 + 24);
    }
  }

  $('play').addEventListener('click', () => { Sound.blip(); start(); });
  draw(true);
})();
