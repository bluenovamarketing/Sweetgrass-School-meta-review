const adList = document.querySelector('#ad-list');
const data = await fetch('campaign.json').then(response => {
  if (!response.ok) throw new Error('Campaign data could not be loaded.');
  return response.json();
});

const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

function optionList(items) {
  return `<ol class="option-list">${items.map(item => `<li>${esc(item)}</li>`).join('')}</ol>`;
}

function mediaMarkup(ad, format = 'feed') {
  const isFeed = format === 'feed';
  const file = isFeed ? ad.feedMedia : ad.verticalMedia;
  const cover = isFeed ? ad.feedCover : ad.verticalCover;
  if (ad.type === 'video') {
    return `<video controls playsinline preload="metadata" poster="${esc(cover)}"><source src="${esc(file)}" type="video/mp4">Your browser does not support video playback.</video>`;
  }
  return `<img src="${esc(file)}" alt="${esc(ad.accessibility)}" loading="lazy">`;
}

adList.innerHTML = data.ads.map((ad, index) => `
  <article class="ad-card" data-ad="${index}">
    <div class="creative-panel">
      <div class="creative-topline">
        <span class="concept-chip">${ad.type === 'video' ? 'Approved video' : 'Approved image'}</span>
        <div class="format-switch" role="group" aria-label="Preview placement format">
          <button type="button" class="active" data-format="feed">Feed</button>
          <button type="button" data-format="vertical">Stories / Reels</button>
        </div>
      </div>
      <div class="media-frame feed" data-media>${mediaMarkup(ad, 'feed')}</div>
      <p class="media-note" data-media-note>Facebook Feed · 1080 × 1350</p>
    </div>
    <div class="copy-panel">
      <div class="ad-kicker">Ad ${index + 1} <span>${ad.type}</span></div>
      <h3>${esc(ad.title.replace(/^\d+\s+—\s+/, ''))}</h3>
      <p class="hypothesis">${esc(ad.hypothesis)}</p>

      <div class="mock-ad" aria-label="Example Facebook ad copy combination">
        <div class="mock-ad-head">
          <img class="mock-avatar" src="sweetgrass-logo-square-cream-1080x1080.png" alt="">
          <div><strong>The Sweetgrass School</strong><small>Sponsored · Facebook</small></div>
        </div>
        <p class="mock-primary">${esc(ad.primary[0])}</p>
        <div class="mock-link">
          <div><small>thesweetgrassschool.com</small><strong>${esc(ad.headlines[0])}</strong><span>${esc(ad.descriptions[0])}</span></div>
          <button type="button" tabindex="-1">Learn More</button>
        </div>
      </div>

      <details class="copy-options">
        <summary>Primary text options <span>${ad.primary.length}</span></summary>
        ${optionList(ad.primary)}
      </details>
      <details class="copy-options">
        <summary>Headline options <span>${ad.headlines.length}</span></summary>
        ${optionList(ad.headlines)}
      </details>
      <details class="copy-options">
        <summary>Description options <span>${ad.descriptions.length}</span></summary>
        ${optionList(ad.descriptions)}
      </details>
      <p class="tech-line"><strong>Ad name:</strong> ${esc(ad.adName)}<br><strong>CTA:</strong> Learn More<br><strong>Tracking:</strong> ${esc(ad.utm)}</p>
    </div>
  </article>
`).join('');

for (const card of document.querySelectorAll('.ad-card')) {
  const ad = data.ads[Number(card.dataset.ad)];
  const media = card.querySelector('[data-media]');
  const note = card.querySelector('[data-media-note]');
  for (const button of card.querySelectorAll('[data-format]')) {
    button.addEventListener('click', () => {
      const format = button.dataset.format;
      card.querySelectorAll('[data-format]').forEach(item => item.classList.toggle('active', item === button));
      media.className = `media-frame ${format}`;
      media.innerHTML = mediaMarkup(ad, format);
      note.textContent = format === 'feed' ? 'Facebook Feed · 1080 × 1350' : 'Facebook Stories / Reels · 1080 × 1920';
    });
  }
}

let expanded = false;
document.querySelector('[data-expand]').addEventListener('click', event => {
  expanded = !expanded;
  document.querySelectorAll('details.copy-options').forEach(detail => { detail.open = expanded; });
  event.currentTarget.textContent = expanded ? 'Collapse all copy' : 'Expand all copy';
});

document.querySelector('[data-print]').addEventListener('click', () => window.print());
