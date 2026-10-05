/* Стартовый экран + пошаговая анкета. В конце — расчёт и переход в личный дневник. */
(function () {
  const intro = document.getElementById('intro');
  const introMascot = Mascot.mount(document.getElementById('introMascot'), { size: 200 });
  introMascot.setMood('excited');

  const hideIntro = () => { intro.classList.add('hide'); sessionStorage.setItem('ht_intro', '1'); };
  if (sessionStorage.getItem('ht_intro')) intro.classList.add('hide');

  document.getElementById('startBtn').addEventListener('click', () => { Sound.jingle(); setTimeout(hideIntro, 1500); });
  document.getElementById('skipBtn').addEventListener('click', () => { Store.setMuted(true); hideIntro(); location.reload(); });

  const bubble = document.getElementById('bubble');
  const mascot = Mascot.mount(document.getElementById('mascot'), { size: 240, bubble });
  const existing = Store.getProfile();
  mascot.say(existing ? `С возвращением, ${existing.name}! 💚` : Mascot.pick(DATA.mascotPhrases.greet));
  if (existing) {
    const lead = document.querySelector('.hero .lead');
    lead.insertAdjacentHTML('afterend', '<p><a class="btn secondary" href="diary.html">Открыть мой дневник →</a></p>');
  }

  // --- анкета ---
  const steps = [...document.querySelectorAll('.step')];
  const bar = document.getElementById('progressBar');
  const next = document.getElementById('nextBtn');
  const prev = document.getElementById('prevBtn');
  const err = document.getElementById('error');
  const hints = [
    'Как тебя зовут? Хочу знакомиться! 😊',
    'Расскажи немного о себе',
    'Рост и вес нужны для точного расчёта',
    'Куда идём? Выбери цель 🎯',
    'Последний шаг!',
  ];
  let i = 0;
  const state = { sex: 'f', goal: 'lose' };

  document.querySelectorAll('.choices').forEach((box) => {
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.choice');
      if (!b) return;
      box.querySelectorAll('.choice').forEach((c) => c.classList.remove('selected'));
      b.classList.add('selected');
      state[box.dataset.field] = b.dataset.value;
      Sound.blip();
    });
  });

  function show() {
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    bar.style.width = ((i + 1) / steps.length) * 100 + '%';
    prev.style.visibility = i === 0 ? 'hidden' : 'visible';
    next.textContent = i === steps.length - 1 ? 'Рассчитать ✨' : 'Дальше';
    mascot.say(hints[i]);
    err.hidden = true;
  }

  const val = (id) => document.getElementById(id).value.trim();
  const num = (id) => parseFloat(val(id).replace(',', '.'));

  function validate() {
    const bad = (m) => { err.textContent = m; err.hidden = false; mascot.setMood('sad'); setTimeout(() => mascot.setMood('happy'), 1200); return false; };
    if (i === 0 && val('name').length < 1) return bad('Напиши, как тебя зовут');
    if (i === 1) { const a = num('age'); if (!(a >= 14 && a <= 90)) return bad('Возраст должен быть от 14 до 90 лет'); }
    if (i === 2) {
      const h = num('height'), w = num('weight');
      if (!(h >= 120 && h <= 230)) return bad('Рост — от 120 до 230 см');
      if (!(w >= 30 && w <= 250)) return bad('Вес — от 30 до 250 кг');
    }
    return true;
  }

  next.addEventListener('click', () => {
    if (!validate()) return;
    Sound.blip();
    if (i < steps.length - 1) { i++; show(); return; }
    finish();
  });
  prev.addEventListener('click', () => { if (i > 0) { i--; show(); } });
  document.getElementById('wizard').addEventListener('submit', (e) => e.preventDefault());

  function finish() {
    const profile = {
      name: val('name'), sex: state.sex, age: num('age'), height: num('height'),
      weight: num('weight'), goal: state.goal, activity: val('activity'),
      targetWeight: num('target') || null, startWeight: num('weight'),
      startDate: Store.today(), seed: Math.floor(Math.random() * 3),
    };
    Store.setProfile(profile);
    const r = Calc.compute(profile);
    mascot.setMood('excited'); mascot.hearts(); Sound.win();
    mascot.say(`Готово! Тебе нужно ~${r.target} ккал в день 🎉`);
    next.disabled = true;
    setTimeout(() => { location.href = 'diary.html'; }, 1800);
  }

  show();
})();
