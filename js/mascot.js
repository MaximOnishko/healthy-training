/* Тамагочи-помощник «Фитик». Рисуется как SVG, настроение меняется классом. */
const Mascot = (() => {
  const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Фитик">
  <line x1="100" y1="28" x2="100" y2="48" stroke="#1f2d2a" stroke-width="5" stroke-linecap="round"/>
  <circle class="antenna-ball" cx="100" cy="24" r="9" fill="#ff7e9d"/>
  <rect x="38" y="46" width="124" height="102" rx="38" fill="#2fbf71" stroke="#1f2d2a" stroke-width="5"/>
  <rect x="54" y="62" width="92" height="64" rx="26" fill="#eafff2" stroke="#1f2d2a" stroke-width="4"/>
  <ellipse class="eye" cx="80" cy="88" rx="9" ry="12" fill="#1f2d2a"/>
  <ellipse class="eye" cx="120" cy="88" rx="9" ry="12" fill="#1f2d2a"/>
  <circle cx="83" cy="84" r="3" fill="#fff"/><circle cx="123" cy="84" r="3" fill="#fff"/>
  <ellipse cx="66" cy="108" rx="8" ry="5" fill="#ffb3c4" opacity=".8"/>
  <ellipse cx="134" cy="108" rx="8" ry="5" fill="#ffb3c4" opacity=".8"/>
  <path class="mouth-happy" d="M86 106 Q100 122 114 106" fill="none" stroke="#1f2d2a" stroke-width="5" stroke-linecap="round"/>
  <path class="mouth-sad" d="M88 116 Q100 104 112 116" fill="none" stroke="#1f2d2a" stroke-width="5" stroke-linecap="round"/>
  <ellipse class="mouth-sleepy" cx="100" cy="112" rx="6" ry="4" fill="#1f2d2a"/>
  <rect x="62" y="146" width="76" height="34" rx="14" fill="#ffd95a" stroke="#1f2d2a" stroke-width="4"/>
  <circle cx="84" cy="163" r="5" fill="#ff7e9d"/><circle cx="100" cy="163" r="5" fill="#2fbf71"/><circle cx="116" cy="163" r="5" fill="#4fb3ff"/>
  <rect x="22" y="86" width="14" height="36" rx="7" fill="#ffd95a" stroke="#1f2d2a" stroke-width="4"/>
  <rect x="164" y="86" width="14" height="36" rx="7" fill="#ffd95a" stroke="#1f2d2a" stroke-width="4"/>
</svg>`;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function mount(el, { size = 220, bubble = null } = {}) {
    el.classList.add('mascot', 'happy');
    el.innerHTML = svg(size);
    const api = {
      el,
      setMood(m) { el.classList.remove('happy', 'sad', 'sleepy', 'excited'); el.classList.add(m); },
      say(text) { if (bubble) bubble.textContent = text; },
      hearts() {
        for (let i = 0; i < 5; i++) {
          const h = document.createElement('span');
          h.className = 'heart';
          h.textContent = ['💚', '✨', '💛', '💖'][i % 4];
          h.style.left = 30 + Math.random() * 60 + '%';
          h.style.top = '10%';
          h.style.animationDelay = i * 0.08 + 's';
          el.appendChild(h);
          setTimeout(() => h.remove(), 1500);
        }
      },
    };
    el.addEventListener('click', () => {
      api.setMood('excited');
      api.hearts();
      Sound.happy();
      api.say(pick(DATA.mascotPhrases.pet));
      setTimeout(() => api.setMood('happy'), 1200);
    });
    return api;
  }

  return { mount, pick };
})();
