# Starter guide card on phone: stop covering the ticker and map controls

**Player goal.** On a phone (390x844) the first-run guide card (`#tutbox`, also `#tipbox`) sits at the top of the globe view (`top: safe-area + 64px`). It hides the news ticker (the first thing that tells a new player what to do) and the top of the map, and it can sit over the map/zoom controls when they show. The player should be able to read the step, see the ticker and still spin/zoom the globe.

**How it plays (phone width, max-width 819px, globe view, no sheet or phone open):**
1. The card docks to the bottom of the map, above the Daily reward pill and the hint line, instead of the top.
2. It is compact: 8px 12px padding, 12px body text, 13px title, buttons stay at least ~40px tall (tap target).
3. It never covers the bottom-right map controls: it keeps a right gutter that clears them.
4. Sheet/phone open keeps today's rule (card at bottom above the nav) — unchanged.
5. Desktop (>= 820px) is unchanged.

| Item | Value |
|---|---|
| Breakpoint | `@media (max-width:819px)` and `body:not(.sh-open):not(.ph-open)` |
| Position | `top:auto!important; bottom: calc(env(safe-area-inset-bottom,0px) + 150px)` (clears nav 53px + Daily pill 708–745 + hint) |
| Sides | `left: max(12px, safe-area-left); right: calc(max(12px, safe-area-right) + 44px)` so the bottom-right map control column (~40px) stays clear |
| Size | padding 8px 12px, font 12px, h4 13px, `.tb` margin-top 6px, `max-height: 30vh; overflow:auto` |
| If Daily reward pill is visible | raise by the pill height (it already sits at bottom:44px of #mapwrap) — the 150px offset covers it |

**Connects to.** `#tutbox/#tipbox` CSS (around the `#tutbox{top:...}` rule and the existing `body.sh-open #tutbox` phone rule), `#ticker`, `#daily`, `#gl .maplibregl-ctrl-bottom-right`. Themes: only position/size change, so Classic look is untouched and th-glass/ledger/command keep their skins.

**Old saves.** No save fields. CSS only.

**Out of scope.** Changing tutorial steps or text; desktop layout.

**Check.** 390x844 and 1280x800, all four themes: ticker fully visible, map controls tappable, card fully on screen, no console errors.
