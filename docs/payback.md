# Business payback times

Analysis only, written 2026-10-20 by meridian-balance. Nothing in `index.html` was changed. Model scripts: `payback.js` and `proposals.js`, kept in the balance scratch folder.

**Units:** 1 real hour = 1 game day, and `profit()` is paid once per real hour. So "20 days" means about 20 real hours of play (or idle time).

## How it was measured

- **Price** = `cost × 1.3 × PRICE[size]`. **Upgrade Lv→Lv+1** = `price × 0.8 × 1.6^(Lv−1)`. `MAXLV = 5`, so reaching Lv5 costs about 8.4× the purchase price in total.
- **Shown profit** = what the city sheet shows ("Making $X/hr"). It is `profit(b,c,lv)` with a baseline setup: staffed, standard laws (wage 1, tariff 0, no grant, police 1), no rivals, events, tech, satellites, manager, supply bonus or city bonus. The built-in size bonuses are included: hotel ×1.3 in size 4–5, apartments ×1.25 in size 1–2, airline/airport ×1.25 in size 5 and ×0.8 in size 1–2.
- **Real profit** = shown profit minus stock bought from the supplier (`SUP` rate × unit cost × `PRICE[size]` × level scaling). Only cart, kiosk, shop, restaurant and hotel use stock. The UI does **not** take this off the number it shows.
- **Payback** = price ÷ real profit per day. "Payback to Lv5" = total spend (purchase plus 4 upgrades) ÷ Lv5 real profit. "Step payback" = cost of one upgrade ÷ the extra profit it adds.
- Not included: weekly tax (20% of profit if registered, 10–30% by country law; about 40%+ if unregistered). Tax stretches every payback by about 1.25× when registered and about 1.7× when not. Also not included: the HQ ($35k × PRICE, $40 × PRICE/day upkeep, which is negligible) and the 7% registration fee.
- "Typical small city" = **size 2** (8 cities). Size 1 has 12 cities and pays back faster still (see the by-size table). Seaports need size 3+, so the size-2 table shows them as n/a. The casino is size 5 only.

## Full tables

### Small city (size 2)

| Business | Price | Shown profit/day (Lv1) | Stock cost/day | Real profit/day (Lv1) | Payback Lv1 (shown) | Payback Lv1 (real) | Total spend to Lv5 | Real profit/day (Lv5) | Payback to Lv5 | Each upgrade step pays back in (1→2 / 2→3 / 3→4 / 4→5) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Food cart | $1.6k | $133 | $52 | $81 | 11.8 | 19.3 | $13.1k | $313 | 41.9 | 21.5 / 34.3 / 54.9 / 87.9 |
| Coffee kiosk | $6.2k | $372 | $166 | $205 | 16.8 | 30.4 | $52.4k | $878 | 59.8 | 29.7 / 47.5 / 76.0 / 122 |
| Corner shop | $18.7k | $946 | $448 | $498 | 19.8 | 37.6 | $157.3k | $2.2k | 70.4 | 34.5 / 55.1 / 88.2 / 141 |
| Restaurant | $57.2k | $2.5k | $1.2k | $1.3k | 22.5 | 44.0 | $480.8k | $6.1k | 78.9 | 38.2 / 61.1 / 97.8 / 156 |
| Apartment block | $145.6k | $7.1k | $0 | $7.1k | 20.5 | 20.5 | $1.22M | $24.5k | 50.0 | 26.8 / 42.9 / 68.7 / 110 |
| Office tower | $624.0k | $18.6k | $0 | $18.6k | 33.5 | 33.5 | $5.24M | $67.0k | 78.2 | 41.3 / 66.0 / 106 / 169 |
| Hotel | $1.87M | $51.8k | $7.7k | $44.1k | 36.1 | 42.4 | $15.73M | $172.5k | 91.2 | 46.7 / 74.7 / 119 / 191 |
| Security firm | $93.6k | $3.0k | $0 | $3.0k | 31.7 | 31.7 | $786.7k | $11.8k | 66.4 | 33.7 / 53.9 / 86.2 / 138 |
| Ambulance service | $270.4k | $6.8k | $0 | $6.8k | 40.0 | 40.0 | $2.27M | $27.5k | 82.6 | 41.7 / 66.7 / 107 / 171 |
| Law firm | $436.8k | $10.8k | $0 | $10.8k | 40.6 | 40.6 | $3.67M | $43.2k | 85.0 | 43.1 / 69.0 / 110 / 177 |
| Private prison | $2.70M | $64.1k | $0 | $64.1k | 42.2 | 42.2 | $22.73M | $256.6k | 88.6 | 45.0 / 71.9 / 115 / 184 |
| Taxi company | $46.8k | $1.7k | $0 | $1.7k | 28.3 | 28.3 | $393.3k | $6.7k | 58.9 | 29.8 / 47.7 / 76.4 / 122 |
| Bus line | $166.4k | $4.4k | $0 | $4.4k | 37.4 | 37.4 | $1.40M | $18.1k | 77.3 | 39.0 / 62.4 / 99.9 / 160 |
| Trucking company | $312.0k | $8.2k | $0 | $8.2k | 38.1 | 38.1 | $2.62M | $33.2k | 79.1 | 40.0 / 63.9 / 102 / 164 |
| Railway | $4.37M | $96.1k | $0 | $96.1k | 45.5 | 45.5 | $36.71M | $388.3k | 94.5 | 47.8 / 76.5 / 122 / 196 |
| Seaport | not allowed in this city size |||||||||| 
| Airline | $8.32M | $101.3k | $0 | $101.3k | 82.1 | 82.1 | $69.93M | $471.5k | 148 | 71.9 / 115 / 184 / 295 |
| International airport | $15.60M | $190.9k | $0 | $190.9k | 81.7 | 81.7 | $131.11M | $859.2k | 153 | 74.7 / 120 / 191 / 306 |
| Casino | not allowed in this city size |||||||||| 

