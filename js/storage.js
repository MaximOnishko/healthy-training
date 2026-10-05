/* Хранилище: всё лежит в localStorage браузера пользователя. */
const Store = (() => {
  const K_PROFILE = 'ht_profile';
  const K_LOG = 'ht_log';
  const K_MUTE = 'ht_mute';
  const K_BEST = 'ht_best';

  const read = (k, def) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; }
  };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

  const today = () => new Date().toISOString().slice(0, 10);

  return {
    today,
    getProfile: () => read(K_PROFILE, null),
    setProfile: (p) => write(K_PROFILE, p),
    getLog: () => read(K_LOG, {}),
    getDay(date = today()) {
      const log = read(K_LOG, {});
      return log[date] || { water: 0, eaten: [], extra: 0, weight: null, workouts: [] };
    },
    setDay(day, date = today()) {
      const log = read(K_LOG, {});
      log[date] = day;
      write(K_LOG, log);
    },
    isMuted: () => read(K_MUTE, false),
    setMuted: (v) => write(K_MUTE, v),
    getBest: () => read(K_BEST, 0),
    setBest: (v) => write(K_BEST, v),
    reset() { [K_PROFILE, K_LOG].forEach((k) => localStorage.removeItem(k)); },

    /* Личная ссылка: профиль кодируется в #hash, её можно открыть на любом устройстве. */
    makeShareLink(profile) {
      const json = JSON.stringify(profile);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      return location.origin + location.pathname.replace(/[^/]*$/, '') + 'diary.html#p=' + b64;
    },
    readShareLink() {
      const m = location.hash.match(/#p=(.+)$/);
      if (!m) return null;
      try { return JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch { return null; }
    },
  };
})();
