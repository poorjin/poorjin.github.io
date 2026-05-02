---
title: "Demo: images, code highlighting, and copy button"
lede: "A quick test post showing pictures with captions, syntax-highlighted code blocks, and the copy button that appears on hover."
date: "February 28, 2026"
dateShort: "Feb 28"
updated: "May 2, 2026"
updatedShort: "May 2"
featured: true
tags: ["demo"]
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.[^1] Ut enim ad minim veniam, quis nostrud exercitation ullamco. Read time is now calculated automatically from word count — no need to set it manually.

[^1]: Sidenotes use pandoc-style `[^n]` syntax. On wide screens they float into the right gutter; on narrow screens they collapse to italic notes inline.

## A picture with a caption

![Mountain landscape at dusk](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80 "Unsplash — free to use, no upload needed.")

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.[^2] Excepteur sint occaecat cupidatat non proident.

[^2]: Each note is opt-in — if a post doesn't use the syntax, no sidenotes appear and the page renders exactly as before.

## Code blocks with syntax highlighting

Hover over any block to see the **Copy** button appear in the top-right corner.

Here is some **Python**:

```python
def greet(name: str) -> str:
    if not name:
        raise ValueError("name cannot be empty")
    return f"Hello, {name}!"

print(greet("Jin"))  # Hello, Jin!
```

And some **JavaScript**:

```javascript
async function fetchPosts() {
  const res = await fetch("/posts/index.json");
  const posts = await res.json();
  return posts.filter(p => p.featured);
}
```

And a snippet of **SQL** for good measure:

```sql
SELECT slug, title, date
FROM posts
WHERE featured = true
ORDER BY date DESC
LIMIT 5;
```

A longer one — anything past ~14 lines folds away behind an **Expand** button:

```sql
-- Top 5 most-read posts in the last 90 days,
-- joined with each post's tags and average scroll depth.
WITH recent_views AS (
  SELECT
    post_slug,
    COUNT(*)                   AS views,
    COUNT(DISTINCT visitor_id) AS uniques,
    AVG(scroll_depth)          AS avg_scroll
  FROM page_views
  WHERE viewed_at >= NOW() - INTERVAL '90 days'
    AND post_slug IS NOT NULL
  GROUP BY post_slug
),
post_meta AS (
  SELECT
    p.slug,
    p.title,
    p.published_at,
    p.read_minutes,
    STRING_AGG(t.name, ', ' ORDER BY t.name) AS tags
  FROM posts p
  LEFT JOIN post_tags_link l ON l.post_id = p.id
  LEFT JOIN tags t           ON t.id      = l.tag_id
  WHERE p.published_at IS NOT NULL
  GROUP BY p.slug, p.title, p.published_at, p.read_minutes
)
SELECT
  pm.title,
  pm.published_at::DATE   AS published,
  pm.read_minutes         AS minutes,
  pm.tags,
  rv.views,
  rv.uniques,
  ROUND(rv.avg_scroll, 2) AS avg_scroll
FROM post_meta pm
JOIN recent_views rv ON rv.post_slug = pm.slug
ORDER BY rv.views DESC
LIMIT 5;
```

## An image without a caption

![Laptop on a wooden desk](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80)

Sunt in culpa qui officia deserunt mollit anim id est laborum.[^3] Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et tempus feugiat.

[^3]: Returning to old code is a kind of archaeology — *cf.* Bachelard on the archaeology of one's own past selves.