### Big city (size 5)

| Business | Price | Shown profit/day (Lv1) | Stock cost/day | Real profit/day (Lv1) | Payback Lv1 (shown) | Payback Lv1 (real) | Total spend to Lv5 | Real profit/day (Lv5) | Payback to Lv5 | Each upgrade step pays back in (1→2 / 2→3 / 3→4 / 4→5) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Food cart | $3.5k | $229 | $117 | $112 | 15.3 | 31.2 | $29.5k | $484 | 61.0 | 30.2 / 48.4 / 77.4 / 124 |
| Coffee kiosk | $14.0k | $618 | $374 | $244 | 22.7 | 57.5 | $118.0k | $1.3k | 92.4 | 43.5 / 69.5 / 111 / 178 |
| Corner shop | $42.1k | $1.5k | $1.0k | $535 | 27.3 | 78.7 | $354.0k | $3.2k | 112 | 51.3 / 82.1 / 131 / 210 |
| Restaurant | $128.7k | $4.1k | $2.8k | $1.3k | 31.5 | 101 | $1.08M | $8.4k | 128 | 57.5 / 92.1 / 147 / 236 |
| Apartment block | $327.6k | $9.4k | $0 | $9.4k | 34.9 | 34.9 | $2.75M | $34.0k | 81.0 | 42.6 / 68.2 / 109 / 175 |
| Office tower | $1.40M | $32.4k | $0 | $32.4k | 43.3 | 43.3 | $11.80M | $120.2k | 98.1 | 51.1 / 81.8 / 131 / 210 |
| Hotel | $4.21M | $132.9k | $17.3k | $115.7k | 31.7 | 36.4 | $35.40M | $440.5k | 80.4 | 41.5 / 66.4 / 106 / 170 |
| Security firm | $210.6k | $4.7k | $0 | $4.7k | 45.0 | 45.0 | $1.77M | $20.4k | 86.9 | 43.0 / 68.8 / 110 / 176 |
| Ambulance service | $608.4k | $10.6k | $0 | $10.6k | 57.7 | 57.7 | $5.11M | $47.0k | 109 | 53.4 / 85.4 / 137 / 219 |
| Law firm | $982.8k | $17.1k | $0 | $17.1k | 57.6 | 57.6 | $8.26M | $74.2k | 111 | 55.0 / 88.0 / 141 / 225 |
| Private prison | $6.08M | $101.7k | $0 | $101.7k | 59.8 | 59.8 | $51.13M | $441.3k | 116 | 57.3 / 91.7 / 147 / 235 |
| Taxi company | $105.3k | $2.6k | $0 | $2.6k | 40.4 | 40.4 | $885.0k | $11.4k | 77.3 | 38.1 / 61.0 / 97.6 / 156 |
| Bus line | $374.4k | $6.9k | $0 | $6.9k | 53.9 | 53.9 | $3.15M | $30.9k | 102 | 50.0 / 80.0 / 128 / 205 |
| Trucking company | $702.0k | $12.8k | $0 | $12.8k | 54.7 | 54.7 | $5.90M | $56.8k | 104 | 51.1 / 81.8 / 131 / 209 |
| Railway | $9.83M | $151.0k | $0 | $151.0k | 65.1 | 65.1 | $82.60M | $665.5k | 124 | 61.1 / 97.8 / 156 / 250 |
| Seaport | $14.04M | $214.0k | $0 | $214.0k | 65.6 | 65.6 | $118.00M | $933.2k | 126 | 62.5 / 100.0 / 160 / 256 |
| Airline | $18.72M | $399.8k | $0 | $399.8k | 46.8 | 46.8 | $157.34M | $1.61M | 97.7 | 49.5 / 79.2 / 127 / 203 |
| International airport | $35.10M | $733.1k | $0 | $733.1k | 47.9 | 47.9 | $295.01M | $2.90M | 102 | 51.7 / 82.8 / 132 / 212 |
| Casino | $14.04M | $268.4k | $0 | $268.4k | 52.3 | 52.3 | $118.00M | $1.11M | 107 | 53.6 / 85.7 / 137 / 219 |

