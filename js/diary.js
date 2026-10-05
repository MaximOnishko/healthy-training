/* Личная страница: норма, рацион, вода, вес и настроение Фитика. */
(function () {
  // Открыли личную ссылку с другого устройства — подтягиваем профиль из #p=...
  const shared = Store.readShareLink();
  if (shared) { Store.setProfile(shared); history.replaceState(null, '', location.pathname); }

  const profile = Store.getProfile();
  if (!profile) { location.replace('index.html'); return; }

  const $ = (id) => document.getElementById(id);
  const res = Calc.compute(profile);
  const plan = Calc.buildPlan(res.target, profile.seed || 0);
  let shuffleSeed = profile.seed || 0;
  const mascot = Mascot.mount($('mascot'), { size: 220, bubble: $('bubble') });

  const toast = (t) => {
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = t;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };

  $('dateTag').textContent = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  $('hello').textContent = `${profile.name}, это твой дневник`;
  const goalTxt = { lose: 'похудение', keep: 'поддержание веса', gain: 'набор массы' }[profile.goal];
  $('subtitle').textContent = `Цель: ${goalTxt}. Активность: ${Calc.ACTIVITY[profile.activity].label.toLowerCase()}.`;
  $('sTarget').textContent = res.target;
  $('sBmi').textContent = res.bmi;
  $('sBmiL').textContent = 'ИМТ · ' + res.bmiLabel;
  $('sWater').textContent = res.water;
  $('targetTxt').textContent = res.target;
  $('mP').textContent = res.protein; $('mF').textContent = res.fat; $('mC').textContent = res.carbs;

  function render() {
    const day = Store.getDay();
    const eatenPlan = day.eaten.reduce((s, id) => s + (plan.find((p) => p.id === id)?.kcal || 0), 0);
    const total = eatenPlan + (day.extra || 0);

    // калории
    const pct = Math.min(total / res.target, 1.3) * 100;
    $('kcalBar').firstElementChild.style.width = Math.min(pct, 100) + '%';
    $('kcalBar').classList.toggle('over', total > res.target * 1.05);
    $('eatenTxt').textContent = total;

    // вода
    $('glasses').innerHTML = '';
    for (let g = 0; g < res.water; g++) {
      const b = document.createElement('button');
      b.className = 'glass' + (g < day.water ? ' full' : '');
      b.textContent = g < day.water ? '💧' : '';
      b.title = 'Стакан ' + (g + 1);
      b.onclick = () => { day.water = g < day.water && g === day.water - 1 ? g : g + 1; Store.setDay(day); Sound.blip(); render(); };
      $('glasses').appendChild(b);
    }

    // рацион
    $('plan').innerHTML = plan.map((p) => `
      <label class="meal">
        <input type="checkbox" data-id="${p.id}" ${day.eaten.includes(p.id) ? 'checked' : ''}>
        <div style="flex:1"><div class="name">${p.slot}: ${p.name}</div>
        <div class="meta">${p.portions !== 1 ? p.portions + ' порц. · ' : ''}${p.note}</div></div>
        <b>${p.kcal} ккал</b>
      </label>`).join('');
    $('plan').querySelectorAll('input').forEach((c) => c.addEventListener('change', () => {
      const d = Store.getDay();
      d.eaten = c.checked ? [...new Set([...d.eaten, c.dataset.id])] : d.eaten.filter((x) => x !== c.dataset.id);
      Store.setDay(d); Sound.happy(); render();
    }));

    renderWorkouts(day);
    mood(day, total);
    chart();
  }

  // --- спорт: недельный план и запись тренировок ---
  const todayIdx = (new Date().getDay() + 6) % 7; // Пн = 0
  $('week').innerHTML = SPORT.week[profile.goal].map(([e, t, d], i) => `
    <div class="day ${i === todayIdx ? 'today' : ''} ${t.includes('Отдых') ? 'rest' : ''}">
      <b>${SPORT.days[i]}</b><span class="e">${e}</span><div><b style="font-size:.85rem;color:var(--ink);font-family:inherit;text-transform:none">${t}</b>${d ? '<br>' + d : ''}</div>
    </div>`).join('');
  $('wAct').innerHTML = SPORT.activities.map((a) => `<option value="${a.id}">${a.emoji} ${a.name}</option>`).join('');

  function renderWorkouts(day) {
    const list = day.workouts || [];
    $('workoutList').innerHTML = list.map((w) => `<div class="exercise"><span>${w.name} · ${w.min} мин</span><span>${w.kcal} ккал</span></div>`).join('');
    $('burned').textContent = list.reduce((s, w) => s + w.kcal, 0);
  }

  $('addWorkout').addEventListener('click', () => {
    const a = SPORT.activities.find((x) => x.id === $('wAct').value);
    const min = parseInt($('wMin').value, 10);
    if (!(min > 0)) { toast('Укажи длительность'); return; }
    const kcal = Math.round(a.met * profile.weight * (min / 60));
    const d = Store.getDay(); d.workouts = [...(d.workouts || []), { name: a.name, min, kcal }]; Store.setDay(d);
    Sound.win(); toast(`Записано: −${kcal} ккал 🔥`); render();
  });

  function mood(day, total) {
    const hour = new Date().getHours();
    const P = DATA.mascotPhrases;
    if (total > res.target * 1.1) { mascot.setMood('sad'); mascot.say(Mascot.pick(P.over)); }
    else if (total === 0 && hour >= 10) { mascot.setMood('sleepy'); mascot.say(Mascot.pick(P.empty)); }
    else if (day.water < Math.floor(res.water / 2) && hour >= 15) { mascot.setMood('sad'); mascot.say(Mascot.pick(P.lowWater)); }
    else if (total >= res.target * 0.85 && day.water >= res.water) { mascot.setMood('excited'); mascot.say(Mascot.pick(P.goodDay)); }
    else { mascot.setMood('happy'); mascot.say(`Привет, ${profile.name}! Я слежу за твоим прогрессом 👀`); }
  }

  function chart() {
    const log = Store.getLog();
    const pts = Object.keys(log).filter((d) => log[d].weight).sort().map((d) => ({ d, w: log[d].weight }));
    if (!pts.length || pts[0].d > profile.startDate) pts.unshift({ d: profile.startDate, w: profile.startWeight });
    const svg = $('chart');
    if (pts.length < 2) {
      svg.innerHTML = '';
      $('chartNote').textContent = 'Записывай вес каждый день — здесь появится график.';
      return;
    }
    const ws = pts.map((p) => p.w);
    const min = Math.min(...ws) - 1, max = Math.max(...ws) + 1;
    const x = (i) => 20 + (i / (pts.length - 1)) * 560;
    const y = (w) => 160 - ((w - min) / (max - min)) * 140;
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.w)}`).join(' ');
    svg.innerHTML = `<path d="${path}" fill="none" stroke="#36e08a" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` +
      pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.w)}" r="5" fill="#36e08a"/>`).join('');
    const diff = (pts[pts.length - 1].w - pts[0].w).toFixed(1);
    $('chartNote').textContent = `Изменение с начала: ${diff > 0 ? '+' : ''}${diff} кг`;
  }

  $('addExtra').addEventListener('click', () => {
    const v = parseInt($('extra').value, 10);
    if (!(v > 0)) return;
    const d = Store.getDay(); d.extra = (d.extra || 0) + v; Store.setDay(d);
    $('extra').value = ''; Sound.blip(); render();
  });
  $('saveWeight').addEventListener('click', () => {
    const v = parseFloat($('weightToday').value.replace(',', '.'));
    if (!(v >= 30 && v <= 250)) { toast('Введи корректный вес'); return; }
    const d = Store.getDay(); d.weight = v; Store.setDay(d);
    profile.weight = v; Store.setProfile(profile);
    $('weightToday').value = ''; Sound.win(); toast('Вес записан ✅'); render();
  });
  $('shuffle').addEventListener('click', () => {
    shuffleSeed++;
    plan.splice(0, plan.length, ...Calc.buildPlan(res.target, shuffleSeed));
    const d = Store.getDay(); d.eaten = []; Store.setDay(d); Sound.blip(); render();
  });
  $('shareBtn').addEventListener('click', async () => {
    const link = Store.makeShareLink(profile);
    try { await navigator.clipboard.writeText(link); toast('Ссылка скопирована 🔗'); }
    catch { prompt('Скопируй свою личную ссылку:', link); }
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Удалить все данные и начать заново?')) { Store.reset(); location.href = 'index.html'; }
  });

  render();
})();
