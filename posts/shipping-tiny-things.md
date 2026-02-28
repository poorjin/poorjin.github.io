---
title: "What I learned shipping tiny things"
lede: "Short, practical takeaways from tools, interviews, and side projects."
date: "February 14, 2026"
dateShort: "Feb 14"
featured: false
tags: ["dev", "lessons"]
---

The smallest project I ever shipped was a 40-line Python script that renamed files according to a pattern. I used it for two years before I replaced it. Here's what it taught me about shipping in general.

## Constraints are a gift

A 40-line budget forces decisions. You can't over-engineer. You have to pick the simplest thing that works. Most of my larger projects would have been better if I'd started with that constraint and only lifted it when I had a specific reason to.

## The version you're embarrassed by is the right first version

I kept the script private for a month because it had hardcoded paths and no error handling. When I finally shared it, two colleagues asked for copies. Neither of them noticed the hardcoded paths. One of them used it daily for six months.

## Maintenance is the real cost

Every line of code you write is a line you (or someone) will have to read again. The most important skill I've developed isn't writing code — it's deleting it.

```python
# Before: clever
result = [transform(x) for x in data if predicate(x)][:limit]

# After: clear
filtered = [x for x in data if predicate(x)]
transformed = [transform(x) for x in filtered]
result = transformed[:limit]
```

The second version is longer. It's also the one I can read at 11pm on a Friday.

![A quiet desk setup](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80 "The kind of environment where good defaults get written.")

