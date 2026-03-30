(function () {
  const data = window.RESEARCH_DATA;
  const app = document.getElementById('app');

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function getTrack(slug) {
    return data.tracks.find((t) => t.slug === slug);
  }

  function getSubcategory(track, subSlug) {
    return track?.subcategories.find((s) => s.slug === subSlug);
  }

  function routeParts() {
    const hash = window.location.hash || '#/';
    return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  }

  function setActiveNav() {
    const hash = window.location.hash || '#/';
    qsa('.topnav a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === hash);
    });
  }

  function renderTrackCard(track) {
    return `
      <a class="track-card" href="#/track/${track.slug}">
        <div class="card-kicker">${track.kicker}</div>
        <h3>${track.title}</h3>
        <p class="track-desc">${track.description}</p>
        <div class="card-footer">
          <span class="chip">${track.subcategories.length} subcategories</span>
          <span class="chip">Curated reading path</span>
        </div>
      </a>
    `;
  }

  function renderHome() {
    const tpl = document.getElementById('hero-template');
    app.innerHTML = '';
    app.appendChild(tpl.content.cloneNode(true));
    qs('.track-grid', app).innerHTML = data.tracks.map(renderTrackCard).join('');
  }

  function pageShell({ breadcrumb, title, kicker, definition, extraRight = '' }) {
    return `
      <section class="surface reveal">
        <div class="page-head">
          <div class="page-header-copy">
            <div class="breadcrumb">${breadcrumb}</div>
            <div class="page-kicker">${kicker}</div>
            <h1 class="page-title">${title}</h1>
            <p class="definition">${definition}</p>
          </div>
          ${extraRight}
        </div>
      </section>
    `;
  }

  function renderTrackPage(track) {
    app.innerHTML = `
      ${pageShell({
        breadcrumb: `<a href="#/">Home</a><span>·</span><span>${track.title}</span>`,
        kicker: track.kicker,
        title: `${track.title}`,
        definition: track.description,
        extraRight: `<div class="callout"><h3>Reading mode</h3><p>Enter a subcategory to see its paper list. For behavior modeling, an additional evolution timeline is included.</p></div>`
      })}

      <section class="surface reveal">
        <div class="subheader">
          <div>
            <div class="eyebrow">Overview</div>
            <h2>Subcategories</h2>
          </div>
          <p class="section-note">Click a subcategory to open its dedicated paper list.</p>
        </div>
        <div class="subcat-grid">
          ${track.subcategories.map((sub) => `
            <a class="subcat-card" href="#/track/${track.slug}/subcategory/${sub.slug}">
              <div class="card-kicker">Subcategory</div>
              <h3>${sub.title}</h3>
              <p class="subcat-desc">${sub.description}</p>
              <div class="card-footer">
                ${sub.fields.slice(0, 3).map((f) => `<span class="chip">${f}</span>`).join('')}
              </div>
            </a>
          `).join('')}
        </div>
      </section>

      ${track.slug === 'ai-for-economics' ? `
      <section class="surface reveal">
        <div class="subheader">
          <div>
            <div class="eyebrow">Special module</div>
            <h2>Method evolution path</h2>
          </div>
          <a class="button secondary" href="#/track/${track.slug}/subcategory/behavior-modeling">Open behavior modeling</a>
        </div>
        <div class="dual-grid">
          <div class="callout">
            <h3>Economic Agent Behavior Modeling</h3>
            <p>
              This module includes an additional evolution timeline, designed to show how economic agent modeling progresses from equilibrium-based and macro-empirical traditions toward agent-based, reinforcement-learning, and LLM-driven approaches.
            </p>
            <div class="route-tiles">
              <span class="tag">Theory → simulation</span>
              <span class="tag">Microfoundations → interaction</span>
              <span class="tag">Optimization → generative agents</span>
            </div>
          </div>
          <div class="callout">
            <h3>Recommended use</h3>
            <p>
              Use this page as the front door for newcomers: first understand the modeling lineages, then open the detailed paper list inside the subcategory page.
            </p>
          </div>
        </div>
      </section>
      ` : ''}
    `;
  }

  function renderPapers(sub) {
    if (!sub.papers?.length) {
      return `
        <div class="empty-state">
          <h3>No papers yet</h3>
          <p class="section-note">Add entries in <code>content.js</code> to populate this section.</p>
        </div>
      `;
    }

    return `
      <div class="paper-grid">
        ${sub.papers.map((paper) => `
          <article class="paper-card">
            <div class="paper-time">${paper.year}</div>
            <h3>${paper.title}</h3>
            <p class="paper-abstract">${paper.abstract}</p>
            <div class="paper-meta">
              <span class="meta-label">${paper.field}</span>
              ${paper.link && paper.link !== '#' ? `<a class="paper-link" href="${paper.link}" target="_blank" rel="noopener noreferrer">Original link</a>` : `<span class="empty-pill">Link to fill</span>`}
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderTimeline(items = []) {
    if (!items.length) return '';
    return `
      <section class="surface reveal">
        <div class="subheader">
          <div>
            <div class="eyebrow">Extra module</div>
            <h2>Method evolution timeline</h2>
          </div>
          <p class="section-note">A compact roadmap from classical economic modeling to AI-native agent paradigms.</p>
        </div>
        <div class="timeline-grid">
          ${items.map((item, idx) => `
            <article class="timeline-card timeline-rail">
              <div class="timeline-node">${idx + 1}</div>
              <div class="card-kicker">Stage ${idx + 1}</div>
              <h3>${item.title}</h3>
              <p>${item.description}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderSubcategoryPage(track, sub) {
    app.innerHTML = `
      ${pageShell({
        breadcrumb: `<a href="#/">Home</a><span>·</span><a href="#/track/${track.slug}">${track.title}</a><span>·</span><span>${sub.title}</span>`,
        kicker: 'Subcategory',
        title: sub.title,
        definition: sub.description,
        extraRight: `<div class="callout"><h3>Included content</h3><p>This page combines field tags with an expandable paper list format suitable for a GitHub Pages reading portal.</p></div>`
      })}

      <section class="surface reveal">
        <div class="subheader">
          <div>
            <div class="eyebrow">Scope</div>
            <h2>Fine-grained directions</h2>
          </div>
        </div>
        <div class="route-tiles">
          ${sub.fields.map((field) => `<span class="tag">${field}</span>`).join('')}
        </div>
      </section>

      ${renderTimeline(sub.timeline)}

      <section class="surface reveal">
        <div class="subheader">
          <div>
            <div class="eyebrow">Reading list</div>
            <h2>Paper list</h2>
          </div>
          <p class="section-note">Each card supports title, abstract, year, and original link.</p>
        </div>
        ${renderPapers(sub)}
      </section>
    `;
  }

  function renderNotFound() {
    app.innerHTML = `
      <section class="surface reveal">
        <div class="empty-state">
          <h3>Page not found</h3>
          <p class="section-note">The route does not exist. Return to the homepage to continue browsing.</p>
          <div class="inline-actions" style="justify-content:center; margin-top: 16px;">
            <a class="button primary" href="#/">Back home</a>
          </div>
        </div>
      </section>
    `;
  }

  function render() {
    const [type, trackSlug, maybeSubLabel, subSlug] = routeParts();
    setActiveNav();

    if (!type) {
      renderHome();
      return;
    }

    if (type === 'track' && trackSlug && !maybeSubLabel) {
      const track = getTrack(trackSlug);
      if (!track) return renderNotFound();
      renderTrackPage(track);
      return;
    }

    if (type === 'track' && trackSlug && maybeSubLabel === 'subcategory' && subSlug) {
      const track = getTrack(trackSlug);
      const sub = getSubcategory(track, subSlug);
      if (!track || !sub) return renderNotFound();
      renderSubcategoryPage(track, sub);
      return;
    }

    renderNotFound();
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', render);
})();
