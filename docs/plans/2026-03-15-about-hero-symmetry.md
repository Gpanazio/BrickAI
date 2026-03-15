# About Page Hero — Symmetry Fix

**Date:** 2026-03-15
**Status:** Approved

## Problem

The DNA_ORIGINS hero section uses a 2-column grid where the left column (narrative text) and right column (MAP_COORDINATES panel) speak different visual languages. The `lg:mt-24` offset on the right panel breaks the desired symmetry, making the section feel divergent from the rest of the site (Works, Transmissions).

## Design Decision

Adopt the single-column pattern used by Works and Transmissions pages. The section becomes a vertical flow:

1. **Compact header** — left-aligned, same structure as other pages: `h1 DNA_ORIGINS` + `font-mono` system-input subtitle
2. **Pull quote** — `NASCIDOS NO SET.` as a full-width editorial centerpiece between header and modules. Centered, large typography, isolated as a statement. Inspired by the footer's cinematic centered text pattern
3. **Description paragraph** — the origin story text, left-aligned, `max-w-2xl`
4. **3-column modules grid** — Cinematografia, Treinamento, Arquitetura using the existing `InfoCard` component

## What Gets Removed

- 2-column grid layout
- `MAP_COORDINATES` panel (`bg-[#0A0A0A]`, border, accent bar)
- Satellite relay animation (`Globe2`, `motion.div` rotate)
- `SignalLoadingBar` component usage in this section
- `lg:mt-24` offset
- `border-l-2 border-brick-red` on description paragraph

## Result

Consistent visual rhythm with Works and Transmissions. "NASCIDOS NO SET." preserved as a cinematic statement via pull quote pattern.
