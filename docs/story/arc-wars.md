# Arc 3: The Generic War Storyline

One storyline that fits any war the game produces. Fault-line flavour comes from [world.md](world.md) and
[headlines.md](headlines.md); speakers from [cast.md](cast.md) (Leader = declarations and peace, minister =
diplomacy, general = battles). The Yellow Sea arc ([arc-yellow-sea.md](arc-yellow-sea.md)) is this storyline plus
local colour. Design only; nothing is wired.

## Two layers in the code (tell them apart)

- **World wars** (`S.wars`, AI vs AI, or a Leader's country): `{id,a,b,l,att,al,fp,tr,cc,...}`. Level `w.l` 1-4 =
  `WARL`: Tension, Sanctions, Border clashes, War. Run by `warHour` (hourly), `dipDay` (daily), `wlDay` (daily
  battles), `allyDay`, `peaceAiDay`, `wmdDay`, `wfBreak`.
- **The player's own wars** (`S.pol.mil.wars[country]`, only a Leader): a front `0..100` fought hourly in
  `milHour`; ends in `milEndWar(n,"win"|"lose"|"white"|"theyPay"|"wePay")`; a win starts an **occupation**
  (`m.occ[n]`).

Story state later: `S.story.war[<w.id>] = {st, t0, spoke}` per war (`wlGid(w)` for online), `spoke` = day the
last named general spoke (limit 1 line per 5 days).

## Beats (state machine per war)

`1 Start -> 2 Escalation (WARL 2, 3, 4) -> 3 The Front -> 4 Allies -> 5 End (surrender / conquest / peace) -> 6 Occupation -> 7 Liberation -> epilogue`

Not every war visits every beat; peace can end it from 2 on. Cooldown: a fault line tells one war story at a
time and rests 40 days (reuse `d.pcd[dipKey(a,b)]` truce: `PEACE.truce` 10, `DIPCFG.truce` 25).

### 1. Start
| Trigger | Line |
|---|---|
| `warHour` pushes `{l:1}`; `logGov` "Tension rising between A and B" | Minister: "A accuses B of {border violations / airspace incursions / backing rebels / insulting its envoy}" (the exact four causes in `dipDay`) |
| `dipDay` new rivalry ("accuses ... of ...") | same, `dipSay(...,dipRel)`: the player sees it if their country or businesses are involved |
| `wfBreak` (meter 100) | "War breaks out between {fav} and {oth} after a surge of anonymous funding" + Ledger tail; skips beats 2-3 |

### 2. Escalation, per WARL
| `w.l` | Code | News / phone |
|---|---|---|
| 2 Sanctions | `warHour` "escalates to sanctions"; `dipDay` "{a} imposes sanctions on {b}"; `warMult` 0.9 | Minister: "{A} sanctions {B}'s {good}". Business: profit -10% in both countries |
| 3 Border clashes | "Border clashes between A and B"; `wlInit` builds troops (`wlTroops`, `w.fp=50`); allies count as clashes | General: "Shots on the {border}; {n}k troops on each side". `wfActive` includes it from here: donors and supply contracts open |
| 4 War | `dipDay` "declares war"; both governments +5 approval (`warHour` +10); `w.t4` clock starts | Leader: "We did not choose this." Cities can be damaged (`warHour` 3% per city, "Fighting in {city} damaged your {biz}") |
| De-escalate | `w.l--` ("de-escalates to ...") or `warAct "peace"` | Minister: "Talks in {neutral city} ease A-B to {level}" (Demirel hosts) |

### 3. The front
Each day `wlDay` fights a battle in `w.bt` (city `bt.c`, strengths `bt.ha/hb`): front `w.fp` 5..95 swings
`C.fp` 7 x intensity; `w.pu` = who pushes.
- City falls (`bt.h<=0`): `w.cc[city]=side`; line "{side} captured/recaptured {city}"; `w.ev` keeps the last 8.
- Attack stalls: "{defender} holds {city} against {attacker}".
- Named general speaks on a capture or hold, at most one line per war per 5 days: "General {name}: '{catchphrase}'".
- Swing word: `fp` moved > 10 points in 3 days = "Momentum shifts: {side} breaks through"; stalemate = 8 days between captures.
- WMD (`wmdStrike`): grave tone, no jokes, name the Leader who ordered it; 15% chance of a ceasefire afterwards
  (`ceaseP`, 100% after two strikes); other nations sanction the user (`react` 2 countries at WARL 2).

### 4. Allies join
`allyDay`: from WARL 3, 4%/day, at most 3 (`w.al[country]="a"|"b"`), a country within `nearKm` 5000 km of either
side; it backs the side it is not fighting, else the nearer neighbour. Line: "{C} sends troops to back {fav} against {oth}"
(`dipSay`). Fault-line habit: Türkiye in Europe/Gulf, Mongolia/Philippines in East Asia, Peru/Colombia in the Cone.
Player ally (`warJoin`): "{pc} sends troops to fight for {side}" / "pulls its troops out". Side strength = main +
60% of each ally; allies fight at clash level at home (`warLvl`).

### 5. The end: surrender, conquest or peace
| Ending | Trigger | News |
|---|---|---|
| **Conquest** (AI) | `dipDay`: `w.l>=4` for `t4` 6 days, ratio >= 1.5, cooldown 12 d -> `dipConquer`; `dip().ruler[b]=a`, approval 35, GDP x0.8 | "{A} conquers {B}" (+ "your occupation ended" if the player held it). General: "{B}'s capital has fallen." |
| **Invasion of the player's country** | `dipInvade`: 3-day warning -> "{by} invades {n}! Hold the front" -> `inv.prog` 0..100 | 100 lost: `dipFall` "{by} occupies {n}! You lose office"; 0 repelled: "You repelled {by}'s invasion"; 40 days stalled: "The invasion of {n} stalls" |
| **Surrender** (player's war) | `milEndWar(n,"win")` when front >= 100 or `enemyStr < 5%` | "{n} capitulated: it is now under your occupation" -> beat 6 |
| **Defeat** (player's war) | front <= 0 or army 0 -> `"lose"` | "You lost the war with {n}: you owe {amt} in reparations" (paid over 48 h, `repHours`) |
| **Peace** | `peaceOffer` (player Leader, 40-60%), `peaceAiDay` (3%/war/day, `w.l>=3`), `milPeace`, or `warHour` de-escalate to 0 | "{B} accepts {A}'s peace deal: the war is over" -> `peaceEnd` (truce 10 d); "Ceasefire signed in Istanbul". White peace / "theyPay" / "wePay" for the player's own wars |
| **Weariness** | offline and `weariness>=100` -> `milEndWar(n,"white",true)` | one `S.log` line on reload |

Supply contracts (`wsupDay`): paid out at WARL 3/4; peace = 50% reconstruction bonus; if the supplied side is
conquered = contract lost; if it wins = stake back. Lines: "Reconstruction bonus {amt}" / "{n} won the war: victory bonus {amt}".

### 6. Occupation (garrison and the ~18 h timer)
Player win: `m.occ[n] = {resist:70, gar:0, calm:0}` (`MILCFG.occResist` 70). Each hour in `milHour`:
`resist += 0.5 - 3*2*min(1.5, gar/need) (+0.5 if not Leader) +- noise`, `need = max(1, ctyScale(n)*0.5)`.
`calm` counts hours with `resist < 20`; at `calm >= occDays*24 = 12 h` the country is **integrated** into `p.ctrl[n]` with
loyalty 45. Timer in practice (`milOccLeft`): with garrison at 1.5x need resist falls about 8.5 per hour, so
~6 h to reach 20 plus 12 h calm = **about 18 h**; at 1.0x need about 21 h; with no garrison it never calms.
Resist above 85 risks a **revolt** (12%/h): "Revolt! {n} threw off your occupation", garrison lost, approval -10.
Garrison buttons: `milGarrison(n,+/-1)` = 5 infantry each; garrison infantry are excluded from `milStr`.
Business effect in AI conquests: `dipMult` x0.92 (8% less) in the ruled country.
Lines: General (own): "Resistance in {capital} down to {resist}%"; at 12 h left "Garrison holds; {h} h until {n} is ours"; at integration the Leader line
"{n} has been integrated into your controlled countries". Minister of the occupied side: protests in Istanbul.

### 7. Liberation
| Path | Trigger | News |
|---|---|---|
| AI ruler loses grip | `dipDay`: `d.day - rsince >= libAfter` 20, then 2%/day (+3% ruler at war, +2% ruler approval < 40) | "{B} throws off {A}'s rule and regains independence"; `gov(B).appr=55` |
| Player frees it | `p.ctrl[n]` or `p.mil.occ[n]` set while `d.ruler[n]` | "You free {B} from {A}" |
| Captured cities returned | `wlDay`: war below WARL 3 drops `w.cc` | "{A} and {B} hand back captured cities" |
| Revolt | `milHour` | see beat 6 |

### Epilogue (all endings)
8 game days of follow-up lines: Dr Amara Nwosu's relief agency in Nairobi, Benedikt Sauer on markets, Talia Okonjo
"reporting from {front city}" with one human line, and the Counting House on who funded it (rare leak). Then
cooldown above.

## Rules

- Calm, wire-service tone: no gore, no jokes at WMD or occupation. Every line has a place, a verb, a consequence.
- Use only names from cast.md; the speaker role by beat as above. Amounts always from game state (`fmt`).
- Never describe the player as the aggressor unless `milDeclare` did it; never take control away (the game already
  forbids game over: `dipFall` keeps the player's businesses).
- Offline (`quiet`): one summary line per war per catch-up; `dipSay` already writes "World: ..." into `S.log`.
- Online wars (`w.gid`): story state lives on the authority only.
