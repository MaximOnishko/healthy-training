/* Рендер страниц «Тренировки», «Питание», «Магазины». */
(function () {
  const page = location.pathname.split('/').pop();
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  if (page === 'workouts.html') {
    let filter = 'all';
    const filters = [['all', 'Все'], ...Object.entries(SPORT.placeNames)];
    const drawFilters = () => {
      $('filters').innerHTML = filters.map(([k, n]) => `<button class="chip ${k === filter ? 'selected' : ''}" data-k="${k}">${n}</button>`).join('');
      $('filters').querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.k; Sound.blip(); drawFilters(); drawList(); }));
    };
    const drawList = () => {
      $('list').innerHTML = SPORT.programs.filter((p) => filter === 'all' || p.place === filter).map((w) => `
        <div class="card">
          <span class="tag">${esc(w.level)}</span> <span class="tag amber">${esc(w.time)} · ~${w.kcal} ккал</span>
          <h3 style="margin-top:12px">${esc(w.title)}</h3>
          <div style="color:var(--muted);font-size:.85rem;margin-bottom:6px">${SPORT.placeNames[w.place]}</div>
          ${w.items.map(([n, r]) => `<div class="exercise"><span>${esc(n)}</span><span>${esc(r)}</span></div>`).join('')}
        </div>`).join('');
    };
    drawFilters(); drawList();

    $('library').innerHTML = SPORT.library.map((g) => `
      <div class="card"><h3>${esc(g.group)}</h3>
        ${g.items.map(([n, d]) => `<div class="lib-item"><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join('')}
      </div>`).join('');

    // калькулятор расхода калорий
    $('cAct').innerHTML = SPORT.activities.map((a) => `<option value="${a.id}">${a.emoji} ${esc(a.name)}</option>`).join('');
    const prof = Store.getProfile();
    if (prof) $('cW').value = prof.weight;
    const calc = () => {
      const a = SPORT.activities.find((x) => x.id === $('cAct').value);
      const kcal = a.met * (parseFloat($('cW').value) || 0) * ((parseFloat($('cMin').value) || 0) / 60);
      $('cRes').textContent = Math.round(kcal);
    };
    ['cAct', 'cMin', 'cW'].forEach((id) => $(id).addEventListener('input', calc));
    calc();
  }

  if (page === 'nutrition.html') {
    $('list').innerHTML = DATA.tips.map((t) => `
      <div class="card"><div style="font-size:2.2rem">${t.emoji}</div><h3>${esc(t.title)}</h3><p style="color:var(--muted);margin:0">${esc(t.text)}</p></div>`).join('');
  }

  if (page === 'shops.html') {
    $('list').innerHTML = DATA.shops.map((s) => `
      <div class="card shop-card">
        <div class="emoji">${s.emoji}</div><span class="tag">${esc(s.tag)}</span>
        <h3>${esc(s.name)}</h3><p style="color:var(--muted);margin:0">${esc(s.desc)}</p>
        <a class="btn small" href="${esc(s.url)}" target="_blank" rel="noopener sponsored">Перейти →</a>
      </div>`).join('');
  }
})();
