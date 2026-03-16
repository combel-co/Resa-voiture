// ==========================================
// XP / LEVEL / STREAK SYSTEM
// ==========================================
const LEVELS = [
  { name: 'Apprenti',   min: 0,    max: 100,  color: '#6366f1' },
  { name: 'Conducteur', min: 100,  max: 300,  color: '#0ea5e9' },
  { name: 'Expert',     min: 300,  max: 600,  color: '#10b981' },
  { name: 'Pilote',     min: 600,  max: 1000, color: '#f59e0b' },
  { name: 'Légende',    min: 1000, max: 9999, color: '#f43f5e' },
];

function getXpForAllTime() {
  if (!currentUser) return 0;
  const seen = new Set(); let xp = 0;
  Object.values(bookings).forEach(b => {
    if (b.userId === currentUser.id && !seen.has(b.id)) {
      seen.add(b.id);
      xp += 20 + Math.round(estimateDistanceForBooking(b) / 25);
      const fuel = getFuelReturnLevelForBooking(b);
      if (fuel !== null) xp += fuel >= 50 ? 10 : 5;
    }
  });
  return xp;
}

function getLevelFromXp(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { index: i, ...LEVELS[i] };
  }
  return { index: 0, ...LEVELS[0] };
}

function getMonthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : '';
}

function computeStreak() {
  if (!currentUser) return 0;
  const seen = new Set(); const bookedMonths = new Set();
  Object.values(bookings).forEach(b => {
    if (b.userId === currentUser.id && !seen.has(b.id)) {
      seen.add(b.id); bookedMonths.add(getMonthKey(b.startDate || b.date));
    }
  });
  const now = new Date();
  let streak = 0;
  for (let i = 0; i <= 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (bookedMonths.has(key)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// ==========================================
// BADGES
// ==========================================
const BADGE_DEFS = [
  { id: 'first_ride',   label: 'Première sortie', desc: '1er trajet réalisé',         check: (b, s) => b.length >= 1 },
  { id: 'road_5',       label: '5 trajets',       desc: '5 trajets cumulés',           check: (b, s) => b.length >= 5 },
  { id: 'road_warrior', label: 'Routier',          desc: '10 trajets cumulés',          check: (b, s) => b.length >= 10 },
  { id: 'long_haul',    label: 'Grand Voyageur',   desc: 'Un trajet de 200 km ou plus', check: (b, s) => b.some(x => (x.distanceKm || 0) >= 200) },
  { id: 'streak_3',     label: 'Régulier',         desc: '3 mois consécutifs',          check: (b, s) => s >= 3 },
  { id: 'streak_6',     label: 'Fidèle',           desc: '6 mois consécutifs',          check: (b, s) => s >= 6 },
];

function computeEarnedBadges() {
  if (!currentUser) return new Set();
  const seen = new Set();
  const myBookings = Object.values(bookings).filter(b => {
    if (b.userId === currentUser.id && !seen.has(b.id)) { seen.add(b.id); return true; } return false;
  });
  const streak = computeStreak();
  const earned = new Set();
  BADGE_DEFS.forEach(def => { if (def.check(myBookings, streak)) earned.add(def.id); });
  return earned;
}

function checkNewBadges() {
  if (!currentUser) return [];
  const key = `badges_seen_${currentUser.id}`;
  const seen = JSON.parse(localStorage.getItem(key) || '[]');
  const seenSet = new Set(seen);
  const earned = computeEarnedBadges();
  const newBadges = BADGE_DEFS.filter(d => earned.has(d.id) && !seenSet.has(d.id));
  if (newBadges.length > 0) {
    const updated = [...seen, ...newBadges.map(d => d.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  }
  return newBadges;
}

function renderXpHeroCard() {
  if (!currentUser) {
    const card = document.getElementById('xp-hero-card');
    if (card) card.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    const xpName = document.getElementById('xp-name');
    if (xpName) xpName.textContent = 'Connecte-toi';
    return;
  }
  const xp = getXpForAllTime();
  const level = getLevelFromXp(xp);
  const xpInLevel = xp - level.min;
  const levelRange = level.max - level.min;
  const pct = Math.min(100, Math.round((xpInLevel / levelRange) * 100));
  const streak = computeStreak();

  const avContent = currentUser.photo
    ? `<img src="${currentUser.photo}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : getInitials(currentUser.name);
  const avEl = document.getElementById('xp-avatar');
  if (avEl) avEl.innerHTML = avContent;

  const nameEl = document.getElementById('xp-name');
  if (nameEl) nameEl.textContent = currentUser.name;

  const badgeEl = document.getElementById('xp-level-badge');
  if (badgeEl) badgeEl.textContent = `Niveau ${level.index + 1} · ${level.name}`;

  const streakEl = document.getElementById('xp-streak');
  if (streakEl) {
    streakEl.textContent = `🔥 ${streak}`;
    streakEl.style.textShadow = streak >= 3 ? '0 0 12px rgba(245,158,11,0.6)' : 'none';
  }

  const fillEl = document.getElementById('xp-bar-fill');
  if (fillEl) fillEl.style.width = Math.max(2, pct) + '%';

  const curEl = document.getElementById('xp-current');
  if (curEl) curEl.textContent = `${xp} XP`;

  const nextEl = document.getElementById('xp-next');
  if (nextEl) nextEl.textContent = `sur ${level.max} XP`;

  const card = document.getElementById('xp-hero-card');
  if (card) card.style.background = `linear-gradient(135deg, ${level.color} 0%, ${level.color}cc 100%)`;
}
