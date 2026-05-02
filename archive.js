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

  const container = document.getElementById("archive-content");
  if (!container) return;

  fetch("/posts/index.json")
    .then(function (res) { return res.json(); })
    .then(function (articles) {
      articles.sort(function (left, right) {
        return new Date(right.date) - new Date(left.date);
      });

      const groups = {};
      articles.forEach(function (article) {
        const date = new Date(article.date);
        const year = isNaN(date.getTime()) ? "Unknown" : String(date.getFullYear());
        const month = isNaN(date.getTime())
          ? "Undated"
          : date.toLocaleString("en-US", { month: "long" });

        if (!groups[year]) groups[year] = {};
        if (!groups[year][month]) groups[year][month] = [];
        groups[year][month].push(article);
      });

      const years = Object.keys(groups).sort(function (left, right) {
        return right.localeCompare(left, undefined, { numeric: true });
      });

      container.innerHTML = years.map(function (year) {
        const months = Object.keys(groups[year]).sort(function (left, right) {
          if (left === "Undated") return 1;
          if (right === "Undated") return -1;
          const leftDate = new Date(left + " 1, 2000");
          const rightDate = new Date(right + " 1, 2000");
          return rightDate - leftDate;
        });

        const monthHtml = months.map(function (month) {
          const items = groups[year][month].map(function (article) {
            const baseDate = article.dateShort || article.date;
            const updShort = article.updatedShort || article.updated;
            const showUpdated =
              updShort && updShort !== article.dateShort && updShort !== article.date;
            const dateLabel = showUpdated
              ? `${baseDate} <span class="archive-date-upd">· upd. ${updShort}</span>`
              : baseDate;
            return `
              <li>
                <a href="/article.html?slug=${article.slug}" class="archive-link">
                  <span class="archive-title-row">
                    <span class="archive-title">${article.title}</span>
                    <span class="archive-date">${dateLabel}</span>
                  </span>
                  <span class="archive-lede">${article.lede || ""}</span>
                </a>
              </li>
            `;
          }).join("");

          return `
            <section class="archive-month">
              <h3>${month}</h3>
              <ul class="archive-list">${items}</ul>
            </section>
          `;
        }).join("");

        return `
          <section class="archive-year">
            <h2>${year}</h2>
            ${monthHtml}
          </section>
        `;
      }).join("");
    })
    .catch(function () {
      container.innerHTML = `<p style="color:var(--muted);font-family:var(--sans);font-size:15px;">Could not load archive.</p>`;
    });
});