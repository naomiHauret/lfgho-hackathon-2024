---
title: Setup
description: How to setup ghooey
---

**ghooey**, being built on top of Alpine, is dead-simple to setup:

1. Install Alpine via a CDN
2. Add `ghooey` like so if you installed Alpine through a CDN :

```html
<html>
  <script src="/path/to/public-folder/ghooey.js" defer></script>
  <script src="/path/to/alpine.js" defer></script>

  <body x-data></body>
</html>
```

You can start building widgets to help users borrow/lend on Aave or transfer tokens like GHO with Alpine directives and predefined methods.