### Lv1 real payback (game days) by city size

| Business | Size 1 | Size 2 | Size 3 | Size 4 | Size 5 |
|---|---:|---:|---:|---:|---:|
| Food cart | 15.7 | 19.3 | 22.4 | 27.6 | 31.2 |
| Coffee kiosk | 23.7 | 30.4 | 36.6 | 48.3 | 57.5 |
| Corner shop | 28.7 | 37.6 | 46.3 | 63.9 | 78.7 |
| Restaurant | 32.9 | 44.0 | 55.2 | 79.0 | 101 |
| Apartment block | 18.3 | 20.5 | 29.6 | 32.9 | 34.9 |
| Office tower | 29.4 | 33.5 | 36.4 | 40.8 | 43.3 |
| Hotel | 35.8 | 42.4 | 47.7 | 33.9 | 36.4 |
| Security firm | 26.9 | 31.7 | 35.5 | 41.3 | 45.0 |
| Ambulance service | 33.8 | 40.0 | 45.0 | 52.7 | 57.7 |
| Law firm | 34.4 | 40.6 | 45.4 | 52.9 | 57.6 |
| Private prison | 35.9 | 42.2 | 47.2 | 54.9 | 59.8 |
| Taxi company | 24.0 | 28.3 | 31.7 | 37.0 | 40.4 |
| Bus line | 31.6 | 37.4 | 42.1 | 49.3 | 53.9 |
| Trucking company | 32.3 | 38.1 | 42.8 | 50.1 | 54.7 |
| Railway | 38.5 | 45.5 | 51.0 | 59.6 | 65.1 |
| Seaport | — | — | 51.7 | 60.2 | 65.6 |
| Airline | 66.2 | 82.1 | 57.3 | 67.3 | 46.8 |
| International airport | 66.7 | 81.7 | 58.1 | 67.8 | 47.9 |
| Casino | — | — | — | — | 52.3 |

## How it sits overall

Most businesses pay back in **20–45 game days** at Lv1, which is about a day or two of real time. Almost nothing breaks the curve: no big asset pays back in under ~30 days, and everything eventually pays back at its base setup. The outliers below are about *relative* value: which choice is clearly better or clearly worse than its neighbours.

### Casino (just re-priced)

Price $14.04M in a size-5 city, real profit $268k/day, so it **pays back in 52 game days (about 2.2 real days)**. That matches the builder's note. It sits in the middle of the $10M+ band in big cities: airline 47, airport 48, casino 52, prison 60, railway 65, seaport 66. **No change needed.** Caveats: the profit margin is thin (upkeep takes 48% of takings), so a high-wage law (×0.9) pushes payback to about 65 days and a strike (×0.7) to about 125. A National Front or Workers' Party government can ban it outright, which drops income to $0. Renting a casino loses money (see outlier 4).

## Outliers

### 1. Restaurants and shops in big cities: the shown profit is far off, and they're the worst buy in their band (HIGH)

Stock is priced by `PRICE[size]`, which rises faster than `DEMAND[size]`. In a size-5 city, stock eats most of what the sheet says you make:

| Size-5 city, Lv1 | Price | Shown profit/day | Stock/day | Real profit/day | Payback shown → real |
|---|---:|---:|---:|---:|---:|
| Coffee kiosk | $14.0k | $618 | $374 | $244 | 23 → **58 days** |
| Corner shop | $42.1k | $1.5k | $1.0k | $535 | 27 → **79 days** |
| Restaurant | $128.7k | $4.1k | $2.8k | $1.3k | 32 → **101 days** |

A size-5 restaurant makes the same real profit ($1.3k/day) as a size-2 one that costs 2.25× less. It also makes less than a $105k taxi company ($2.6k/day, 40 days) in the same city. Small-city restaurants are fine at 33–44 days.

### 2. Apartment blocks in small cities beat everything above them (MED)

