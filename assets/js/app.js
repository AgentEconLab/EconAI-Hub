const DATA_CACHE = new Map();
const state = {
  lang: localStorage.getItem('ae-lang') || 'zh',
  bundle: null,
};

const app = document.getElementById('app');
const header = document.getElementById('site-header');
const footer = document.getElementById('site-footer');
const toast = document.getElementById('toast');

window.addEventListener('hashchange', () => renderRoute());
document.addEventListener('click', handleDelegatedClick);
document.addEventListener('input', handleFilterEvent);
document.addEventListener('change', handleFilterEvent);

document.addEventListener('DOMContentLoaded', async () => {
  await loadBundle(state.lang);
  renderRoute();
});

async function fetchJSON(path) {
  if (!DATA_CACHE.has(path)) {
    const req = fetch(path).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${path}`);
      return res.json();
    });
    DATA_CACHE.set(path, req);
  }
  return DATA_CACHE.get(path);
}

async function loadBundle(lang) {
  const site = await fetchJSON(`data/${lang}/site.json`);
  const tracks = await Promise.all(
    site.trackFiles.map((slug) => fetchJSON(`data/${lang}/tracks/${slug}.json`))
  );
  state.lang = lang;
  state.bundle = { site, tracks };
  localStorage.setItem('ae-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = site.siteTitle;
}

function t(path) {
  return path.split('.').reduce((acc, key) => acc?.[key], state.bundle.site) ?? '';
}

function parseRoute() {
  const hash = window.location.hash || '#/';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return { name: 'home' };
  if (parts[0] === 'track' && parts[1] && parts[2] === 'subcategory' && parts[3]) {
    return { name: 'subcategory', trackSlug: parts[1], subSlug: parts[3] };
  }
  if (parts[0] === 'track' && parts[1]) {
    return { name: 'track', trackSlug: parts[1] };
  }
  return { name: 'home' };
}

function getTrack(slug) {
  return state.bundle.tracks.find((track) => track.slug === slug);
}

function getSubcategory(track, subSlug) {
  return track?.subcategories.find((sub) => sub.slug === subSlug);
}

function allPapers() {
  return state.bundle.tracks.flatMap((track) =>
    track.subcategories.flatMap((sub) =>
      (sub.papers || []).map((paper) => ({ ...paper, trackSlug: track.slug, trackTitle: track.title, subSlug: sub.slug, subTitle: sub.title }))
    )
  );
}

function featuredPapers() {
  return allPapers().filter((paper) => paper.featured);
}

function yearsFromPapers(papers) {
  return [...new Set(papers.map((paper) => paper.year).filter((year) => Number.isFinite(Number(year))))]
    .sort((a, b) => b - a);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHeader() {
  const route = parseRoute();
  header.innerHTML = `
    <div class="topbar glass">
      <a class="brand" href="#/">
        <span class="brand-mark">${escapeHtml(state.bundle.site.brandShort)}</span>
        <span class="brand-copy">
          <strong>${escapeHtml(state.bundle.site.siteTitle)}</strong>
          <span>${escapeHtml(t('common.maintainedBy'))}</span>
        </span>
      </a>
      <nav class="topnav">
        <a class="${route.name === 'home' ? 'active' : ''}" href="#/">${escapeHtml(t('nav.home'))}</a>
        <a class="${route.trackSlug === 'ai-for-economics' ? 'active' : ''}" href="#/track/ai-for-economics">${escapeHtml(t('nav.ai'))}</a>
        <a class="${route.trackSlug === 'agentic-economy' ? 'active' : ''}" href="#/track/agentic-economy">${escapeHtml(t('nav.agentic'))}</a>
      </nav>
      <div class="lang-switch" aria-label="language switch">
        <button class="lang-btn ${state.lang === 'zh' ? 'active' : ''}" data-lang="zh">中文</button>
        <button class="lang-btn ${state.lang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
      </div>
    </div>
  `;
}

function renderFooter() {
  footer.innerHTML = `
    <div class="footer-card glass reveal">
      <div>
        <div class="footer-title">${escapeHtml(state.bundle.site.siteTitle)}</div>
        <p>${escapeHtml(t('common.footerNote'))}</p>
      </div>
      <div class="footer-meta">
        <span class="pill">GitHub Pages</span>
        <span class="pill">Hash Routing</span>
        <span class="pill">JSON → UI</span>
        <span class="pill">Bilingual</span>
      </div>
    </div>
  `;
}

function pageShell({ breadcrumb, kicker, title, intro, aside = '' }) {
  return `
    <section class="surface page-head reveal">
      <div class="page-grid">
        <div>
          <div class="breadcrumb">${breadcrumb}</div>
          <div class="eyebrow">${escapeHtml(kicker)}</div>
          <h1 class="page-title">${escapeHtml(title)}</h1>
          <p class="lead">${escapeHtml(intro)}</p>
        </div>
        ${aside}
      </div>
    </section>
  `;
}

function trackCard(track) {
  return `
    <a class="track-card reveal" href="#/track/${escapeHtml(track.slug)}">
      <div class="card-kicker">${escapeHtml(track.kicker)}</div>
      <h3>${escapeHtml(track.title)}</h3>
      <p>${escapeHtml(track.description)}</p>
      <div class="card-meta">
        <span class="pill">${track.subcategories.length} sections</span>
        <span class="pill">JSON-driven</span>
      </div>
    </a>
  `;
}

function subcategoryCard(track, sub) {
  return `
    <a class="subcat-card reveal" href="#/track/${escapeHtml(track.slug)}/subcategory/${escapeHtml(sub.slug)}">
      <div class="card-kicker">${escapeHtml(t('common.openSubcategory'))}</div>
      <h3>${escapeHtml(sub.title)}</h3>
      <p>${escapeHtml(sub.description)}</p>
      <div class="tag-row">${(sub.fields || []).slice(0, 4).map((field) => `<span class="tag">${escapeHtml(field)}</span>`).join('')}</div>
    </a>
  `;
}

function readingPathCard(path) {
  return `
    <article class="path-card reveal">
      <div class="card-kicker">${escapeHtml(path.label || t('common.routeLabel'))}</div>
      <h3>${escapeHtml(path.title)}</h3>
      <ol class="path-list">
        ${(path.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
    </article>
  `;
}

function searchPanel({ scopeId, title, eyebrow, note, papers }) {
  const years = yearsFromPapers(papers);
  return `
    <section class="surface reveal js-filter-root" data-scope-id="${escapeHtml(scopeId)}">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(eyebrow)}</div>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <p class="section-note">${escapeHtml(note)}</p>
      </div>
      <div class="search-bar">
        <label class="field field-grow">
          <span>${escapeHtml(t('common.keywordLabel'))}</span>
          <input type="search" data-role="keyword" placeholder="${escapeHtml(t('common.keywordPlaceholder'))}" />
        </label>
        <label class="field field-year">
          <span>${escapeHtml(t('common.yearLabel'))}</span>
          <select data-role="year">
            <option value="all">${escapeHtml(t('common.allYears'))}</option>
            ${years.map((year) => `<option value="${year}">${year}</option>`).join('')}
          </select>
        </label>
        <button class="button ghost" data-action="reset-filters">${escapeHtml(t('common.resetFilters'))}</button>
        <div class="result-badge"><strong data-role="count">${papers.length}</strong><span>${escapeHtml(t('common.resultsPrefix'))}</span></div>
      </div>
      <div class="paper-grid js-filter-grid">
        ${papers.length ? papers.map(renderPaperCard).join('') : emptyState()}
      </div>
      <div class="empty-inline hidden" data-role="empty-inline">
        <h3>${escapeHtml(t('common.noResultsTitle'))}</h3>
        <p>${escapeHtml(t('common.noResultsText'))}</p>
      </div>
    </section>
  `;
}

function emptyState() {
  return `
    <div class="empty-state">
      <h3>${escapeHtml(t('common.emptyTitle'))}</h3>
      <p>${escapeHtml(t('common.emptyText'))}</p>
    </div>
  `;
}

function renderPaperCard(paper) {
  const searchText = [paper.title, paper.abstract, paper.venue, paper.citation, paper.publicationStatus, paper.subtheme, paper.groupTitle, ...(paper.tags || []), paper.trackTitle, paper.subTitle, paper.authors]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const location = paper.trackSlug && paper.subSlug
    ? `<a class="text-link" href="#/track/${escapeHtml(paper.trackSlug)}/subcategory/${escapeHtml(paper.subSlug)}">${escapeHtml(paper.trackTitle)} · ${escapeHtml(paper.subTitle)}</a>`
    : '';
  const taxonomyBits = [paper.subtheme, paper.groupTitle].filter(Boolean);
  return `
    <article class="paper-card" data-year="${escapeHtml(paper.year)}" data-search="${escapeHtml(searchText)}">
      <div class="paper-topline">
        <span class="year-chip">${escapeHtml(paper.yearNote || paper.year)}</span>
        <span class="venue-chip">${escapeHtml(paper.publicationStatus || paper.venue || '—')}</span>
      </div>
      <h3>${escapeHtml(paper.title)}</h3>
      ${paper.authors ? `<div class="paper-authors">${escapeHtml(paper.authors)}</div>` : ''}
      ${taxonomyBits.length ? `<div class="paper-taxonomy">${taxonomyBits.map((bit) => `<span class="paper-taxonomy-item">${escapeHtml(bit)}</span>`).join('')}</div>` : ''}
      <p class="paper-abstract">${escapeHtml(paper.abstract)}</p>
      <div class="citation-block">
        <span class="caption">${escapeHtml(t('common.citationLabel'))}</span>
        <p>${escapeHtml(paper.citation || '—')}</p>
      </div>
      <div class="meta-shelf">
        <div class="tag-row">${(paper.tags || []).map((tag) => `<button class="tag tag-button" type="button" data-action="tag-filter" data-tag-filter="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join('')}</div>
        ${paper.path ? `<div class="route-pill"><span>${escapeHtml(t('common.routeLabel'))}</span><strong>${escapeHtml(paper.path)}</strong></div>` : ''}
      </div>
      <div class="paper-actions">
        ${paper.link && paper.link !== '#'
          ? `<a class="button primary" href="${escapeHtml(paper.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('common.originalLink'))}</a>`
          : `<span class="button disabled">${escapeHtml(t('common.originalLink'))}</span>`}
        <button class="button ghost" type="button" data-action="copy-citation" data-citation="${escapeHtml(paper.citation || '')}">${escapeHtml(t('common.copyCitation'))}</button>
      </div>
      ${location ? `<div class="paper-location">${location}</div>` : ''}
    </article>
  `;
}

function chapterOverviewCard(chapter) {
  const stats = (chapter.stats || []).map((item) => `
    <div class="summary-stat">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join('');
  return `
    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(chapter.chapterEyebrow || t('subcategoryPage.papersEyebrow'))}</div>
          <h2>${escapeHtml(chapter.chapterTitle)}</h2>
        </div>
        <p class="section-note">${escapeHtml(chapter.chapterIntro || '')}</p>
      </div>
      <div class="chapter-grid">
        <article class="callout">
          <h3>${escapeHtml(chapter.definitionTitle || 'Definition')}</h3>
          <div class="chapter-copy">${(chapter.definition || []).map((para) => `<p>${escapeHtml(para)}</p>`).join('')}</div>
        </article>
        <article class="callout">
          <h3>${escapeHtml(chapter.criteriaTitle || 'Criteria')}</h3>
          <ul class="compact-list">${(chapter.criteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </article>
      </div>
      ${(chapter.stats || []).length ? `<div class="summary-grid">${stats}</div>` : ''}
    </section>
  `;
}

function renderChapterGroups(chapters = []) {
  return chapters.map((chapter) => `
    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('subcategoryPage.papersEyebrow'))}</div>
          <h2>${escapeHtml(chapter.groupTitle || chapter.chapterTitle)}</h2>
        </div>
        <p class="section-note">${escapeHtml(chapter.groupNote || '')}</p>
      </div>
      <div class="chapter-stack">
        ${(chapter.paperGroups || []).map((group) => `
          <section class="group-block">
            <div class="group-head">
              <h3>${escapeHtml(group.title)}</h3>
              <span class="pill">${group.papers?.length || 0} papers</span>
            </div>
            <div class="paper-grid">
              ${(group.papers || []).map(renderPaperCard).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function renderTimeline(timeline = []) {
  if (!timeline.length) return '';
  return `
    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('subcategoryPage.timelineEyebrow'))}</div>
          <h2>${escapeHtml(t('subcategoryPage.timelineTitle'))}</h2>
        </div>
        <p class="section-note">${escapeHtml(t('subcategoryPage.timelineNote'))}</p>
      </div>
      <div class="timeline-grid">
        ${timeline.map((item, index) => `
          <article class="timeline-card">
            <div class="timeline-index">${index + 1}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderHome() {
  const featured = featuredPapers();
  return `
    <section class="hero reveal">
      <div class="hero-copy glass">
        <div class="eyebrow">${escapeHtml(state.bundle.site.hero.eyebrow)}</div>
        <h1>${escapeHtml(state.bundle.site.hero.titlePrefix)} <span class="serif">${escapeHtml(state.bundle.site.hero.titleAccent)}</span></h1>
        <p class="lead hero-lead">${escapeHtml(state.bundle.site.hero.description)}</p>
        <div class="hero-actions">
          <a class="button primary" href="#tracks">${escapeHtml(state.bundle.site.hero.primaryCta)}</a>
          <a class="button ghost" href="#paper-finder">${escapeHtml(state.bundle.site.hero.secondaryCta)}</a>
        </div>
      </div>
      <div class="hero-panel glass">
        <div class="mini-stack">
          ${state.bundle.site.hero.panels.map((panel) => `
            <article class="mini-card floating-card">
              <div class="card-kicker">${escapeHtml(panel.label)}</div>
              <h3>${escapeHtml(panel.title)}</h3>
              <p>${escapeHtml(panel.text)}</p>
            </article>
          `).join('')}
          <div class="stat-grid">
            ${state.bundle.site.hero.stats.map((stat) => `
              <div class="stat-card">
                <span>${escapeHtml(stat.label)}</span>
                <strong>${escapeHtml(stat.value)}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <section id="tracks" class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('home.tracksEyebrow'))}</div>
          <h2>${escapeHtml(t('home.tracksTitle'))}</h2>
        </div>
        <p class="section-note">${escapeHtml(t('home.tracksNote'))}</p>
      </div>
      <div class="track-grid">
        ${state.bundle.tracks.map(trackCard).join('')}
      </div>
    </section>

    <div id="paper-finder">
      ${searchPanel({
        scopeId: 'home',
        title: t('home.finderTitle'),
        eyebrow: t('home.finderEyebrow'),
        note: t('home.finderNote'),
        papers: allPapers(),
      })}
    </div>

    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('home.featuredEyebrow'))}</div>
          <h2>${escapeHtml(t('home.featuredTitle'))}</h2>
        </div>
        <p class="section-note">${escapeHtml(t('home.featuredNote'))}</p>
      </div>
      <div class="paper-grid">
        ${featured.map(renderPaperCard).join('')}
      </div>
    </section>
  `;
}

function renderTrack(track) {
  const papers = track.subcategories.flatMap((sub) => (sub.papers || []).map((paper) => ({ ...paper, trackSlug: track.slug, trackTitle: track.title, subSlug: sub.slug, subTitle: sub.title })));
  return `
    ${pageShell({
      breadcrumb: `<a href="#/">${escapeHtml(t('common.homeCrumb'))}</a><span>·</span><span>${escapeHtml(track.title)}</span>`,
      kicker: track.kicker,
      title: track.title,
      intro: track.description,
      aside: `<aside class="callout"><h3>${escapeHtml(t('trackPage.pathTitle'))}</h3><p>${escapeHtml(track.intro)}</p></aside>`,
    })}

    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('trackPage.overviewEyebrow'))}</div>
          <h2>${escapeHtml(t('trackPage.overviewTitle'))}</h2>
        </div>
        <p class="section-note">${escapeHtml(t('trackPage.overviewNote'))}</p>
      </div>
      <div class="subcat-grid">
        ${track.subcategories.map((sub) => subcategoryCard(track, sub)).join('')}
      </div>
    </section>

    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('trackPage.pathEyebrow'))}</div>
          <h2>${escapeHtml(t('trackPage.pathTitle'))}</h2>
        </div>
        <p class="section-note">${escapeHtml(t('trackPage.pathNote'))}</p>
      </div>
      <div class="path-grid">
        ${(track.readingPaths || []).map(readingPathCard).join('')}
      </div>
    </section>

    ${searchPanel({
      scopeId: `track-${track.slug}`,
      title: t('trackPage.finderTitle'),
      eyebrow: t('trackPage.finderEyebrow'),
      note: t('trackPage.finderNote'),
      papers,
    })}
  `;
}

function renderSubcategory(track, sub) {
  const papers = (sub.papers || []).map((paper) => ({ ...paper, trackSlug: track.slug, trackTitle: track.title, subSlug: sub.slug, subTitle: sub.title }));
  const recHtml = (sub.recommendation || []).length
    ? `<aside class="callout"><h3>${escapeHtml(t('common.routeLabel'))}</h3><ul class="compact-list">${sub.recommendation.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></aside>`
    : '';
  const chapters = (sub.chapters || []).map((chapter) => ({
    ...chapter,
    papers: (chapter.papers || []).map((paper) => ({ ...paper, trackSlug: track.slug, trackTitle: track.title, subSlug: sub.slug, subTitle: sub.title })),
    paperGroups: (chapter.paperGroups || []).map((group) => ({
      ...group,
      papers: (group.papers || []).map((paper) => ({ ...paper, trackSlug: track.slug, trackTitle: track.title, subSlug: sub.slug, subTitle: sub.title }))
    }))
  }));

  return `
    ${pageShell({
      breadcrumb: `<a href="#/">${escapeHtml(t('common.homeCrumb'))}</a><span>·</span><a href="#/track/${escapeHtml(track.slug)}">${escapeHtml(track.title)}</a><span>·</span><span>${escapeHtml(sub.title)}</span>`,
      kicker: track.kicker,
      title: sub.title,
      intro: sub.description,
      aside: recHtml,
    })}

    <section class="surface reveal">
      <div class="section-head">
        <div>
          <div class="eyebrow">${escapeHtml(t('trackPage.overviewEyebrow'))}</div>
          <h2>${escapeHtml(t('common.tagsLabel'))}</h2>
        </div>
        <p class="section-note">${escapeHtml(track.title)} · ${escapeHtml(sub.title)}</p>
      </div>
      <div class="tag-row">${(sub.fields || []).map((field) => `<span class="tag">${escapeHtml(field)}</span>`).join('')}</div>
    </section>

    ${chapters.map(chapterOverviewCard).join('')}

    ${searchPanel({
      scopeId: `sub-${track.slug}-${sub.slug}`,
      title: t('subcategoryPage.finderTitle'),
      eyebrow: t('subcategoryPage.finderEyebrow'),
      note: t('subcategoryPage.finderNote'),
      papers,
    })}

    ${chapters.length ? renderChapterGroups(chapters) : ''}

    ${renderTimeline(sub.timeline || [])}
  `;
}

async function renderRoute() {
  renderHeader();
  renderFooter();
  const route = parseRoute();
  if (route.name === 'track') {
    const track = getTrack(route.trackSlug);
    app.innerHTML = track ? renderTrack(track) : renderHome();
  } else if (route.name === 'subcategory') {
    const track = getTrack(route.trackSlug);
    const sub = getSubcategory(track, route.subSlug);
    app.innerHTML = track && sub ? renderSubcategory(track, sub) : renderHome();
  } else {
    app.innerHTML = renderHome();
  }
  enhanceView();
}

function enhanceView() {
  setupReveal();
  setupFilters();
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}

function setupFilters() {
  document.querySelectorAll('.js-filter-root').forEach((root) => applyFilters(root));
}

function applyFilters(root) {
  const keyword = root.querySelector('[data-role="keyword"]')?.value?.trim().toLowerCase() || '';
  const year = root.querySelector('[data-role="year"]')?.value || 'all';
  const cards = [...root.querySelectorAll('.paper-card')];
  let visibleCount = 0;

  cards.forEach((card) => {
    const yearOk = year === 'all' || card.dataset.year === year;
    const keywordOk = !keyword || card.dataset.search.includes(keyword);
    const visible = yearOk && keywordOk;
    card.classList.toggle('hidden', !visible);
    if (visible) visibleCount += 1;
  });

  const count = root.querySelector('[data-role="count"]');
  if (count) count.textContent = String(visibleCount);
  const empty = root.querySelector('[data-role="empty-inline"]');
  if (empty) empty.classList.toggle('hidden', visibleCount > 0 || cards.length === 0);
}

async function handleDelegatedClick(event) {
  const langBtn = event.target.closest('[data-lang]');
  if (langBtn) {
    const nextLang = langBtn.dataset.lang;
    if (nextLang && nextLang !== state.lang) {
      await loadBundle(nextLang);
      renderRoute();
    }
    return;
  }

  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  if (action === 'reset-filters') {
    const root = actionEl.closest('.js-filter-root');
    if (!root) return;
    const keyword = root.querySelector('[data-role="keyword"]');
    const year = root.querySelector('[data-role="year"]');
    if (keyword) keyword.value = '';
    if (year) year.value = 'all';
    applyFilters(root);
  }

  if (action === 'tag-filter') {
    const root = actionEl.closest('.js-filter-root') || document.querySelector('.js-filter-root');
    if (!root) return;
    const keyword = root.querySelector('[data-role="keyword"]');
    if (keyword) keyword.value = actionEl.dataset.tagFilter || '';
    applyFilters(root);
    root.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (action === 'copy-citation') {
    const citation = actionEl.dataset.citation || '';
    try {
      if (citation) {
        await navigator.clipboard.writeText(citation);
        showToast(t('common.copied'));
      }
    } catch (error) {
      showToast(t('common.copied'));
    }
  }
}

function handleFilterEvent(event) {
  if (!event.target.closest('.js-filter-root')) return;
  if (!event.target.matches('[data-role="keyword"], [data-role="year"]')) return;
  const root = event.target.closest('.js-filter-root');
  if (root) applyFilters(root);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.remove('show'), 1400);
}
