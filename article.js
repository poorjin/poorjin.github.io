/**
 * article.js — Fetches a .md file from /posts/, parses frontmatter +
 * Markdown, and renders the article page.
 * Runs on article.html.
 */

/* ── Dark mode (runs before paint to avoid flash) ───── */

(function () {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

/* ── Markdown parser ─────────────────────────────────── */

function parseMarkdown(md) {
  // Escape HTML in raw text nodes to prevent XSS
  function esc(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // Fenced code blocks (``` lang ... ```)
  md = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, function (_, lang, code) {
    return `<pre><code class="language-${esc(lang)}">${esc(code.trimEnd())}</code></pre>`;
  });

  // Standalone image lines — ![alt](src) or ![alt](src "caption") — become <figure>
  md = md.replace(/^!\[([^\]]*)\]\(([^)"]+)(?:\s+"([^"]+)")?\)$/gm, function (_, alt, src, caption) {
    const img = `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
    return caption
      ? `<figure>${img}<figcaption>${esc(caption)}</figcaption></figure>`
      : `<figure>${img}</figure>`;
  });

  const lines = md.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Pre blocks already inserted as raw HTML — pass through
    if (line.startsWith("<pre")) {
      let block = line;
      while (i < lines.length - 1 && !lines[i].includes("</pre>")) {
        i++;
        block += "\n" + lines[i];
      }
      out.push(block);
      i++;
      continue;
    }

    // ATX headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h3) { out.push(`<h3>${inline(h3[1])}</h3>`); i++; continue; }
    if (h2) { out.push(`<h2>${inline(h2[1])}</h2>`); i++; continue; }
    if (h1) { out.push(`<h1>${inline(h1[1])}</h1>`); i++; continue; }

    // Blockquote
    if (line.startsWith("> ")) {
      let block = line.slice(2);
      while (i + 1 < lines.length && lines[i + 1].startsWith("> ")) {
        i++;
        block += " " + lines[i].slice(2);
      }
      out.push(`<blockquote><p>${inline(block)}</p></blockquote>`);
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[\-\*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\-\*] /)) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\. /, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === "") { i++; continue; }

    // Paragraph — collect consecutive non-blank, non-heading lines
    const para = [];
    while (i < lines.length && lines[i].trim() !== "" &&
           !lines[i].match(/^#{1,3} /) && !lines[i].startsWith("> ") &&
           !lines[i].match(/^[\-\*] /) && !lines[i].match(/^\d+\. /) &&
           !lines[i].startsWith("<pre")) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}

// Inline formatting: bold, italic, inline code, images, links
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

/* ── Frontmatter parser ─────────────────────────────── */

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  match[1].split("\n").forEach(function (line) {
    const kv = line.match(/^(\w+):\s*"?(.+?)"?$/);
    if (kv) meta[kv[1]] = kv[2];
  });

  return { meta: meta, body: raw.slice(match[0].length) };
}

/* ── Main ────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function () {

  /* Sync highlight.js theme with current color scheme */
  function syncHljsTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const light = document.getElementById("hljs-theme");
    const darkSheet = document.getElementById("hljs-theme-dark");
    if (light)     light.media     = dark ? "not all" : "all";
    if (darkSheet) darkSheet.media = dark ? "all" : "not all";
  }

  /* Dark mode toggle */
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
      syncHljsTheme();
    });
  }

  /* Reading progress bar */
  const bar = document.getElementById("progressBar");
  if (bar) {
    window.addEventListener("scroll", function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0) + "%";
    });
  }

  /* Render article */
  const container = document.getElementById("article-content");
  if (!container) return;

  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    container.innerHTML = notFound();
    return;
  }

  fetch("/posts/" + slug + ".md")
    .then(function (res) {
      if (!res.ok) throw new Error("not found");
      return res.text();
    })
    .then(function (raw) {
      const { meta, body } = parseFrontmatter(raw);

      document.title = (meta.title || slug) + " — Jin Dai";
      const metaDesc = document.querySelector("meta[name='description']");
      if (metaDesc) metaDesc.setAttribute("content", meta.lede || "");

      container.innerHTML = `
        <a href="/" class="article-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          All writing
        </a>
        <header class="article-header">
          <h1>${meta.title || slug}</h1>
          ${meta.lede ? `<p class="lede">${meta.lede}</p>` : ""}
          <p class="meta">${meta.date || ""} &nbsp;&middot;&nbsp; ${meta.readTime || ""}</p>
        </header>
        <div class="article-body">
          ${parseMarkdown(body)}
        </div>
      `;

      // Syntax highlight all code blocks
      if (typeof hljs !== "undefined") {
        container.querySelectorAll("pre code").forEach(function (block) {
          hljs.highlightElement(block);
        });
        syncHljsTheme();
      }
    })
    .catch(function () {
      container.innerHTML = notFound();
    });
});

function notFound() {
  return `
    <a href="/" class="article-back">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      All writing
    </a>
    <p style="color:var(--muted);font-family:var(--sans);font-size:15px;">Article not found.</p>
  `;
}
