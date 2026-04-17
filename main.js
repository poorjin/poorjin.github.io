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

      container.innerHTML = html;
    })
    .catch(function () {
      container.innerHTML = `<p style="color:var(--muted);font-family:var(--sans);font-size:15px;">Could not load posts.</p>`;
    });
});
