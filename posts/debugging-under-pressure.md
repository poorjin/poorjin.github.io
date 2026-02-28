---
title: "A checklist for debugging under pressure"
lede: "Reduce scope, measure, change one variable, write it down."
date: "January 30, 2026"
dateShort: "Jan 30"
featured: false
tags: ["dev", "debugging"]
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maecenas vel nunc at nisl varius tincidunt.

## Phasellus dignissim

Phasellus dignissim, **felis nec tincidunt** cursus, arcu libero laoreet est, vel dictum velit nisl nec tortor. Proin vel nisi vel lacus iaculis vestibulum.

### Step one

Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend libero at lobortis.

### Step two

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum.

```python
def debug(problem):
    scope = reduce(problem)
    baseline = measure(scope)
    fix = change_one_thing(scope)
    return verify(fix, baseline)
```

### Step three

Fusce fermentum. *Nullam varius nulla eu ante.* Integer metus purus, tincidunt sit amet, placerat vel, laoreet id, nunc. Phasellus ultrices nulla quis nibh.

> Donec porta diam eu massa. Quisque diam lorem, interdum vitae, dapibus ac, scelerisque vitae, pede.


Production is down. Your hands are slightly cold. The Slack thread is 40 messages long and nobody agrees on what's happening.

This is the worst time to think clearly, and also the only time you have.

## The checklist

### 1. Reduce scope

What changed last? Narrow to the smallest possible universe of cause before you do anything else. A deployment? A config change? Traffic spike? If you don't know, checking your deployment log takes 30 seconds and eliminates half the hypotheses.

### 2. Measure before you fix

Get a number. Error rate, latency, queue depth — anything concrete. Without a baseline you can't know if your fix worked. This step takes two minutes and saves twenty.

### 3. Change one variable

The pressure to "just try something" is intense. Resist it. If you roll back and restart and change a config simultaneously, you won't know which of the three things fixed it. Next time you won't know which three things to try.

### 4. Write it down as you go

A running log in a scratch doc. Timestamps, what you tried, what you observed. This feels like overhead. It is not. It is the thing that will save you when someone asks what happened at 2am six weeks from now.

> Calm is a skill. You can practice it before you need it.

The checklist isn't magic. It's a way of making your past self (the one who wrote it down calmly) help your future self (the one whose hands are cold).
