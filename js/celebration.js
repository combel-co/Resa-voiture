// ==========================================
// CELEBRATION OVERLAY
// ==========================================
function celebrate(icon, title, xpText, subtitle) {
  const colors = ['rgba(255,255,255,0.85)', '#f59e0b', 'rgba(255,255,255,0.5)', '#10b981', '#a5b4fc', '#fde68a'];
  const container = document.getElementById('confetti-container');
  if (container) {
    container.innerHTML = '';
    for (let i = 0; i < 18; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const size = Math.round(6 + Math.random() * 7);
      piece.style.width = size + 'px';
      piece.style.height = size + 'px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.4 ? '50%' : '2px';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      piece.style.animationDelay = Math.random() * 0.8 + 's';
      container.appendChild(piece);
    }
  }
  const celEl = document.getElementById('celebration');
  if (!celEl) return;
  document.getElementById('cel-emoji').textContent = icon || '✓';
  document.getElementById('cel-title').textContent = title || 'Super !';
  document.getElementById('cel-xp').textContent = xpText || '';
  document.getElementById('cel-sub').textContent = subtitle || '';
  celEl.style.display = 'flex';
  setTimeout(() => {
    celEl.style.display = 'none';
    renderXpHeroCard();
  }, 2500);
}
