# Business payback times

Analysis only, written 2026-10-20 by meridian-balance; tables regenerated 2026-10-21 from the current `BIZ`, `SUP` and formulas in `index.html` (after the street-cart gross ×1.6, SUP #1, apartment #2, `upCost` 1.4 and upkeep +15%/level changes, and street-cart restock cost and wages −30% on 2026-10-21). Model scripts: `payback.js` (now `payback2.js`, which reads `BIZ` and `SUP` straight from `index.html`) and `proposals.js`, kept in the balance scratch folder.

**Units:** 1 real hour = 1 game day, and `profit()` is paid once per real hour. So "20 days" means about 20 real hours of play (or idle time).

## How it was measured

- **Price** = `cost × 1.3 × PRICE[size]`. **Upgrade Lv→Lv+1** = `price × 0.8 × 1.4^(Lv−1)`. `MAXLV = 5`, so reaching Lv5 costs about 6.7× the purchase price in total. Each level adds +55% of takings and +15% of upkeep.
- **Shown profit** = what the city sheet shows ("Making $X/hr"). It is `profit(b,c,lv)` with a baseline setup: staffed, standard laws (wage 1, tariff 0, no grant, police 1), no rivals, events, tech, satellites, manager, supply bonus or city bonus. The built-in size bonuses are included: hotel ×1.3 in size 4–5, apartments ×1.1 in size 1–2, airline/airport ×1.25 in size 5 and ×0.8 in size 1–2.
- **Real profit** = shown profit minus stock bought from the supplier (`SUP` rate × unit cost × `PRICE[size]` × level scaling). Only the street carts (food, coffee, ice cream, taco, pretzel, noodle, smoothie), kiosk, shop, restaurant and hotel use stock. Default menus are assumed. The UI does **not** take this off the number it shows.
- **Payback** = price ÷ real profit per day. "Payback to Lv5" = total spend (purchase plus 4 upgrades) ÷ Lv5 real profit. "Step payback" = cost of one upgrade ÷ the extra profit it adds.
- Not included: weekly tax (20% of profit if registered, 10–30% by country law; about 40%+ if unregistered). Tax stretches every payback by about 1.25× when registered and about 1.7× when not. Also not included: the HQ ($35k × PRICE, $40 × PRICE/day upkeep, which is negligible) and the 7% registration fee.
- "Typical small city" = **size 2** (8 cities). Size 1 has 12 cities and pays back faster still (see the by-size table). Seaports need size 3+, so the size-2 table shows them as n/a. The casino is size 5 only.

## Full tables

### Small city (size 2)

| Business | Price | Shown profit/day (Lv1) | Stock cost/day | Real profit/day (Lv1) | Payback Lv1 (shown) | Payback Lv1 (real) | Total spend to Lv5 | Real profit/day (Lv5) | Payback to Lv5 | Each upgrade step pays back in (1→2 / 2→3 / 3→4 / 4→5) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Food cart | $1.6k | $261 | $36 | $225 | 6.0 | 6.9 | $10.4k | $781 | 13.3 | 9.0 / 12.6 / 17.6 / 24.6 |
| Coffee cart | $1.8k | $291 | $37 | $254 | 6.1 | 7.0 | $11.8k | $885 | 13.4 | 9.0 / 12.6 / 17.6 / 24.6 |
| Ice cream cart | $1.5k | $242 | $31 | $211 | 6.0 | 6.9 | $9.7k | $734 | 13.3 | 8.9 / 12.5 / 17.5 / 24.5 |
| Taco truck | $2.5k | $394 | $63 | $332 | 6.3 | 7.5 | $16.7k | $1.2k | 14.3 | 9.5 / 13.3 / 18.7 / 26.1 |
| Pretzel stand | $1.1k | $195 | $23 | $172 | 5.9 | 6.7 | $7.6k | $591 | 12.9 | 8.7 / 12.2 / 17.1 / 23.9 |
| Noodle cart | $2.1k | $339 | $44 | $296 | 6.1 | 7.0 | $13.9k | $1.0k | 13.5 | 9.0 / 12.6 / 17.7 / 24.8 |
| Smoothie stand | $1.7k | $268 | $34 | $235 | 6.2 | 7.1 | $11.1k | $819 | 13.6 | 9.1 / 12.8 / 17.9 / 25.0 |
| Coffee kiosk | $6.2k | $372 | $128 | $244 | 16.8 | 25.6 | $41.7k | $1.1k | 36.8 | 22.5 / 31.4 / 44.0 / 61.6 |
| Corner shop | $18.7k | $946 | $320 | $626 | 19.8 | 29.9 | $125.1k | $3.0k | 41.3 | 24.9 / 34.8 / 48.8 / 68.3 |
| Restaurant | $57.2k | $2.5k | $768 | $1.8k | 22.5 | 32.1 | $382.3k | $8.8k | 43.5 | 26.1 / 36.6 / 51.2 / 71.7 |
| Apartment block | $145.6k | $5.7k | $0 | $5.7k | 25.7 | 25.7 | $973.1k | $21.5k | 45.2 | 29.4 / 41.1 / 57.6 / 80.6 |
| Office tower | $624.0k | $18.6k | $0 | $18.6k | 33.5 | 33.5 | $4.17M | $71.5k | 58.4 | 37.8 / 52.9 / 74.1 / 104 |
| Hotel | $1.87M | $51.8k | $7.7k | $44.1k | 36.1 | 42.4 | $12.51M | $191.3k | 65.4 | 40.7 / 57.0 / 79.8 / 112 |
| Security firm | $93.6k | $3.0k | $0 | $3.0k | 31.7 | 31.7 | $625.5k | $13.3k | 47.1 | 29.0 / 40.6 / 56.8 / 79.6 |
| Ambulance service | $270.4k | $6.8k | $0 | $6.8k | 40.0 | 40.0 | $1.81M | $31.0k | 58.2 | 35.6 / 49.9 / 69.8 / 97.8 |
| Law firm | $436.8k | $10.8k | $0 | $10.8k | 40.6 | 40.6 | $2.92M | $48.4k | 60.3 | 37.1 / 51.9 / 72.7 / 102 |
| Private prison | $2.70M | $64.1k | $0 | $64.1k | 42.2 | 42.2 | $18.07M | $287.5k | 62.9 | 38.7 / 54.2 / 75.9 / 106 |
| Taxi company | $46.8k | $1.7k | $0 | $1.7k | 28.3 | 28.3 | $312.8k | $7.5k | 41.7 | 25.6 / 35.9 / 50.2 / 70.3 |
| Bus line | $166.4k | $4.4k | $0 | $4.4k | 37.4 | 37.4 | $1.11M | $20.4k | 54.5 | 33.4 / 46.7 / 65.4 / 91.5 |
| Trucking company | $312.0k | $8.2k | $0 | $8.2k | 38.1 | 38.1 | $2.09M | $37.4k | 55.8 | 34.2 / 47.9 / 67.1 / 93.9 |
| Railway | $4.37M | $96.1k | $0 | $96.1k | 45.5 | 45.5 | $29.19M | $436.9k | 66.8 | 41.0 / 57.4 / 80.4 / 113 |
| Seaport | not allowed in this city size |||||||||| 
| Airline | $8.32M | $101.3k | $0 | $101.3k | 82.1 | 82.1 | $55.60M | $559.8k | 99.3 | 58.1 / 81.3 / 114 / 159 |
| International airport | $15.60M | $190.9k | $0 | $190.9k | 81.7 | 81.7 | $104.26M | $1.01M | 103 | 61.1 / 85.5 / 120 / 168 |
| Casino | not allowed in this city size |||||||||| 

### Big city (size 5)

| Business | Price | Shown profit/day (Lv1) | Stock cost/day | Real profit/day (Lv1) | Payback Lv1 (shown) | Payback Lv1 (real) | Total spend to Lv5 | Real profit/day (Lv5) | Payback to Lv5 | Each upgrade step pays back in (1→2 / 2→3 / 3→4 / 4→5) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Food cart | $3.5k | $477 | $82 | $396 | 7.4 | 8.9 | $23.5k | $1.4k | 16.7 | 11.1 / 15.6 / 21.8 / 30.5 |
| Coffee cart | $4.0k | $531 | $83 | $448 | 7.5 | 8.9 | $26.6k | $1.6k | 16.7 | 11.1 / 15.5 / 21.7 / 30.4 |
| Ice cream cart | $3.3k | $443 | $69 | $374 | 7.4 | 8.8 | $21.9k | $1.3k | 16.5 | 11.0 / 15.4 / 21.6 / 30.2 |
| Taco truck | $5.6k | $717 | $141 | $576 | 7.8 | 9.7 | $37.5k | $2.1k | 18.0 | 11.9 / 16.6 / 23.3 / 32.6 |
| Pretzel stand | $2.6k | $357 | $51 | $306 | 7.2 | 8.4 | $17.2k | $1.1k | 16.1 | 10.8 / 15.1 / 21.1 / 29.5 |
| Noodle cart | $4.7k | $619 | $98 | $521 | 7.6 | 9.0 | $31.3k | $1.9k | 16.8 | 11.2 / 15.6 / 21.9 / 30.6 |
| Smoothie stand | $3.7k | $490 | $76 | $414 | 7.6 | 9.0 | $25.0k | $1.5k | 16.9 | 11.3 / 15.8 / 22.1 / 30.9 |
| Coffee kiosk | $14.0k | $618 | $288 | $330 | 22.7 | 42.5 | $93.8k | $1.9k | 50.7 | 29.5 / 41.3 / 57.9 / 81.0 |
| Corner shop | $42.1k | $1.5k | $720 | $823 | 27.3 | 51.2 | $281.5k | $5.0k | 56.8 | 32.6 / 45.7 / 64.0 / 89.6 |
| Restaurant | $128.7k | $4.1k | $1.7k | $2.4k | 31.5 | 54.6 | $860.1k | $14.5k | 59.3 | 33.9 / 47.5 / 66.5 / 93.1 |
| Apartment block | $327.6k | $8.6k | $0 | $8.6k | 38.2 | 38.2 | $2.19M | $35.0k | 62.5 | 39.6 / 55.5 / 77.6 / 109 |
| Office tower | $1.40M | $32.4k | $0 | $32.4k | 43.3 | 43.3 | $9.38M | $130.2k | 72.1 | 45.9 / 64.3 / 90.1 / 126 |
| Hotel | $4.21M | $132.9k | $17.3k | $115.7k | 31.7 | 36.4 | $28.15M | $482.7k | 58.3 | 36.7 / 51.4 / 72.0 / 101 |
| Security firm | $210.6k | $4.7k | $0 | $4.7k | 45.0 | 45.0 | $1.41M | $23.6k | 59.7 | 35.6 / 49.9 / 69.8 / 97.8 |
| Ambulance service | $608.4k | $10.6k | $0 | $10.6k | 57.7 | 57.7 | $4.07M | $55.0k | 74.0 | 43.8 / 61.4 / 85.9 / 120 |
| Law firm | $982.8k | $17.1k | $0 | $17.1k | 57.6 | 57.6 | $6.57M | $86.0k | 76.3 | 45.6 / 63.8 / 89.4 / 125 |
| Private prison | $6.08M | $101.7k | $0 | $101.7k | 59.8 | 59.8 | $40.66M | $510.8k | 79.6 | 47.6 / 66.6 / 93.3 / 131 |
| Taxi company | $105.3k | $2.6k | $0 | $2.6k | 40.4 | 40.4 | $703.7k | $13.3k | 52.9 | 31.5 / 44.1 / 61.7 / 86.4 |
| Bus line | $374.4k | $6.9k | $0 | $6.9k | 53.9 | 53.9 | $2.50M | $36.1k | 69.2 | 41.0 / 57.5 / 80.4 / 113 |
| Trucking company | $702.0k | $12.8k | $0 | $12.8k | 54.7 | 54.7 | $4.69M | $66.2k | 70.8 | 42.1 / 58.9 / 82.5 / 115 |
| Railway | $9.83M | $151.0k | $0 | $151.0k | 65.1 | 65.1 | $65.68M | $774.8k | 84.8 | 50.4 / 70.6 / 98.8 / 138 |
| Seaport | $14.04M | $214.0k | $0 | $214.0k | 65.6 | 65.6 | $93.83M | $1.08M | 86.7 | 51.7 / 72.4 / 101 / 142 |
| Airline | $18.72M | $399.8k | $0 | $399.8k | 46.8 | 46.8 | $125.11M | $1.81M | 69.1 | 42.5 / 59.5 / 83.3 / 117 |
| International airport | $35.10M | $733.1k | $0 | $733.1k | 47.9 | 47.9 | $234.58M | $3.24M | 72.4 | 44.8 / 62.7 / 87.8 / 123 |
| Casino | $14.04M | $268.4k | $0 | $268.4k | 52.3 | 52.3 | $93.83M | $1.26M | 74.7 | 45.5 / 63.7 / 89.1 / 125 |

### Lv1 real payback (game days) by city size

| Business | Size 1 | Size 2 | Size 3 | Size 4 | Size 5 |
|---|---:|---:|---:|---:|---:|
| Food cart | 6.1 | 6.9 | 7.5 | 8.4 | 8.9 |
| Coffee cart | 6.2 | 7.0 | 7.6 | 8.4 | 8.9 |
| Ice cream cart | 6.1 | 6.9 | 7.5 | 8.3 | 8.8 |
| Taco truck | 6.6 | 7.5 | 8.2 | 9.2 | 9.7 |
| Pretzel stand | 5.9 | 6.7 | 7.2 | 8.0 | 8.4 |
| Noodle cart | 6.2 | 7.0 | 7.6 | 8.5 | 9.0 |
| Smoothie stand | 6.3 | 7.1 | 7.7 | 8.5 | 9.0 |
| Coffee kiosk | 20.7 | 25.6 | 29.9 | 37.3 | 42.5 |
| Corner shop | 24.0 | 29.9 | 35.2 | 44.4 | 51.2 |
| Restaurant | 25.8 | 32.1 | 37.7 | 47.5 | 54.6 |
| Apartment block | 22.6 | 25.7 | 32.0 | 35.9 | 38.2 |
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

Most businesses pay back in **20–45 game days** at Lv1, which is about a day or two of real time. The street carts are the deliberate exception: since their gross was raised 1.6× (and their restock and wages were cut 30% on 2026-10-21) they pay back in **about 7 game days (7 real hours) in a size-2 city**, 6–10 days across all sizes, which is the intended quick early-game start. Almost nothing breaks the curve: no big asset pays back in under ~30 days, and everything eventually pays back at its base setup. The outliers below are about *relative* value: which choice is clearly better or clearly worse than its neighbours.

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

A $146k apartment block in a size-2 city pays back in **20.5 days** (18.3 in size 1). It needs no staff and no stock, and the ×1.25 small-city bonus applies. That beats every business that costs more than it: office 34, hotel 42, prison 42, railway 46, casino 52 in its best city. Only the $1–3k street carts (7–9 days) are faster. A mid-game player's best move is to buy an apartment block in every size-1/2 city before touching anything bigger. *(Now 25.7 days in size 2 after fix #2.)*

### 3. Upgrades get steadily worse; Lv4→5 is never worth it (MED) — DONE 2026-10-20

Each level adds a fixed amount of profit (+55% of takings, +30% of upkeep), but its cost grows 1.6× per level. So step paybacks run about **1× → 1.6× → 2.6× → 4.1×** the Lv1 payback. A cart's Lv4→5 step took 88 days to repay, an airport's 306 (before the fix and the cart buff). Buying a new Lv1 business in another city is always better, so upgrading only makes sense once you've run out of slots. That's acceptable for a late-game cash sink, but Lv5 is currently a trap for anyone still expanding.

**Fix applied:** `upCost` growth 1.6→1.4 per level (index.html:341). Step paybacks now 1× → 1.4× → 2.0× → 2.7× of the Lv1→2 step: cart Lv4→5 ≈59 days (was 88; ≈27 after the 2026-10-21 cart gross ×1.6), airport ≈205 (was 306). Total upgrade spend to Lv5 drops from 7.4× to 5.7× build cost. Saves store only levels, so they load unchanged (sell/net-worth valuations of upgraded businesses drop accordingly).

### 4. Renting big assets loses money every hour (MED) — DONE 2026-10-20

**Fixed:** `RENT` 1/40 → 1/60 (index.html:369). Leases now profit whenever payback is under 60 days. Size 5 (base profit, staffed, no stock): casino −$83k → **+$34k/day**, prison −$50k → +$0.3k, office −$2.7k → +$9k, airport −$144k → +$148k. Still losing: railway (−$13k size 5) and seaport (−$20k size 5), airline/airport in size ≤2 cities, and stocked shops/restaurants in big cities. For these the Rent button now says "· rent exceeds profit" with a red border (index.html:531, compares `bizRent` to Lv1 `profit`; skipped on blocked rows). Old saves pay the new rate automatically.

**Follow-up 2026-10-20:** transport hubs (`tr`: railway, seaport, airline, airport) now pay `min(price/60, 80% of baseline Lv1 profit)` (`rentBase`/`bizRent`, index.html:381-383). Leasing nets at least 20% of baseline profit in every city size; buying keeps 100% and still pays back in 1.6–3.4 real days. Lv1 staffed, no rivals, net per hour (= per game day):

| Business | Size | Profit | Rent before | Net before | Rent after | Net after |
|---|---|---|---|---|---|---|
| Railway | 4 | 123.7k | 122.9k | +0.8k | 99.0k | +24.7k |
| Railway | 5 | 151.0k | 163.8k | −12.8k | 120.8k | +30.2k |
| Seaport | 4 | 175.0k | 175.5k | −0.6k | 140.0k | +35.0k |
| Seaport | 5 | 214.0k | 234.0k | −20.0k | 171.2k | +42.8k |
| Airline | 1 | 94.3k | 104.0k | −9.7k | 75.4k | +18.9k |
| Airline | 2 | 101.3k | 138.7k | −37.3k | 81.1k | +20.3k |
| Airline | 4 | 208.5k | 234.0k | −25.5k | 166.8k | +41.7k |
| Airport | 1 | 175.5k | 195.0k | −19.5k | 140.4k | +35.1k |
| Airport | 2 | 190.9k | 260.0k | −69.1k | 152.7k | +38.2k |
| Airport | 4 | 388.3k | 438.8k | −50.4k | 310.7k | +77.7k |

Size 1–3 rail/port and size-5 airline/airport were already profitable and are unchanged (cap doesn't bite there except a small cut at size 3). The Rent warning now compares rent with Lv1 profit **minus hourly stock cost** (`useRate(b,1,c) × unitCost`) for stocked businesses (index.html:542, 545), so leased shops, restaurants and carts that lose money after supplies get flagged.


Rent is `price/40` per hour, so any lease with a payback above 40 days runs at a loss. In a size-5 city that covers most things: casino **−$83k/day**, railway −$95k, seaport −$137k, airport −$144k, prison −$50k, office −$2.7k, restaurant −$1.9k. Only the hotel (+$10k), apartments (+$1.2k) and food cart (+$25) make anything. The rent button is offered without any warning, and these leases still cost 20% of the price upfront. Rent is also flat by level, so an upgraded lease does improve over time. A leased Lv1 casino never does.

### 5. Airline and airport in small cities pay back about twice as slowly as peers (LOW, probably intended)

The ×0.8 small-city factor gives **82 days** in a size-2 city, against 42–46 for prison, hotel and railway. In size 5 the same assets pay back in 47–48 days, which is fine. This looks intentional; at most it needs a hint in the UI.

### 6. Bigger cities pay back more slowly for nearly everything (LOW, by design?)

The ratio `DEMAND/PRICE` drops from 1.17 (size 1) to 0.89 (size 5). So unless a business has a size bonus (hotel, airline, airport), the same business pays back faster in a small city. Example: a food cart takes 7.0 days in size 1 and 10.9 in size 5. Big cities currently win only on absolute profit per slot, not on return. No change proposed. Just be aware that "big city" businesses need their own bonus to be worth it.

### 7. Hotels are the best big asset in big cities (LOW)

A size-5 hotel costs $4.2M and pays back in **36 days** with no HQ needed. That beats office (43) and every company-only asset (47–66). A modest lead, and it fits the hotel description "Best in size-5 cities". No change proposed.

### Loans (quick check, not a loop)

Business loan rates are 0.064–0.48% per game day, against a 2–5% per day return on businesses. Borrowing to expand always pays, but the loan limit (50% of business value) stops it becoming an infinite loop. No change.

## Proposed constant tweaks (not applied)

| # | Constant | Before | After | Effect |
|---|---|---|---|---|
| 1 ✅ **done 2026-10-20** | `SUP.kiosk.c` / `SUP.shop.c` / `SUP.rest.c` (+ steakhouse `u` 1.25→1.3) | 1.3 / 2.8 / 13 | 1.0 / 2.0 / 8 | Applied. Size-5 payback: kiosk 58→43, shop 79→51, restaurant 101→55 days. Size-2 payback: kiosk 30→26, shop 38→30, restaurant 44→32 days. The food cart was unchanged by this tweak. Retail no longer falls behind the taxi company. |
| 2 ✅ **done 2026-10-20** | Apartment block `up` | 1900 | 2300, with small-city apt bonus 1.25→1.1 in `bonus()` | Size-2 payback 20.5→25.7 days, size-1 18.3→22.6, size-5 34.9→38.2. Still a strong mid-game buy, but no longer beats the cart-to-office ladder by a mile. |
| 3 | Upgrade growth in `upCost` | `Math.pow(1.6,lv-1)` | `Math.pow(1.4,lv-1)` | Step paybacks for a size-2 apartment go from 27/43/69/110 to 27/38/53/74 days. Payback to Lv5: cart 42→33, hotel 91→73, casino 107→85. Lv5 becomes a real choice rather than a trap. Existing saves are unaffected (levels already bought stay bought). |
| 4 | `RENT` | 1/40 | 1/60 | Leases of most big assets earn money: size-5 casino −$83k→+$34k/day, airport −$144k→+$148k/day. Size-5 railway (−$13k), seaport (−$20k), shop and restaurant, plus small-city airline/airport, still lose money. Buying still pays for itself within 60 days of rent. Alternative if leases are meant to be a trap: keep 1/40 and show "loses $X/hr" on the rent button. |

Tweaks 1–3 are independent. Do tweak 4 only if leasing is meant to be a real way into the late game.

## #1 applied (2026-10-20)

Supply costs are now kiosk 1.0, shop 2.0 and restaurant 8. The steakhouse menu's supply use went from 1.25 to 1.3. Without that change, cheaper ingredients would have made the steakhouse beat the diner in normal times in size 3–4 cities, and it already wins every slump. The tables above now include this change.

Payback for a Lv1 business in normal times, in days (old → new):

| Business / menu | Size 1 | Size 2 | Size 3 | Size 4 | Size 5 |
|---|---:|---:|---:|---:|---:|
| Kiosk | 23.7→20.7 | 30.4→25.6 | 36.6→29.9 | 48.3→37.3 | 57.5→42.5 |
| Shop | 28.7→24.0 | 37.6→29.9 | 46.3→35.2 | 63.9→44.4 | 78.7→51.2 |
| Restaurant – diner | 32.9→25.8 | 44.0→32.1 | 55.2→37.7 | 79.0→47.5 | 101→54.6 |
| Restaurant – steakhouse | 34.2→25.6 | 47.2→32.3 | 61.2→38.2 | 94.3→49.0 | 129→56.9 |
| Restaurant – pizzeria | 26.0→22.4 | 32.8→27.2 | 67.9→47.6 | 101→61.7 | 133→72.4 |
| Restaurant – fine dining | 39.8→27.1 | 58.4→34.6 | 81.1→41.5 | 150→54.3 | 69.9→38.4 |

Best restaurant menu by situation: pizzeria in size 1–2, diner in size 3–4, fine dining in size 5 and in any boom, steakhouse in any slump. No menu wins everywhere. Cart menus did not change.

## #2 applied (2026-10-20)

Apartment block upkeep is now 2300 (was 1900) and the small-city apartment bonus in `bonus()` is ×1.1 (was ×1.25). Tables above now include this change. Lv1, baseline setup, RENT 1/60:

| City size | Price | Profit/day old → new | Payback days old → new | Leased profit/day old → new |
|---:|---:|---:|---:|---:|
| 1 | $109.2k | $5,978 → $4,827 | 18.3 → 22.6 | $4,158 → $3,007 |
| 2 | $145.6k | $7,103 → $5,673 | 20.5 → 25.7 | $4,676 → $3,246 |
| 3 | $182.0k | $6,145 → $5,685 | 29.6 → 32.0 | $3,112 → $2,652 |
| 4 | $245.7k | $7,463 → $6,842 | 32.9 → 35.9 | $3,368 → $2,747 |
| 5 | $327.6k | $9,395 → $8,567 | 34.9 → 38.2 | $3,935 → $3,107 |

Apartments are still worth buying everywhere (23–38 days, in line with the 20–45 day band) and leases stay clearly profitable. Small cities no longer beat the office (34) by a wide margin. Old saves load unchanged: only constants changed.