A $146k apartment block in a size-2 city pays back in **20.5 days** (18.3 in size 1). It needs no staff and no stock, and the ×1.25 small-city bonus applies. That beats every business that costs more than it: office 34, hotel 42, prison 42, railway 46, casino 52 in its best city. Only the $1.6k food cart is faster. A mid-game player's best move is to buy an apartment block in every size-1/2 city before touching anything bigger.

### 3. Upgrades get steadily worse; Lv4→5 is never worth it (MED)

Each level adds a fixed amount of profit (+55% of takings, +30% of upkeep), but its cost grows 1.6× per level. So step paybacks run about **1× → 1.6× → 2.6× → 4.1×** the Lv1 payback. A cart's Lv4→5 step takes 88 days to repay, an airport's 306. Buying a new Lv1 business in another city is always better, so upgrading only makes sense once you've run out of slots. That's acceptable for a late-game cash sink, but Lv5 is currently a trap for anyone still expanding.

### 4. Renting big assets loses money every hour (MED)

Rent is `price/40` per hour, so any lease with a payback above 40 days runs at a loss. In a size-5 city that covers most things: casino **−$83k/day**, railway −$95k, seaport −$137k, airport −$144k, prison −$50k, office −$2.7k, restaurant −$1.9k. Only the hotel (+$10k), apartments (+$1.2k) and food cart (+$25) make anything. The rent button is offered without any warning, and these leases still cost 20% of the price upfront. Rent is also flat by level, so an upgraded lease does improve over time. A leased Lv1 casino never does.

### 5. Airline and airport in small cities pay back about twice as slowly as peers (LOW, probably intended)

The ×0.8 small-city factor gives **82 days** in a size-2 city, against 42–46 for prison, hotel and railway. In size 5 the same assets pay back in 47–48 days, which is fine. This looks intentional; at most it needs a hint in the UI.

### 6. Bigger cities pay back more slowly for nearly everything (LOW, by design?)

The ratio `DEMAND/PRICE` drops from 1.17 (size 1) to 0.89 (size 5). So unless a business has a size bonus (hotel, airline, airport), the same business pays back faster in a small city. Example: a food cart takes 15.7 days in size 1 and 31.2 in size 5. Big cities currently win only on absolute profit per slot, not on return. No change proposed. Just be aware that "big city" businesses need their own bonus to be worth it.

### 7. Hotels are the best big asset in big cities (LOW)

A size-5 hotel costs $4.2M and pays back in **36 days** with no HQ needed. That beats office (43) and every company-only asset (47–66). A modest lead, and it fits the hotel description "Best in size-5 cities". No change proposed.

### Loans (quick check, not a loop)

Business loan rates are 0.064–0.48% per game day, against a 2–5% per day return on businesses. Borrowing to expand always pays, but the loan limit (50% of business value) stops it becoming an infinite loop. No change.

## Proposed constant tweaks (not applied)

| # | Constant | Before | After | Effect |
|---|---|---|---|---|
| 1 | `SUP.kiosk.c` / `SUP.shop.c` / `SUP.rest.c` | 1.3 / 2.8 / 13 | 1.0 / 2.0 / 8 | Size-5 payback: kiosk 58→43, shop 79→51, restaurant 101→55 days. Size-2 payback: kiosk 30→26, shop 38→30, restaurant 44→32 days. The food cart is unchanged. Retail no longer falls behind the taxi company. |
| 2 | Apartment block `up` | 1900 | 2300, with small-city apt bonus 1.25→1.1 in `bonus()` | Size-2 payback 20.5→25.7 days, size-1 18.3→22.6, size-5 34.9→38.2. Still a strong mid-game buy, but no longer beats the cart-to-office ladder by a mile. |
| 3 | Upgrade growth in `upCost` | `Math.pow(1.6,lv-1)` | `Math.pow(1.4,lv-1)` | Step paybacks for a size-2 apartment go from 27/43/69/110 to 27/38/53/74 days. Payback to Lv5: cart 42→33, hotel 91→73, casino 107→85. Lv5 becomes a real choice rather than a trap. Existing saves are unaffected (levels already bought stay bought). |
| 4 | `RENT` | 1/40 | 1/60 | Leases of most big assets earn money: size-5 casino −$83k→+$34k/day, airport −$144k→+$148k/day. Size-5 railway (−$13k), seaport (−$20k), shop and restaurant, plus small-city airline/airport, still lose money. Buying still pays for itself within 60 days of rent. Alternative if leases are meant to be a trap: keep 1/40 and show "loses $X/hr" on the rent button. |

Tweaks 1–3 are independent. Do tweak 4 only if leasing is meant to be a real way into the late game.
