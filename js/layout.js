/* Общая шапка и подвал, чтобы не дублировать их на каждой странице. */
(function () {
  const links = [
    ['index.html', 'Главная'],
    ['diary.html', 'Мой дневник'],
    ['workouts.html', 'Тренировки'],
    ['timer.html', 'Таймер'],
    ['nutrition.html', 'Питание'],
    ['game.html', 'Игра'],
    ['shops.html', 'Магазины'],
  ];
  const page = location.pathname.split('/').pop() || 'index.html';
  const nav = links.map(([h, t]) => `<a href="${h}" class="${h === page ? 'active' : ''}">${t}</a>`).join('');

  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `<div class="container">
      <a class="logo" href="index.html">Фит<span>ик</span> 🌱</a>
      <nav class="nav">${nav}<button class="mute-btn" id="muteBtn" title="Звук">${Store.isMuted() ? '🔇' : '🔊'}</button></nav>
    </div>`;
    document.getElementById('muteBtn').addEventListener('click', (e) => {
      e.currentTarget.textContent = Sound.toggleMute() ? '🔇' : '🔊';
    });
  }
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `<div class="container">Фитик — твой персональный дневник здоровья 💚<br>
      Расчёты ориентировочные и не заменяют консультацию врача или диетолога.</div>`;
  }
})();
