/* HunterArsenal landing page: reveal-on-scroll, the license flip, the mission demo, and the latest release details.
 * The only network request is to the public GitHub API for the latest release; every link works without it. */
(function () {
  'use strict';
  const REPO = 'melhive/hunterarsenal-app';
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Sections appear as they scroll into view.
  const items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    items.forEach(el => io.observe(el));
  }

  // License: tap to flip.
  const card = document.querySelector('[data-flip]');
  if (card) card.addEventListener('click', () => card.classList.toggle('flipped'));

  // Mission demo: habits tick off one by one, then the checklist resets.
  const list = document.querySelector('[data-mission]'), count = document.querySelector('[data-mission-count]'), bar = document.querySelector('[data-mission-bar]');
  if (list && count && bar) {
    const rows = [...list.children];
    const show = n => { rows.forEach((r, i) => r.classList.toggle('done', i < n)); count.textContent = `${n} / ${rows.length}`; bar.style.width = `${(n / rows.length) * 100}%`; };
    if (reduced) show(2);
    else { let n = 0; show(0); setInterval(() => { n = n >= rows.length ? 0 : n + 1; show(n); }, 1400); }
  }

  // Latest release: version, date, size, and notes from GitHub. On failure the static text stays.
  const set = (key, text) => document.querySelectorAll(`[data-release="${key}"]`).forEach(el => { el.textContent = text; });
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rel => {
      const apk = (rel.assets || []).find(a => a.name === 'HunterArsenal.apk');
      const version = String(rel.tag_name || '').replace(/^v/, '');
      const mb = apk ? (apk.size / 1048576).toFixed(1) + ' MB' : '';
      if (version) { set('version', `v${version}`); set('version-only', `v${version}`); }
      if (mb) { set('size', `${mb} · Android 6.0+`); set('size-only', mb); }
      if (rel.published_at) set('date', new Date(rel.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
      const body = String(rel.body || '');
      const notes = body.split('\n').filter(l => /^\s*[-*•]\s+/.test(l)).map(l => l.replace(/^\s*[-*•]\s+/, ''));
      const box = document.querySelector('[data-release="notes"]'), wrap = document.querySelector('[data-release-notes]');
      if (box && wrap && notes.length) {
        const ul = document.createElement('ul');
        notes.slice(0, 12).forEach(n => { const li = document.createElement('li'); li.textContent = n; ul.appendChild(li); });
        box.appendChild(ul); wrap.hidden = false;
      }
    })
    .catch(() => {});
})();
