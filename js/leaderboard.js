// ==========================================
// LEADERBOARD PODIUM
// ==========================================
function renderLeaderboard(ranking) {
  const podiumEl = document.getElementById('podium');
  const restEl = document.getElementById('lb-rest');
  if (!podiumEl || !restEl) return;

  // Visual podium order: 2nd, 1st, 3rd
  const podiumSlots = [
    { player: ranking[1], rank: 2, height: 70, medal: '🥈' },
    { player: ranking[0], rank: 1, height: 90, medal: '🥇' },
    { player: ranking[2], rank: 3, height: 55, medal: '🥉' },
  ];

  podiumEl.innerHTML = podiumSlots.map(({ player, rank, height, medal }) => {
    if (!player) return `<div class="podium-slot rank-${rank}"></div>`;
    const av = player.photo
      ? `<img src="${player.photo}" alt="" style="width:100%;height:100%;object-fit:cover">`
      : getInitials(player.label);
    return `<div class="podium-slot rank-${rank}">
      <div class="podium-avatar">${av}</div>
      <div class="podium-name">${player.label}</div>
      <div class="podium-score">${player.score} pts · ${player.rides} trajet${player.rides > 1 ? 's' : ''}</div>
      <div class="podium-bar rank-${rank}" style="height:${height}px">${medal}</div>
      <div class="podium-rank">#${rank}</div>
    </div>`;
  }).join('');

  if (ranking.length <= 3) { restEl.innerHTML = ''; return; }

  restEl.innerHTML = ranking.slice(3).map((r, i) => {
    const isMe = currentUser && r.label === currentUser.name;
    const av = r.photo
      ? `<img src="${r.photo}" alt="" style="width:100%;height:100%;object-fit:cover">`
      : getInitials(r.label);
    return `<div class="lb-row ${isMe ? 'is-me' : ''}">
      <div class="lb-rank-num">${i + 4}</div>
      <div class="lb-avatar-sm">${av}</div>
      <div class="lb-info">
        <div class="lb-info-name">${r.label}${isMe ? ' (moi)' : ''}</div>
        <div class="lb-info-sub">${r.rides} trajet${r.rides > 1 ? 's' : ''}</div>
      </div>
      <div class="lb-pts">${r.score} pts</div>
    </div>`;
  }).join('');
}
