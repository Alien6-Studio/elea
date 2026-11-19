# Elea on Next.js

The App Router split Elea is built for: the viewer renders in a server component on `/`, the
editor sits behind `"use client"` on `/edit`. `npm run dev -w examples/next` starts it on
port 3100; CI builds it to keep both boundaries working.
