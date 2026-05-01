/**
 * main.js — Dark mode + homepage rendering.
 * Runs on index.html.
 *
 * Articles are loaded from posts/index.json — no inline data needed here.
 */

/* ── Dark mode (runs before paint to avoid flash) ───── */

(function () {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

document.addEventListener("DOMContentLoaded", function () {

  /* ── Dark mode toggle ──────────────────────────────── */

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  /* ── Render homepage from manifest ────────────────── */

  const container = document.getElementById("content");
  if (!container) return;

  fetch("/posts/index.json")
    .then(function (res) { return res.json(); })
    .then(function (articles) {
      const HOMEPAGE_LIMIT = 5;
      const featured = articles.find(function (a) { return a.featured; }) || articles[0];
      const rest = articles
        .filter(function (a) { return a !== featured; })
        .slice(0, HOMEPAGE_LIMIT - 1);
      const hasMore = articles.length > HOMEPAGE_LIMIT;

      let html = `
        <article class="featured">
          <span class="thumb" aria-hidden="true">
            <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="55" height="55" rx="2" stroke="currentColor"/>
              <rect x="14.5" y="16.5" width="23" height="23" rx="1" stroke="currentColor"/>
            </svg>
          </span>
          <span class="label">Featured</span>
          <h2><a href="/article.html?slug=${featured.slug}">${featured.title}</a></h2>
          <p class="lede">${featured.lede}</p>
          <p class="meta">${featured.date}</p>
        </article>
      `;

      if (rest.length > 0) {
        html += `<ul class="post-list">`;
        rest.forEach(function (a) {
          html += `
            <li>
              <a href="/article.html?slug=${a.slug}" class="post-title">
                ${a.title}
                <span class="sub">${a.lede}</span>
              </a>
              <span class="post-date">${a.dateShort}</span>
            </li>
          `;
        });
        html += `</ul>`;
      }

      if (hasMore) {
        html += `<p class="see-all"><a href="/archive.html">See all posts &rarr;</a></p>`;
      }

      html += `
        <section class="currently">
          <span class="k">Current Focus</span>
          <p class="focus-line">Building an experimentation platform around two bets: Bayesian inference as the stats core, and agents as the primary interface. Right now I&rsquo;m heads-down on the agent layer and the shared knowledge layer that backs it.</p>
        </section>
      `;

      container.innerHTML = html;
    })
    .catch(function () {
      container.innerHTML = `<p style="color:var(--muted);font-family:var(--sans);font-size:15px;">Could not load posts.</p>`;
    });
});
