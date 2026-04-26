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

  // Pull sidenote definitions out, replace inline refs with sup + aside.
  // Order matters: do this BEFORE other inline parsing so paragraphs collect cleanly.
  const notes = {};
  md = md.replace(/^\[\^(\w+)\]:\s*(.+)$/gm, function (_, k, v) {
    notes[k] = v.trim();
    return "";
  });
  let noteCounter = 0;
  const noteOrder = {};
  md = md.replace(/\[\^(\w+)\]/g, function (_, k) {
    if (!notes[k]) return "";
    if (!(k in noteOrder)) noteOrder[k] = ++noteCounter;
    const n = noteOrder[k];
    return `<sup class="snref">${n}</sup>` +
      `<aside class="sidenote"><span class="snlabel">Note ${n}</span>${notes[k]}</aside>`;
  });

  // Fenced code blocks (``` lang ... ```)
  md = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, function (_, lang, code) {
    return `<pre><code class="language-${esc(lang)}">${esc(code.trimEnd())}</code></pre>`;
  });

  // Standalone image lines — ![alt](src) or ![alt](src "caption") — become <figure>.
  // Optional trailing {.wide|.bleed|.diptych credit="..."} attribute block.
  // Diptych: src can be "a.jpg|b.jpg" — two images side-by-side.
  md = md.replace(/^!\[([^\]]*)\]\(([^)"]+)(?:\s+"([^"]+)")?\)(?:\s*\{([^}]+)\})?$/gm,
    function (_, alt, src, caption, attrs) {
      const a = attrs || "";
      const variant = (a.match(/\.(wide|bleed|diptych|column)/) || [, "column"])[1];
      const credit = (a.match(/credit="([^"]+)"/) || [, ""])[1];
      const cls = "figure figure--" + variant;
      const sources = src.split("|").map(function (s) { return s.trim(); });
      let frame;
      if (variant === "diptych" && sources.length >= 2) {
        frame = `<div class="figure-frame">` +
          `<img src="${esc(sources[0])}" alt="${esc(alt)}" loading="lazy">` +
          `<img src="${esc(sources[1])}" alt="${esc(alt)}" loading="lazy">` +
          `</div>`;
      } else {
        frame = `<div class="figure-frame"><img src="${esc(sources[0])}" alt="${esc(alt)}" loading="lazy"></div>`;
      }
      const figNum = `<span class="fig-num">Fig.</span>`;
      const creditHtml = credit ? `<span class="fig-credit">— ${esc(credit)}</span>` : "";
      const cap = caption || alt;
      const figcap = cap || credit
        ? `<figcaption>${figNum}<span class="fig-text">${esc(cap)}${creditHtml}</span></figcaption>`
        : "";
      return `<figure class="${cls}">${frame}${figcap}</figure>`;
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

/* ── Read time ───────────────────────────────────────── */

function calcReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return mins + " min read";
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
      const readTime = calcReadTime(body);

      document.title = (meta.title || slug) + " — Jin’s Latent Space";
      const setMeta = function(sel, val) { const el = document.querySelector(sel); if (el) el.setAttribute("content", val); };
      setMeta("meta[name='description']",       meta.lede || "");
      setMeta("meta[property='og:title']",       meta.title || "");
      setMeta("meta[property='og:description']", meta.lede || "");
      setMeta("meta[property='og:url']",         location.origin + location.pathname + location.search);

      const tags = (meta.tags || "")
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map(function (t) { return t.trim().replace(/^["']|["']$/g, ""); })
        .filter(Boolean)
        .map(function (t) { return "#" + t; })
        .join("  ");

      let bodyHtml = parseMarkdown(body);

      // Move <aside class="sidenote"> outside any enclosing <p>, then wrap
      // the paragraph + aside pair in a .has-sidenote div (asides are block-level).
      bodyHtml = bodyHtml.replace(
        /<p>([\s\S]*?)(<aside class="sidenote">[\s\S]*?<\/aside>)([\s\S]*?)<\/p>/g,
        '<div class="has-sidenote"><p>$1$3</p>$2</div>'
      );

      // Auto-number figures
      let figIdx = 0;
      bodyHtml = bodyHtml.replace(/<span class="fig-num">Fig\.<\/span>/g, function () {
        figIdx += 1;
        const n = figIdx < 10 ? "0" + figIdx : String(figIdx);
        return `<span class="fig-num">Fig. ${n}</span>`;
      });

      container.innerHTML = `
        <header class="article-header">
          <h1>${meta.title || slug}</h1>
          ${meta.lede ? `<p class="lede">${meta.lede}</p>` : ""}
          <p class="meta">
            <span>${meta.date || ""}</span>
            <span>${readTime}</span>
            ${tags ? `<span class="meta-tags">${tags}</span>` : ""}
          </p>
        </header>
        <div class="article-body">
          ${bodyHtml}
        </div>
        <nav class="article-end-nav" aria-label="Article end navigation">
          <a href="/" class="article-end-link">Blog</a>
          <a href="/archive.html" class="article-end-link">All Posts</a>
          <a href="/about.html" class="article-end-link">About</a>
        </nav>
      `;

      // Syntax highlight all code blocks
      if (typeof hljs !== "undefined") {
        container.querySelectorAll("pre code").forEach(function (block) {
          hljs.highlightElement(block);
        });
        syncHljsTheme();
      }

      // Inject copy buttons into every <pre> block, and collapse long ones.
      const COLLAPSE_THRESHOLD = 360;
      container.querySelectorAll("pre").forEach(function (pre) {
        const code = pre.querySelector("code");
        const languageClass = code && code.className.match(/language-([\w-]+)/);
        if (languageClass && languageClass[1]) {
          pre.setAttribute("data-lang", languageClass[1]);
        }

        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.textContent = "Copy";
        btn.addEventListener("click", function () {
          navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(function () {
            btn.textContent = "Copied!";
            setTimeout(function () { btn.textContent = "Copy"; }, 2000);
          });
        });
        pre.appendChild(btn);

        if (pre.scrollHeight > COLLAPSE_THRESHOLD) {
          const lineCount = (code ? code.textContent : pre.textContent)
            .replace(/\n+$/, "")
            .split("\n").length;
          pre.classList.add("is-collapsed");
          const expandBtn = document.createElement("button");
          expandBtn.type = "button";
          expandBtn.className = "expand-btn";
          const collapsedLabel = "Expand · " + lineCount + " lines";
          expandBtn.textContent = collapsedLabel;
          expandBtn.addEventListener("click", function () {
            const nowCollapsed = pre.classList.toggle("is-collapsed");
            expandBtn.textContent = nowCollapsed ? collapsedLabel : "Collapse";
          });
          pre.appendChild(expandBtn);
        }
      });
    })
    .catch(function () {
      container.innerHTML = notFound();
    });
});

function notFound() {
  return `
    <p style="color:var(--muted);font-family:var(--sans);font-size:15px;">Article not found.</p>
  `;
}
