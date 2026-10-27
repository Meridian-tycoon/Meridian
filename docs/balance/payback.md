# Payback report

## 2026-10-27 — payback per business and level (origin/main be450de)

Computed in the browser (Playwright, fresh Montréal start) with the game's own functions: `cost(b,c)`, `upCost(b,c,lv)`, `potential(b,c,lv)` (= `profit()` staffed and fully operating, wages already subtracted), stock cost `useRate×unitCost` for supplied businesses, and the city's registered tax rate `taxRateC(c)` on positive profit. No supply bonus (+35%), managers, techs, HQ network or events. Income is per real hour = per game day. Industry sites: 10 ha Field, registered + crewed, land (`haPrice×10`) + build included, upgrades via `supCost`, value from `siteEst` (market prices in that city).

Columns: *Payback cum* = cumulative cost to reach that level ÷ net/day at that level. *Payback marginal* = that upgrade's step cost ÷ the extra net/day it adds. *<360?* = cumulative payback under 360 game days ("yes"), over 360 (">360") or never.

**How to read "under 360":** Mark asked to flag anything under 360 game days. Taken literally that flags *everything* that is buyable in a normal city: every BIZ entry pays back in 18–104 game days (≈1–4 real days). So the column is informative, not a problem list; the real outliers are the ">360" and "never" cases below.

### Summary of flags

