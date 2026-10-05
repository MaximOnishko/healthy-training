/* Калькулятор калорий и БЖУ (формула Миффлина — Сан Жеора). */
const Calc = (() => {
  const ACTIVITY = {
    low: { k: 1.2, label: 'Сидячий образ жизни' },
    light: { k: 1.375, label: 'Лёгкая активность (1–3 тренировки)' },
    mid: { k: 1.55, label: 'Средняя (3–5 тренировок)' },
    high: { k: 1.725, label: 'Высокая (6–7 тренировок)' },
  };

  const bmr = ({ sex, weight, height, age }) =>
    10 * weight + 6.25 * height - 5 * age + (sex === 'f' ? -161 : 5);

  const bmi = ({ weight, height }) => weight / Math.pow(height / 100, 2);

  const bmiLabel = (v) =>
    v < 18.5 ? 'Дефицит массы' : v < 25 ? 'Норма' : v < 30 ? 'Избыточный вес' : 'Ожирение';

  function compute(p) {
    const tdee = bmr(p) * ACTIVITY[p.activity].k;
    let target = tdee;
    if (p.goal === 'lose') target = tdee * 0.85;
    if (p.goal === 'gain') target = tdee * 1.12;
    // нижняя граница, чтобы не уйти в опасный дефицит
    const floor = p.sex === 'f' ? 1200 : 1500;
    target = Math.max(Math.round(target), floor);

    const protein = Math.round(p.weight * (p.goal === 'lose' ? 1.8 : 1.6));
    const fat = Math.round((target * 0.27) / 9);
    const carbs = Math.max(Math.round((target - protein * 4 - fat * 9) / 4), 0);
    const bm = bmi(p);
    const water = Math.round((p.weight * 30) / 250); // стаканов по 250 мл

    return {
      tdee: Math.round(tdee), target, protein, fat, carbs,
      bmi: Math.round(bm * 10) / 10, bmiLabel: bmiLabel(bm), water,
    };
  }

  /* Рацион: 4 приёма пищи, подбираем блюда из DATA.meals под долю калорий. */
  const SLOTS = [
    { id: 'breakfast', name: 'Завтрак', share: 0.27 },
    { id: 'lunch', name: 'Обед', share: 0.33 },
    { id: 'snack', name: 'Перекус', share: 0.12 },
    { id: 'dinner', name: 'Ужин', share: 0.28 },
  ];

  function buildPlan(target, seed = 0) {
    return SLOTS.map((slot, i) => {
      const goal = target * slot.share;
      const options = DATA.meals[slot.id]
        .map((m) => ({ ...m, portions: Math.max(0.5, Math.round((goal / m.kcal) * 2) / 2) }))
        .sort((a, b) => Math.abs(a.kcal * a.portions - goal) - Math.abs(b.kcal * b.portions - goal));
      const top = options.slice(0, 3);
      const pick = top[(seed + i) % top.length];
      return {
        id: slot.id, slot: slot.name, name: pick.name,
        portions: pick.portions, kcal: Math.round(pick.kcal * pick.portions),
        note: pick.note,
      };
    });
  }

  return { ACTIVITY, compute, buildPlan, SLOTS };
})();
