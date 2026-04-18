const _PTR_THRESHOLD = 60;
const _PTR_MAX_TRANSLATE = 90;
const _PTR_CIRC = 69.1;

function initPTR({ container, onRefresh, isAllowed }) {
  const pill  = document.getElementById('ptr-pill');
  const arc   = document.getElementById('ptr-arc');
  const spin  = document.getElementById('ptr-spinner');
  const label = document.getElementById('ptr-label');

  if (!pill || !arc || !spin || !label || !container) return;

  let startY  = 0;
  let pulling = false;
  let loading = false;
  let pullPct = 0;

  const setLabel = (main, sub) => {
    label.innerHTML = main + '<span class="ptr-sub">' + sub + '</span>';
  };

  const setArc = (pct) => {
    const progress = Math.min(1, pct / _PTR_THRESHOLD);
    arc.setAttribute('stroke-dashoffset', _PTR_CIRC * (1 - progress));
  };

  const onStart = (e) => {
    if (loading) return;
    if (isAllowed && !isAllowed()) return;
    if (container.scrollTop > 4) return;
    // Ne pas armer si un conteneur fils est scrollé
    const t = e.target;
    let ancestor = t instanceof Node ? t.parentElement : null;
    while (ancestor && ancestor !== container) {
      if (ancestor.scrollTop > 0) return;
      ancestor = ancestor.parentElement;
    }
    startY  = e.touches[0].clientY;
    pulling = true;
  };

  const onMove = (e) => {
    if (!pulling || loading) return;
    if (isAllowed && !isAllowed()) { springBack(); return; }
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) return;

    e.preventDefault();

    const eased = Math.min(_PTR_MAX_TRANSLATE, dy * 0.55);
    pullPct = (eased / _PTR_MAX_TRANSLATE) * 100;

    container.style.transform = 'translateY(' + eased + 'px)';
    pill.classList.add('is-visible');
    setArc(pullPct);

    if (pullPct >= _PTR_THRESHOLD) {
      pill.classList.add('is-release');
      setLabel('Relâchez pour actualiser', 'prêt');
      if (navigator.vibrate && !pill.dataset.tick) {
        navigator.vibrate(10);
        pill.dataset.tick = '1';
      }
    } else {
      pill.classList.remove('is-release');
      setLabel('Tirez pour actualiser', Math.round(pullPct) + '\u00a0%');
      delete pill.dataset.tick;
    }
  };

  const onEnd = async () => {
    if (!pulling || loading) return;
    pulling = false;
    pill.classList.remove('is-release');
    if (pullPct >= _PTR_THRESHOLD) {
      triggerLoad();
    } else {
      springBack();
    }
  };

  const springBack = () => {
    pulling = false;
    container.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1)';
    container.style.transform  = 'translateY(0)';
    pill.classList.remove('is-visible', 'is-release');
    delete pill.dataset.tick;
    setTimeout(() => { container.style.transition = ''; pullPct = 0; }, 310);
  };

  const triggerLoad = async () => {
    loading = true;
    container.style.transition = 'transform .2s cubic-bezier(.2,.8,.2,1)';
    container.style.transform  = 'translateY(' + (_PTR_MAX_TRANSLATE * 0.35) + 'px)';
    spin.classList.add('is-loading');
    setLabel('Actualisation\u2026', 'ressources, réservations…');

    try {
      await onRefresh();
    } catch (err) {
      console.error('[ptr] refresh failed', err);
    }

    spin.classList.remove('is-loading');
    pill.classList.add('is-done');
    setLabel('Actualisé', 'à jour\u00a0• maintenant');

    setTimeout(() => {
      pill.classList.add('is-fade');
      container.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)';
      container.style.transform  = 'translateY(0)';
      setTimeout(() => {
        pill.classList.remove('is-visible', 'is-done', 'is-fade');
        container.style.transition = '';
        delete pill.dataset.tick;
        loading = false;
        pullPct = 0;
      }, 500);
    }, 900);
  };

  container.addEventListener('touchstart',  onStart, { passive: true });
  container.addEventListener('touchmove',   onMove,  { passive: false });
  container.addEventListener('touchend',    onEnd);
  container.addEventListener('touchcancel', onEnd);
}