- **Under 360 days:** all 26 BIZ types at all 5 levels in Montréal (size 3), and all 31 goods-producing industry sites. Fastest: pretzel stand Lv1 18.1 d, coffee kiosk 19.5 d, food cart 19.9 d. Slowest BIZ: international airport Lv5 103.7 d.
- **Never pays back (cash terms):** Research lab and Advanced R&D center (sites) — they produce research points only, so cash net is negative at every level (intended trade, but flagged).
- **Never in big rival cities:** in New York (size 5, 5 AI rivals at game start → `compMult` hits its 0.4 floor, while wages scale with PRICE 1.8) **every BIZ is "never" at Lv1**; at Lv5 most land at 420–3300 d and coffee kiosk, corner shop, gas station, restaurant and private prison stay "never" even at Lv5 (casino is banned in the USA). Big cities are a trap for a new player.
- **Marginal upgrade >360 d:** the Lv3→Lv4 site upgrade on 6 late-game sites (nuclear 414 d, solar 366 d, drone factory 421 d, rocket engine works 404 d, satellite assembly 439 d, spaceport 467 d) — `supCost` grows linearly with level while output gain is a flat +30%.
- **Upgrades get steadily worse:** BIZ marginal payback roughly doubles each level (cart Lv5 step 111 d vs 20 d to buy; hotel Lv5 step 151 d). Opening a second unit (#2) at Lv1 is always better than the Lv4→5 upgrade.

### Tuning suggestions

1. **Soften rival saturation:** raise `compMult` floor from 0.4 to ~0.6 or cut the per-rival hit from 0.13 to 0.08, so a size-5 city with 5 rivals is slower (≈2× Montréal) rather than never-pays.
2. **Cart upgrade curve:** `upCost` growth for carts is 1.7× per level vs 1.4× for others; lowering it to 1.5× brings cart Lv5 marginal from 111 d to ~75 d, keeping upgrades worth clicking early.
3. **Late site upgrades:** make `supCost` for Lv4 ~0.7× current, or give Lv4 +40% output instead of +30%, to pull high-tech Lv4 marginal under ~300 d.
4. **Show cash-value of RP:** label Research lab/Advanced R&D as "costs $X/day, makes Y RP" in the build list so the negative cash payback is obviously intentional.
5. **Airport Lv1 (72.7 d) is the slowest opener** while the airline (55 d) is near hotel/casino; consider ‑10% airport cost or +10% gross to keep the transport ladder monotone with cost.

### Tables

### Businesses (BIZ) — Montréal (size 3, tax 20%, PRICE 1, DEMAND 1, 0 rivals)

#### Food cart

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 1,950 | 1,950 | 98 | 19.9 | — | yes |
| 2 | 1,560 | 3,510 | 167 | 21.0 | 22.5 | yes |
| 3 | 2,652 | 6,162 | 237 | 26.0 | 37.9 | yes |
| 4 | 4,508 | 10,670 | 306 | 34.8 | 65.2 | yes |
| 5 | 7,664 | 18,334 | 376 | 48.8 | 110.8 | yes |

#### Coffee cart

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 2,210 | 2,210 | 106 | 20.9 | — | yes |
| 2 | 1,768 | 3,978 | 182 | 21.9 | 23.2 | yes |
| 3 | 3,006 | 6,984 | 257 | 27.2 | 39.9 | yes |
| 4 | 5,110 | 12,094 | 333 | 36.3 | 67.1 | yes |
| 5 | 8,686 | 20,780 | 409 | 50.8 | 114.1 | yes |

#### Ice cream cart

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 1,820 | 1,820 | 88 | 20.6 | — | yes |
| 2 | 1,456 | 3,276 | 151 | 21.6 | 23.1 | yes |
| 3 | 2,475 | 5,751 | 214 | 26.8 | 39.3 | yes |
| 4 | 4,208 | 9,959 | 277 | 35.9 | 66.9 | yes |
| 5 | 7,153 | 17,112 | 340 | 50.3 | 113.6 | yes |

#### Taco truck

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 3,120 | 3,120 | 131 | 23.8 | — | yes |
| 2 | 2,496 | 5,616 | 231 | 24.3 | 24.9 | yes |
| 3 | 4,243 | 9,859 | 331 | 29.8 | 42.7 | yes |
| 4 | 7,213 | 17,072 | 430 | 39.7 | 72.6 | yes |
| 5 | 12,263 | 29,335 | 529 | 55.4 | 123.4 | yes |

#### Pretzel stand

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 1,430 | 1,430 | 79 | 18.1 | — | yes |
| 2 | 1,144 | 2,574 | 132 | 19.4 | 21.3 | yes |
| 3 | 1,945 | 4,519 | 186 | 24.3 | 36.3 | yes |
| 4 | 3,306 | 7,825 | 240 | 32.5 | 60.8 | yes |
| 5 | 5,620 | 13,445 | 294 | 45.7 | 104.9 | yes |

#### Noodle cart

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 2,600 | 2,600 | 122 | 21.4 | — | yes |
| 2 | 2,080 | 4,680 | 210 | 22.3 | 23.5 | yes |
| 3 | 3,536 | 8,216 | 298 | 27.5 | 40.0 | yes |
| 4 | 6,011 | 14,227 | 387 | 36.8 | 68.0 | yes |
| 5 | 10,219 | 24,446 | 475 | 51.4 | 115.6 | yes |

#### Smoothie stand

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 2,080 | 2,080 | 105 | 19.9 | — | yes |
| 2 | 1,664 | 3,744 | 179 | 20.9 | 22.2 | yes |
| 3 | 2,829 | 6,573 | 253 | 25.9 | 38.2 | yes |
| 4 | 4,809 | 11,382 | 328 | 34.7 | 64.2 | yes |
| 5 | 8,175 | 19,557 | 402 | 48.6 | 110.4 | yes |

#### Coffee kiosk

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 7,800 | 7,800 | 399 | 19.5 | — | yes |
| 2 | 6,240 | 14,040 | 707 | 19.9 | 20.3 | yes |
| 3 | 8,736 | 22,776 | 1,015 | 22.4 | 28.4 | yes |
| 4 | 12,230 | 35,006 | 1,323 | 26.5 | 39.7 | yes |
| 5 | 17,123 | 52,129 | 1,630 | 32.0 | 55.7 | yes |

#### Corner shop

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 23,400 | 23,400 | 1,056 | 22.2 | — | yes |
| 2 | 18,720 | 42,120 | 1,894 | 22.2 | 22.3 | yes |
| 3 | 26,208 | 68,328 | 2,732 | 25.0 | 31.3 | yes |
| 4 | 36,691 | 105,019 | 3,570 | 29.4 | 43.8 | yes |
| 5 | 51,368 | 156,387 | 4,408 | 35.5 | 61.3 | yes |

#### Gas station

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 46,800 | 46,800 | 1,018 | 46.0 | — | yes |
| 2 | 37,440 | 84,240 | 2,020 | 41.7 | 37.4 | yes |
| 3 | 52,416 | 136,656 | 3,022 | 45.2 | 52.3 | yes |
| 4 | 73,382 | 210,038 | 4,023 | 52.2 | 73.3 | yes |
| 5 | 102,735 | 312,773 | 5,026 | 62.2 | 102.5 | yes |

#### Restaurant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 71,500 | 71,500 | 2,468 | 29.0 | — | yes |
| 2 | 57,200 | 128,700 | 4,598 | 28.0 | 26.8 | yes |
| 3 | 80,080 | 208,780 | 6,729 | 31.0 | 37.6 | yes |
| 4 | 112,112 | 320,892 | 8,858 | 36.2 | 52.6 | yes |
| 5 | 156,957 | 477,849 | 10,989 | 43.5 | 73.7 | yes |

#### Apartment block

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 182,000 | 182,000 | 4,548 | 40.0 | — | yes |
| 2 | 145,600 | 327,600 | 7,896 | 41.5 | 43.5 | yes |
| 3 | 203,840 | 531,440 | 11,244 | 47.3 | 60.9 | yes |
| 4 | 285,376 | 816,816 | 14,591 | 56.0 | 85.3 | yes |
| 5 | 399,526 | 1,216,342 | 17,939 | 67.8 | 119.3 | yes |

#### Office tower

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 780,000 | 780,000 | 17,120 | 45.6 | — | yes |
| 2 | 624,000 | 1,404,000 | 29,480 | 47.6 | 50.5 | yes |
| 3 | 873,600 | 2,277,600 | 41,840 | 54.4 | 70.7 | yes |
| 4 | 1,223,040 | 3,500,640 | 54,200 | 64.6 | 99.0 | yes |
| 5 | 1,712,256 | 5,212,896 | 66,560 | 78.3 | 138.5 | yes |

#### Hotel

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 2,340,000 | 2,340,000 | 39,240 | 59.6 | — | yes |
| 2 | 1,872,000 | 4,212,000 | 73,334 | 57.4 | 54.9 | yes |
| 3 | 2,620,800 | 6,832,800 | 107,428 | 63.6 | 76.9 | yes |
| 4 | 3,669,120 | 10,501,920 | 141,522 | 74.2 | 107.6 | yes |
| 5 | 5,136,768 | 15,638,688 | 175,616 | 89.1 | 150.7 | yes |

#### Security firm

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 117,000 | 117,000 | 2,640 | 44.3 | — | yes |
| 2 | 93,600 | 210,600 | 5,049 | 41.7 | 38.9 | yes |
| 3 | 131,040 | 341,640 | 7,458 | 45.8 | 54.4 | yes |
| 4 | 183,456 | 525,096 | 9,866 | 53.2 | 76.2 | yes |
| 5 | 256,838 | 781,934 | 12,275 | 63.7 | 106.6 | yes |

#### Ambulance service

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 338,000 | 338,000 | 6,012 | 56.2 | — | yes |
| 2 | 270,400 | 608,400 | 11,674 | 52.1 | 47.8 | yes |
| 3 | 378,560 | 986,960 | 17,336 | 56.9 | 66.9 | yes |
| 4 | 529,984 | 1,516,944 | 22,998 | 66.0 | 93.6 | yes |
| 5 | 741,978 | 2,258,922 | 28,659 | 78.8 | 131.1 | yes |

#### Law firm

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 546,000 | 546,000 | 9,620 | 56.8 | — | yes |
| 2 | 436,800 | 982,800 | 18,407 | 53.4 | 49.7 | yes |
| 3 | 611,520 | 1,594,320 | 27,194 | 58.6 | 69.6 | yes |
| 4 | 856,128 | 2,450,448 | 35,981 | 68.1 | 97.4 | yes |
| 5 | 1,198,579 | 3,649,027 | 44,768 | 81.5 | 136.4 | yes |

#### Private prison

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 3,380,000 | 3,380,000 | 57,280 | 59.0 | — | yes |
| 2 | 2,704,000 | 6,084,000 | 109,392 | 55.6 | 51.9 | yes |
| 3 | 3,785,600 | 9,869,600 | 161,504 | 61.1 | 72.6 | yes |
| 4 | 5,299,840 | 15,169,440 | 213,616 | 71.0 | 101.7 | yes |
| 5 | 7,419,776 | 22,589,216 | 265,728 | 85.0 | 142.4 | yes |

#### Taxi company

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 58,500 | 58,500 | 1,476 | 39.6 | — | yes |
| 2 | 46,800 | 105,300 | 2,840 | 37.1 | 34.3 | yes |
| 3 | 65,520 | 170,820 | 4,204 | 40.6 | 48.0 | yes |
| 4 | 91,728 | 262,548 | 5,567 | 47.2 | 67.3 | yes |
| 5 | 128,419 | 390,967 | 6,931 | 56.4 | 94.1 | yes |

#### Bus line

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 208,000 | 208,000 | 3,956 | 52.6 | — | yes |
| 2 | 166,400 | 374,400 | 7,678 | 48.8 | 44.7 | yes |
| 3 | 232,960 | 607,360 | 11,399 | 53.3 | 62.6 | yes |
| 4 | 326,144 | 933,504 | 15,120 | 61.7 | 87.7 | yes |
| 5 | 456,602 | 1,390,106 | 18,842 | 73.8 | 122.7 | yes |

#### Trucking company

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 390,000 | 390,000 | 9,430 | 41.4 | — | yes |
| 2 | 312,000 | 702,000 | 17,414 | 40.3 | 39.1 | yes |
| 3 | 436,800 | 1,138,800 | 25,397 | 44.8 | 54.7 | yes |
| 4 | 611,520 | 1,750,320 | 33,380 | 52.4 | 76.6 | yes |
| 5 | 856,128 | 2,606,448 | 41,363 | 63.0 | 107.2 | yes |

#### Railway

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 5,460,000 | 5,460,000 | 110,630 | 49.4 | — | yes |
| 2 | 4,368,000 | 9,828,000 | 203,861 | 48.2 | 46.9 | yes |
| 3 | 6,115,200 | 15,943,200 | 297,091 | 53.7 | 65.6 | yes |
| 4 | 8,561,280 | 24,504,480 | 390,322 | 62.8 | 91.8 | yes |
| 5 | 11,985,792 | 36,490,272 | 483,552 | 75.5 | 128.6 | yes |

#### Seaport

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 7,800,000 | 7,800,000 | 155,480 | 50.2 | — | yes |
| 2 | 6,240,000 | 14,040,000 | 285,154 | 49.2 | 48.1 | yes |
| 3 | 8,736,000 | 22,776,000 | 414,828 | 54.9 | 67.4 | yes |
| 4 | 12,230,400 | 35,006,400 | 544,502 | 64.3 | 94.3 | yes |
| 5 | 17,122,560 | 52,128,960 | 674,176 | 77.3 | 132.0 | yes |

#### Airline

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 10,400,000 | 10,400,000 | 189,060 | 55.0 | — | yes |
| 2 | 8,320,000 | 18,720,000 | 351,923 | 53.2 | 51.1 | yes |
| 3 | 11,648,000 | 30,368,000 | 514,786 | 59.0 | 71.5 | yes |
| 4 | 16,307,200 | 46,675,200 | 677,649 | 68.9 | 100.1 | yes |
| 5 | 22,830,080 | 69,505,280 | 840,512 | 82.7 | 140.2 | yes |

#### International airport

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 19,500,000 | 19,500,000 | 268,400 | 72.7 | — | yes |
| 2 | 15,600,000 | 35,100,000 | 515,380 | 68.1 | 63.2 | yes |
| 3 | 21,840,000 | 56,940,000 | 762,360 | 74.7 | 88.4 | yes |
| 4 | 30,576,000 | 87,516,000 | 1,009,340 | 86.7 | 123.8 | yes |
| 5 | 42,806,400 | 130,322,400 | 1,256,320 | 103.7 | 173.3 | yes |

#### Casino

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 7,800,000 | 7,800,000 | 148,000 | 52.7 | — | yes |
| 2 | 6,240,000 | 14,040,000 | 273,560 | 51.3 | 49.7 | yes |
| 3 | 8,736,000 | 22,776,000 | 399,120 | 57.1 | 69.6 | yes |
| 4 | 12,230,400 | 35,006,400 | 524,680 | 66.7 | 97.4 | yes |
| 5 | 17,122,560 | 52,128,960 | 650,240 | 80.2 | 136.4 | yes |

### Industry sites — Montréal, 10 ha Field, registered, crewed (land + build included; max Lv 4)

#### Wheat farm

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 12,000 | 12,000 | 474 | 25.3 | — | yes |
| 2 | 1,800 | 13,800 | 640 | 21.6 | 10.8 | yes |
| 3 | 3,600 | 17,400 | 806 | 21.6 | 21.7 | yes |
| 4 | 5,400 | 22,800 | 972 | 23.5 | 32.5 | yes |

#### Corn farm

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 12,000 | 12,000 | 456 | 26.3 | — | yes |
| 2 | 1,800 | 13,800 | 617 | 22.4 | 11.2 | yes |
| 3 | 3,600 | 17,400 | 778 | 22.4 | 22.4 | yes |
| 4 | 5,400 | 22,800 | 938 | 24.3 | 33.6 | yes |

#### Cattle ranch

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 18,000 | 18,000 | 390 | 46.1 | — | yes |
| 2 | 5,400 | 23,400 | 526 | 44.5 | 39.9 | yes |
| 3 | 10,800 | 34,200 | 661 | 51.8 | 79.9 | yes |
| 4 | 16,200 | 50,400 | 796 | 63.3 | 119.8 | yes |

#### Iron mine

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 29,000 | 29,000 | 1,080 | 26.9 | — | yes |
| 2 | 12,000 | 41,000 | 1,458 | 28.1 | 31.7 | yes |
| 3 | 24,000 | 65,000 | 1,836 | 35.4 | 63.6 | yes |
| 4 | 36,000 | 101,000 | 2,214 | 45.6 | 95.1 | yes |

#### Coal mine

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 24,000 | 24,000 | 400 | 60.0 | — | yes |
| 2 | 9,000 | 33,000 | 568 | 58.1 | 53.6 | yes |
| 3 | 18,000 | 51,000 | 736 | 69.3 | 107.1 | yes |
| 4 | 27,000 | 78,000 | 904 | 86.3 | 160.7 | yes |

#### Sand quarry

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 18,000 | 18,000 | 568 | 31.7 | — | yes |
| 2 | 5,400 | 23,400 | 769 | 30.4 | 26.9 | yes |
| 3 | 10,800 | 34,200 | 969 | 35.3 | 54.0 | yes |
| 4 | 16,200 | 50,400 | 1,170 | 43.1 | 80.7 | yes |

#### Flour mill

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 39,000 | 39,000 | 768 | 50.8 | — | yes |
| 2 | 18,000 | 57,000 | 1,070 | 53.3 | 59.5 | yes |
| 3 | 36,000 | 93,000 | 1,373 | 67.7 | 119.0 | yes |
| 4 | 54,000 | 147,000 | 1,675 | 87.8 | 178.6 | yes |

#### Industrial bakery

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 44,000 | 44,000 | 832 | 52.9 | — | yes |
| 2 | 21,000 | 65,000 | 1,178 | 55.2 | 60.8 | yes |
| 3 | 42,000 | 107,000 | 1,523 | 70.2 | 121.5 | yes |
| 4 | 63,000 | 170,000 | 1,869 | 91.0 | 182.3 | yes |

#### Meat plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 49,000 | 49,000 | 992 | 49.4 | — | yes |
| 2 | 24,000 | 73,000 | 1,350 | 54.1 | 67.1 | yes |
| 3 | 48,000 | 121,000 | 1,707 | 70.9 | 134.2 | yes |
| 4 | 72,000 | 193,000 | 2,065 | 93.5 | 201.3 | yes |

#### Burger plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 89,000 | 89,000 | 2,586 | 34.4 | — | yes |
| 2 | 48,000 | 137,000 | 3,482 | 39.3 | 53.6 | yes |
| 3 | 96,000 | 233,000 | 4,377 | 53.2 | 107.2 | yes |
| 4 | 144,000 | 377,000 | 5,273 | 71.5 | 160.7 | yes |

#### Steel mill

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 69,000 | 69,000 | 1,320 | 52.3 | — | yes |
| 2 | 36,000 | 105,000 | 1,824 | 57.6 | 71.4 | yes |
| 3 | 72,000 | 177,000 | 2,328 | 76.0 | 142.9 | yes |
| 4 | 108,000 | 285,000 | 2,832 | 100.6 | 214.3 | yes |

#### Glassworks

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 54,000 | 54,000 | 1,072 | 50.4 | — | yes |
| 2 | 27,000 | 81,000 | 1,478 | 54.8 | 66.6 | yes |
| 3 | 54,000 | 135,000 | 1,883 | 71.7 | 133.1 | yes |
| 4 | 81,000 | 216,000 | 2,289 | 94.4 | 199.7 | yes |

#### Tool factory

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 129,000 | 129,000 | 2,816 | 45.8 | — | yes |
| 2 | 72,000 | 201,000 | 3,805 | 52.8 | 72.8 | yes |
| 3 | 144,000 | 345,000 | 4,794 | 72.0 | 145.6 | yes |
| 4 | 216,000 | 561,000 | 5,782 | 97.0 | 218.4 | yes |

#### Electronics plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 209,000 | 209,000 | 3,776 | 55.3 | — | yes |
| 2 | 120,000 | 329,000 | 5,125 | 64.2 | 89.0 | yes |
| 3 | 240,000 | 569,000 | 6,474 | 87.9 | 177.9 | yes |
| 4 | 360,000 | 929,000 | 7,822 | 118.8 | 266.9 | yes |

#### Coal power plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 59,000 | 59,000 | 1,080 | 54.6 | — | yes |
| 2 | 30,000 | 89,000 | 1,428 | 62.3 | 86.2 | yes |
| 3 | 60,000 | 149,000 | 1,776 | 83.9 | 172.4 | yes |
| 4 | 90,000 | 239,000 | 2,124 | 112.5 | 258.6 | yes |

#### Nuclear power plant (burns uranium)

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 409,000 | 409,000 | 5,560 | 73.6 | — | yes |
| 2 | 240,000 | 649,000 | 7,300 | 88.9 | 137.9 | yes |
| 3 | 480,000 | 1,129,000 | 9,040 | 124.9 | 275.9 | yes |
| 4 | 720,000 | 1,849,000 | 10,780 | 171.5 | 413.8 | yes |

#### Solar farm

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 69,000 | 69,000 | 944 | 73.1 | — | yes |
| 2 | 36,000 | 105,000 | 1,239 | 84.7 | 122.0 | yes |
| 3 | 72,000 | 177,000 | 1,534 | 115.4 | 243.9 | yes |
| 4 | 108,000 | 285,000 | 1,830 | 155.8 | 365.9 | yes |

#### Research lab

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 34,000 | 34,000 | -150 | never | — | NEVER |
| 2 | 15,000 | 49,000 | -172 | never | never | NEVER |
| 3 | 30,000 | 79,000 | -195 | never | never | NEVER |
| 4 | 45,000 | 124,000 | -217 | never | never | NEVER |

#### Uranium mine (permit)

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 69,000 | 69,000 | 1,760 | 39.2 | — | yes |
| 2 | 36,000 | 105,000 | 2,348 | 44.7 | 61.2 | yes |
| 3 | 72,000 | 177,000 | 2,936 | 60.3 | 122.4 | yes |
| 4 | 108,000 | 285,000 | 3,524 | 80.9 | 183.7 | yes |

#### Oil well

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 49,000 | 49,000 | 720 | 68.1 | — | yes |
| 2 | 24,000 | 73,000 | 1,008 | 72.4 | 83.3 | yes |
| 3 | 48,000 | 121,000 | 1,296 | 93.4 | 166.7 | yes |
| 4 | 72,000 | 193,000 | 1,584 | 121.8 | 250.0 | yes |

#### Oil refinery

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 49,000 | 49,000 | 1,900 | 25.8 | — | yes |
| 2 | 24,000 | 73,000 | 2,500 | 29.2 | 40.0 | yes |
| 3 | 48,000 | 121,000 | 3,100 | 39.0 | 80.0 | yes |
| 4 | 72,000 | 193,000 | 3,700 | 52.2 | 120.0 | yes |

#### Plastics plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 44,000 | 44,000 | 1,420 | 31.0 | — | yes |
| 2 | 21,000 | 65,000 | 1,882 | 34.5 | 45.4 | yes |
| 3 | 42,000 | 107,000 | 2,344 | 45.6 | 91.0 | yes |
| 4 | 63,000 | 170,000 | 2,806 | 60.6 | 136.2 | yes |

#### Pharmaceutical plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 259,000 | 259,000 | 4,764 | 54.4 | — | yes |
| 2 | 150,000 | 409,000 | 6,374 | 64.2 | 93.2 | yes |
| 3 | 300,000 | 709,000 | 7,982 | 88.8 | 186.5 | yes |
| 4 | 450,000 | 1,159,000 | 9,592 | 120.8 | 279.6 | yes |

#### Car factory

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 159,000 | 159,000 | 4,080 | 39.0 | — | yes |
| 2 | 90,000 | 249,000 | 5,664 | 44.0 | 56.8 | yes |
| 3 | 180,000 | 429,000 | 7,248 | 59.2 | 113.6 | yes |
| 4 | 270,000 | 699,000 | 8,832 | 79.1 | 170.5 | yes |

#### Chip fab

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 189,000 | 189,000 | 3,520 | 53.7 | — | yes |
| 2 | 108,000 | 297,000 | 4,876 | 60.9 | 79.6 | yes |
| 3 | 216,000 | 513,000 | 6,232 | 82.3 | 159.3 | yes |
| 4 | 324,000 | 837,000 | 7,588 | 110.3 | 238.9 | yes |

#### Advanced R&D center

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 209,000 | 209,000 | -2,910 | never | — | NEVER |
| 2 | 120,000 | 329,000 | -3,693 | never | never | NEVER |
| 3 | 240,000 | 569,000 | -4,476 | never | never | NEVER |
| 4 | 360,000 | 929,000 | -5,259 | never | never | NEVER |

#### Aerospace works

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 509,000 | 509,000 | 5,920 | 86.0 | — | yes |
| 2 | 300,000 | 809,000 | 8,656 | 93.5 | 109.6 | yes |
| 3 | 600,000 | 1,409,000 | 11,392 | 123.7 | 219.3 | yes |
| 4 | 900,000 | 2,309,000 | 14,128 | 163.4 | 328.9 | yes |

#### Robotics plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 609,000 | 609,000 | 13,680 | 44.5 | — | yes |
| 2 | 360,000 | 969,000 | 18,504 | 52.4 | 74.6 | yes |
| 3 | 720,000 | 1,689,000 | 23,328 | 72.4 | 149.3 | yes |
| 4 | 1,080,000 | 2,769,000 | 28,152 | 98.4 | 223.9 | yes |

#### Armored vehicle plant

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 1,509,000 | 1,509,000 | 25,640 | 58.9 | — | yes |
| 2 | 900,000 | 2,409,000 | 34,532 | 69.8 | 101.2 | yes |
| 3 | 1,800,000 | 4,209,000 | 43,424 | 96.9 | 202.4 | yes |
| 4 | 2,700,000 | 6,909,000 | 52,316 | 132.1 | 303.6 | yes |

#### Drone factory

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 1,209,000 | 1,209,000 | 13,920 | 86.9 | — | yes |
| 2 | 720,000 | 1,929,000 | 19,056 | 101.2 | 140.2 | yes |
| 3 | 1,440,000 | 3,369,000 | 24,192 | 139.3 | 280.4 | yes |
| 4 | 2,160,000 | 5,529,000 | 29,328 | 188.5 | 420.6 | yes |

#### Rocket engine works

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 4,209,000 | 4,209,000 | 50,400 | 83.5 | — | yes |
| 2 | 2,520,000 | 6,729,000 | 69,120 | 97.4 | 134.6 | yes |
| 3 | 5,040,000 | 11,769,000 | 87,840 | 134.0 | 269.2 | yes |
| 4 | 7,560,000 | 19,329,000 | 106,560 | 181.4 | 403.8 | yes |

#### Satellite assembly

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 5,209,000 | 5,209,000 | 59,040 | 88.2 | — | yes |
| 2 | 3,120,000 | 8,329,000 | 80,352 | 103.7 | 146.4 | yes |
| 3 | 6,240,000 | 14,569,000 | 101,664 | 143.3 | 292.8 | yes |
| 4 | 9,360,000 | 23,929,000 | 122,976 | 194.6 | 439.2 | yes |

#### Spaceport

| Lv | Step cost | Cumulative | Net/day | Payback cum (d) | Payback marginal (d) | <360? |
|---|---|---|---|---|---|---|
| 1 | 15,009,000 | 15,009,000 | 152,800 | 98.2 | — | yes |
| 2 | 9,000,000 | 24,009,000 | 210,640 | 114.0 | 155.6 | yes |
| 3 | 18,000,000 | 42,009,000 | 268,480 | 156.5 | 311.2 | yes |
| 4 | 27,000,000 | 69,009,000 | 326,320 | 211.5 | 466.8 | yes |

### City effect — Lv1 / Lv5 cumulative payback (days)

| Business | Montréal (s3, 0 rivals) | Reykjavík (s1, 0 rivals) | New York (s5, 5 rivals) |
|---|---|---|---|
| Food cart | 19.9 / 48.8 | 17.4 / 43.2 | never / 709.8 |
| Coffee cart | 20.9 / 50.8 | 18.4 / 45.0 | never / 746.9 |
| Ice cream cart | 20.6 / 50.3 | 18.0 / 44.6 | never / 696.4 |
| Taco truck | 23.8 / 55.4 | 20.6 / 48.9 | never / 3299.3 |
| Pretzel stand | 18.1 / 45.7 | 16.0 / 40.6 | never / 421.0 |
| Noodle cart | 21.4 / 51.4 | 18.7 / 45.5 | never / 831.7 |
| Smoothie stand | 19.9 / 48.6 | 17.4 / 43.1 | never / 589.0 |
| Coffee kiosk | 19.5 / 32.0 | 16.9 / 28.2 | never / never |
| Corner shop | 22.2 / 35.5 | 19.2 / 31.3 | never / never |
| Gas station | 46.0 / 62.2 | 65.9 / 75.4 | never / never |
| Restaurant | 29.0 / 43.5 | 20.7 / 33.4 | never / never |
| Apartment block | 40.0 / 67.8 | 24.6 / 44.7 | 11805.4 / 377.4 |
| Office tower | 45.6 / 78.3 | 32.0 / 57.7 | 1756.1 / 418.3 |
| Hotel | 59.6 / 89.1 | 38.1 / 62.7 | never / 565.9 |
| Security firm | 44.3 / 63.7 | 28.7 / 45.7 | never / 629.1 |
| Ambulance service | 56.2 / 78.8 | 36.0 / 56.4 | never / 871.5 |
| Law firm | 56.8 / 81.5 | 36.8 / 58.5 | never / 808.1 |
| Private prison | 59.0 / 85.0 | 23.2 / 40.9 | never / never |
| Taxi company | 39.6 / 56.4 | 25.6 / 40.5 | never / 582.1 |
| Bus line | 52.6 / 73.8 | 33.7 / 52.8 | never / 812.3 |
| Trucking company | 41.4 / 63.0 | 27.6 / 45.6 | never / 493.9 |
| Railway | 49.4 / 75.5 | 32.9 / 54.6 | never / 584.0 |
| Seaport | 50.2 / 77.3 | blocked | never / 581.5 |
| Airline | 55.0 / 82.7 | 52.8 / 78.9 | never / 380.4 |
| International airport | 72.7 / 103.7 | blocked | never / 526.4 |
| Casino | 52.7 / 80.2 | blocked | blocked |

