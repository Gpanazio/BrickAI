# About Hero Symmetry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 2-column DNA_ORIGINS hero with a single-column layout (compact header → pull quote → description → modules grid) consistent with Works and Transmissions pages.

**Architecture:** Pure JSX refactor in `index.tsx`. No new files. The `SignalLoadingBar` component becomes dead code and is deleted. Modules move from a custom vertical list to the existing `InfoCard` component in a 3-column grid.

**Tech Stack:** React, Tailwind CSS, i18next (t())

---

### Task 1: Replace the hero section JSX

**Files:**
- Modify: `index.tsx:3183-3261`

**Step 1: Replace the section**

Find and replace the entire `{/* HERO: ORIGIN STORY */}` section (lines 3183–3261) with:

```tsx
{/* HERO: ORIGIN STORY */}
<section className="w-full px-6 md:px-12 lg:px-24 mb-24 reveal">
    {/* Compact header — same pattern as Works/Transmissions */}
    <div className="mb-16">
        <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">
            {t('about.origin').split('_').slice(0, -1).join('_')}
            <span className="text-brick-red">_{t('about.origin').split('_').slice(-1)[0]}</span>
        </h1>
        <p className="font-mono text-[10px] md:text-xs tracking-widest animate-system-input">
            <span className="text-brick-red">&gt;&gt; </span>
            <span className="text-brick-gray">{t('about.est')}</span>
        </p>
    </div>

    {/* Pull quote — full-width editorial statement */}
    <div className="w-full text-center py-16 md:py-24 border-t border-b border-white/10 mb-16">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-brick text-white leading-[0.9] tracking-tight">
            {t('about.title_primary')}<br />
            {t('about.title_highlight')}<br />
            <span className="text-brick-red">{t('about.title_secondary')}</span>
        </h2>
    </div>

    {/* Description */}
    <p className="text-brick-white font-inter font-light text-base md:text-lg leading-relaxed max-w-2xl mb-16 animate-fade-in-up">
        {t('about.description')}
    </p>

    {/* Modules grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {(['cinematography', 'training', 'architecture'] as const).map((key, i) => (
            <InfoCard
                key={key}
                number={String(i + 1).padStart(2, '0')}
                title={t(`about.modules.${key}.title`)}
                desc={t(`about.modules.${key}.desc`)}
            />
        ))}
    </div>
</section>
```

**Step 2: Verify in browser**

Navigate to `/about`. Check:
- Compact header left-aligned ✓
- `NASCIDOS NO SET.` centered, full-width, between two horizontal rules ✓
- Description paragraph below ✓
- 3 InfoCards in a row matching the manifesto section below ✓
- No satellite relay panel ✓

---

### Task 2: Remove dead code — `SignalLoadingBar`

**Files:**
- Modify: `index.tsx:3073-3110`

**Step 1: Delete the component**

`SignalLoadingBar` (lines 3073–3110) is now unused. Delete it entirely.

**Step 2: Verify no other usages**

Run: `grep -n "SignalLoadingBar" index.tsx`
Expected: no output (0 matches)

---

### Task 3: Commit

```bash
git add index.tsx docs/plans/2026-03-15-about-hero-symmetry.md docs/plans/2026-03-15-about-hero-symmetry-plan.md
git commit -m "refactor(about): replace 2-col hero with single-column pull quote layout"
```
