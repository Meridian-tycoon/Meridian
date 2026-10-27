# First 72 real hours: pacing check

Date: 2026-10-27. Build: `origin/main` (`index.html`). 1 real hour = 1 game day (`DAYMS`).

## How it was simulated
Headless Chromium (Playwright) on the real game, with Firebase off. It started a new game in Montréal ($0 cash) and moved the clock forward in 1-minute steps by calling `accrue()`. A bot played the whole 72 h:
- **Job:** it always held the best-paying job its experience allowed in Montréal (courier, then warehouse, then mine worker by hour 5).
- **Gigs:** 300 gig taps per waking hour (about 5 minutes of play), using the best gig tier unlocked. It slept 8 h out of every 24.
- **Businesses:** every hour it bought or upgraded whatever paid back fastest, in any city. Payback = price / (profit with staff − stock cost). It kept going until cash ran out.
- **Upkeep:** it hired staff for everything and kept 12 h of stock in each business (paying unit cost +10%).
- **Research:** it bought a technology once it had the RP and 3× the cash price.
- **Left out:** loans, stocks, industry, labs, logistics, crime, daily rewards.
- **Runs:** 3 full 72 h runs. Random events vary them; the ranges below are across the runs.

## Timeline
| Hour | Cash | Net worth | Income/hr | Businesses | Rank | Techs | What happened |
|---|---|---|---|---|---|---|---|
| 1 | $77 | $77 | $13 | 0 | Street hustler | 0 | Job (courier) + gigs only |
| 3 | $407 | $407 | $14 | 0 | Street hustler | 0 | Warehouse job |
| 6 | $0.3–1.1K | $1.1–1.5K | $20–230 | 0–2 | Street hustler | 0 | Mine worker job; first pretzel stand around 6–8 h |
| 12 | ~$0.5K | $3.8–7.9K | $0.5–1.1K | 4–9 | Side hustler | 0 | Goals g1–g3 pay out (+$21K) |
| 24 | $7K–343K | **$0.50–0.60M** | **$25–60K** | 97–221 | Entrepreneur | 1–2 | Goals g4–g8 pay out (+$675K), mostly carts in 20+ cities |
| 48 | $0.24–0.73M | $1.5–2.8M | $75–175K | 290–330 | Entrepreneur / Mogul | 3 | Payback has crept up to 20–23 h; kiosks, shops and a gas station start to appear |
| 72 | $0.5–1.8M | $3.7–6.0M | $175–260K | 330–370 | Mogul | 4 | Mechfarm, logi, oil, plastics; RP is the bottleneck |

## What the run shows
1. **Hours 0–7 stall.** You start with $0. The job pays $10–24 an hour, and gigs earn about $100–150 per waking hour. The cheapest business (a pretzel stand, $1,430 in Montréal) takes 6–8 real hours to afford. That is a long dead stretch at the very start.
2. **Hours 12–24 explode, mostly from goal rewards.** One-off goal cash adds up to about $676K before hour 24, the bulk of it from g6 *Five continents* $100K, g7 *Millionaire* $150K and g8 *Global brand* $500K. Business income up to that point is only about $5–60K. Net worth jumps about 70× in 12 hours. The $500K reward for owning things in 20 cities is especially easy: 20 pretzel stands in cheap cities cost about $25K.
3. **Carts win everything.** Payback in Montréal (with staff, minus stock cost):

   | Business | Price | Net profit/hr | Payback |
   |---|---|---|---|
   | pretzel | $1,430 | $124 | 11.5 h |
   | cart | $1,950 | $155 | 12.6 h |
   | taco | $3,120 | $212 | 14.7 h |
   | kiosk | $7,800 | $315 | 24.8 h |
   | shop | $23,400 | $812 | 28.8 h |
   | rest | $71,500 | $1,799 | 39.7 h |
   | apt | $182,000 | $5,685 | 32 h |
   | office | $780,000 | $21,400 | 36 h |
   | hotel | $2.34M | $48,090 | 48.7 h |

   The best-payback strategy is to copy the 7 cart types into all 63 cities: 300+ businesses by hour 48, almost all of them carts. Mid-tier businesses only become worth buying once every cart slot is full, around 35–70 h. Nothing bigger than a restaurant was bought in 72 h. In the middle game the choice is breadth (more carts), not deciding what to buy.
4. **Research crawls.** The base rate is `RPX*2` = 4 RP per real hour, so after 72 h you have only 4 tier-0/1 technologies, even with millions in cash. Cash stops limiting research by about hour 24; RP limits it from then on.
5. **The job stops mattering** after about 12 h ($24/hr against $100K+/hr). That is fine, but there is no reason to change jobs after the mine.

**Verdict:** the start is too slow (about 7 h with nothing to buy), hours 12–24 grow far too fast (goal cash), and hours 24–72 grow steadily but too fast for a "days-long" curve. Mogul ($2M) arrives by hour 48–72. Research is too slow compared with cash.

## Tuning suggestions
| # | Constant | Old → new | Effect |
|---|---|---|---|
| 1 | `GOALS` rewards `r`: g6 / g7 / g8 / g9 | 100000 / 150000 / 500000 / 1000000 → 25000 / 50000 / 60000 / 250000 | Goal cash by hour 24 drops from about $676K to about $176K. Net worth at 24 h comes out at about $150–200K instead of $500–600K, so goals feel like a bonus instead of the main engine. |
| 2 | Initial `S` (line 571) `cash:0` → `cash:1500`; or `GIGS[0].p` 0.25 → 0.5 | — | The first pretzel stand opens within minutes instead of at hour 6–8, and the first hour has a decision in it. |
| 3 | `upCost` cart growth `isCart?1.7:1.4` → keep 1.7; cart `gross` (cart/coffeecart/icecream/taco/pretzel/noodle/smoothie) −15% (e.g. cart 241 → 205, pretzel 177 → 150) | — | Cart payback goes from about 12 h to about 16 h, closer to the kiosk. That makes "spam carts in 63 cities" less dominant. |
| 4 | `BIZ` gross: kiosk 820 → 1000, shop 2200 → 2700, rest 6200 → 7600 | — | Kiosk payback goes from 25 to about 19 h, shop from 29 to about 22 h, restaurant from 40 to about 31 h. Mid-tier becomes a real choice around hour 15–30. |
| 5 | `RPX` 2 → 4 | — | Base research doubles to 8 RP/hr, giving about 7–8 techs by hour 72 instead of 4. Cash prices (`TECH.cash`) stay the gate early on. |
| 6 | (optional) a new per-type spread cost, e.g. `cost()` ×(1 + 0.04 × number of that type already owned) | — | Each extra copy costs a bit more, so the 300-cart sprawl tapers off. This is a small new mechanic, so only add it if 3 and 4 are not enough. |

Apply 1, 3 and 4 together and the 72 h net worth should land around $1–2M: Entrepreneur rising into early Mogul, instead of $4–6M.
