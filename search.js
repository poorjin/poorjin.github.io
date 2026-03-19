/* ── Dark mode (runs before paint to avoid flash) ───── */

(function () {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

document.addEventListener("DOMContentLoaded", function () {
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

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  const results = document.getElementById("search-results");

  if (!searchInput || !results) return;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getSearchText(article) {
    const tags = Array.isArray(article.tags)
      ? article.tags.join(" ")
      : String(article.tags || "").replace(/,/g, " ");

    return normalizeText([
      article.title,
      article.lede,
      article.slug,
      article.date,
      tags
    ].join(" "));
  }

  function sortArticles(articles) {
    return articles.slice().sort(function (left, right) {
      return new Date(right.date) - new Date(left.date);
    });
  }

  function renderArticles(articles, query) {
    if (!query) {
      results.innerHTML = "";
      return;
    }

    if (!articles.length) {
      results.innerHTML = `
        <div class="search-empty">
          <p>No posts matched your search.</p>
        </div>
      `;
      return;
    }

    var countLabel = articles.length === 1 ? "1 post found" : articles.length + " posts found";

    results.innerHTML = `
      <p class="search-count">${countLabel}</p>
      <ul class="search-results-list">
        ${articles.map(function (article) {
          return `
            <li>
              <a class="search-result-link" href="/article.html?slug=${encodeURIComponent(article.slug)}">
                <span class="search-result-title-row">
                  <span class="search-result-title">${escapeHtml(article.title)}</span>
                  <span class="search-result-date">${escapeHtml(article.dateShort || article.date)}</span>
                </span>
              </a>
            </li>
          `;
        }).join("")}
      </ul>
    `;
  }

  function updateUrl(query) {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }

  function toggleClear(query) {
    if (searchClear) {
      searchClear.hidden = !query;
    }
  }

  let allArticles = [];

  function applySearch() {
    const query = searchInput.value.trim();
    const normalizedQuery = normalizeText(query);
    const filtered = !normalizedQuery
      ? []
      : allArticles.filter(function (article) {
          return article._searchText.indexOf(normalizedQuery) !== -1;
        });

    toggleClear(query);
    updateUrl(query);
    renderArticles(filtered, query);
  }

  fetch("/posts/index.json")
    .then(function (res) { return res.json(); })
    .then(function (articles) {
      allArticles = sortArticles(articles).map(function (article) {
        return Object.assign({}, article, {
          _searchText: getSearchText(article)
        });
      });

      const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
      searchInput.value = initialQuery;
      searchInput.focus();
      applySearch();

      searchInput.addEventListener("input", applySearch);

      if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
          event.preventDefault();
          applySearch();
        });
      }

      if (searchClear) {
        searchClear.addEventListener("click", function () {
          searchInput.value = "";
          searchInput.focus();
          applySearch();
        });
      }
    })
    .catch(function () {
      results.innerHTML = `
        <div class="search-empty">
          <h2>Could not load posts</h2>
          <p>Try refreshing the page in a moment.</p>
        </div>
      `;
    });
});
