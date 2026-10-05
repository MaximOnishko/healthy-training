/* Рендер страниц «Тренировки», «Питание», «Магазины» из DATA. */
(function () {
  const list = document.getElementById('list');
  const page = location.pathname.split('/').pop();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  if (page === 'workouts.html') {
    list.innerHTML = DATA.workouts.map((w) => `
      <div class="card">
        <span class="tag">${esc(w.level)} · ${esc(w.time)}</span>
        <h3 style="margin-top:10px">${esc(w.title)}</h3>
        ${w.items.map(([n, r]) => `<div class="exercise"><span>${esc(n)}</span><span>${esc(r)}</span></div>`).join('')}
      </div>`).join('');
  }

  if (page === 'nutrition.html') {
    list.innerHTML = DATA.tips.map((t) => `
      <div class="card"><div style="font-size:2.2rem">${t.emoji}</div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div>`).join('');
  }

  if (page === 'shops.html') {
    list.innerHTML = DATA.shops.map((s) => `
      <div class="card shop-card">
        <div class="emoji">${s.emoji}</div><span class="tag">${esc(s.tag)}</span>
        <h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p>
        <a class="btn small" href="${esc(s.url)}" target="_blank" rel="noopener sponsored">Перейти →</a>
      </div>`).join('');
  }
})();
