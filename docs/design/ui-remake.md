# UI remake: three looks, same game

Owner request (Mark): "remake the UI of the game keeping the same rules, show examples before publish."
Scope: only the look changes. No rules, numbers, features or game code change. Each direction is one CSS override file, loaded after the game's own `<style>`, plus at most one Google Fonts link.

## What the UI is today
- **Layout:** header strip (brand, rank, Cash, Per hour, Net worth, Needs bars), full-bleed globe/map, bottom nav (Map, Empire, Research, Saves). The city/empire sheet slides up on phones and becomes a draggable 420px window at 820px and wider. There is a floating Stats widget, a ticker, a Daily reward pill and a draggable in-game phone with an app grid (Health, Eats, Work, Market, Bank, Freight, Cartel, Gigs…).
- **Tokens:** everything reads CSS variables on `:root` (`--sea --land --ink --muted --accent --own --panel --line --good --bad --ownbg --display --body --mono`), with a light "chart-table" palette and a dark teal palette picked by `prefers-color-scheme` or `data-theme`.
- **Type:** Bricolage Grotesque (display), Figtree (body), IBM Plex Mono (numbers).
- **Style:** rounded pills, a dark-on-light "ink" button with a fake 3D bottom edge, an orange accent, teal for owned things.

## Pain points
1. **No single identity.** Mono ticker, grotesque headline, emoji labels (💰 ⏱ 📈), orange accent, teal "own" colour and a bright phone gradient all come from different moods.
2. **Panels blend into the map** in dark mode: `--panel` is close to the globe colour, so the sheet and Stats widget read as dark holes rather than windows.
3. **Buttons and tabs are low-contrast.** Grey pill tabs with grey text, and the outline "up" buttons almost vanish at 390px.
4. **The phone looks like a separate app.** Its own colours (`#111418`, teal/purple gradient) are hard-coded and ignore the theme.
5. **Crowding at 390px:** header numbers, ticker and Stats chip compete for the top 200px of the map.

## Three directions (CSS + one font family each)

| | A · Glass | B · Ledger | C · Command |
|---|---|---|---|
| Mood | calm, modern, premium | warm, old-money finance paper | loud, arcade war-room |
| Palette | navy `#0b1020`, frosted panels `rgba(20,26,46,.72)`, violet `#8b7cff` → blue gradient, teal `#34d6c4` owned | cream `#fbf5e6` paper, ink `#1f1a14`, oxblood `#9b2c1f` accent, bottle green `#1f5c4a` cash | black, cyan `#00f0ff` lines/glow, magenta `#ff2bd6` accent, green `#39ff88` numbers |
| Type | Manrope + JetBrains Mono | Playfair Display headlines, Source Serif 4 body, IBM Plex Mono figures | Chakra Petch (caps, tracked) + JetBrains Mono |
| Panels | blurred glass, 20px radius, soft shadow, 1px white hairline | square paper cards, 1px ink rule, hard offset shadow, double rule under header | cut-corner HUD frames (`clip-path`), cyan border + glow |
| Buttons | gradient pill, white text; secondary = glass outline | square ink stamp; secondary = ink outline | angled cyan block, uppercase; secondary = cyan outline |
| Tab bar | glass chips, active = violet gradient | newspaper section tabs, active = oxblood underline | outlined segments, active = magenta fill + glow |
| Phone | dark glass handset, violet/teal aurora wallpaper, glossy icons | leather pocket-ledger, dark green screen, muted square icons | HUD terminal with scanlines, outlined icons in cyan glow |
| Light/dark | dark always | light always (phone stays dark for readability) | dark always |

Practical notes for all three:
- Overrides use `:root:root:root` so they beat both the light and dark palettes; components use `!important` only where the game sets inline-like specific rules.
- The globe canvas, MapLibre styles and game colours for cities/routes are untouched.
- Text contrast checked on the shots: body text on panel ≥ 4.5:1 in each theme.
- 390px: no layout changes, only colour, type, radius and shadow, so nothing new can overflow.

## Examples
Override files: `docs/design/ui-remake/theme-A.css`, `theme-B.css`, `theme-C.css`.
Screenshots (desktop 1280x800 with the Empire sheet, phone 390x844 with the phone open): `/mnt/project-files/meridian/ui-remake/` — `current-*`, `A-*`, `B-*`, `C-*`.

## After Mark picks one
- [meridian-builder] Paste the chosen file's rules into `index.html` after the "fun UI layer" block and swap the Google Fonts link.
- [meridian-builder] Replace hard-coded phone colours (`#111418`, `.ph-screen` gradient) with new `--ph-*` variables so the phone follows the theme.
- [meridian-builder] Optional: offer the other two as a Settings → Look switch (`data-skin` on `<html>`), saved in `S.skin`, defaulted for old saves.

Out of scope: rules, balance, new features, map/globe art.
