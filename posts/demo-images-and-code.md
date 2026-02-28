---
title: "Demo: images, code highlighting, and copy button"
lede: "A quick test post showing pictures with captions, syntax-highlighted code blocks, and the copy button that appears on hover."
date: "February 28, 2026"
dateShort: "Feb 28"
featured: true
tags: ["demo"]
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco. Read time is now calculated automatically from word count — no need to set it manually.

## A picture with a caption

![Mountain landscape at dusk](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80 "Unsplash — free to use, no upload needed.")

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

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

## An image without a caption

![Laptop on a wooden desk](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80)

Sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et tempus feugiat.
