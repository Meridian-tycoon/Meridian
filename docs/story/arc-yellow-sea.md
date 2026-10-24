# Arc 1: The Yellow Sea Triangle (China – South Korea – Japan)

Design doc only; nothing here is wired into `index.html` yet. Background: [world.md](world.md) fault line 2.
Names: [cast.md](cast.md). Headline text: [headlines.md](headlines.md). Rival feuds: [arc-rivalries.md](arc-rivalries.md).

**One-line story:** eleven sailors died on the Kestrel Shoal; Japan's National Front won on it; money with no
name starts moving. Does the Triangle cool in Istanbul, freeze into a ceasefire, or end with a flag over Seoul?

## State

Stored later in `S.story.ys = {st, d0, pair, fav, ch, cd}` (all defaulted for old saves):
`st` beat 0..5, `d0` = `S.day` the arc started, `pair` = the pair that carries it, `fav` = the country the
anonymous money favours, `ch` = player choice flags, `cd` = `S.day` before which a new run may not start.

**Pairs that carry the arc** (any one): `China|Japan`, `China|South Korea`, `Japan|South Korea`
(`wfPair(a,b)` sorts names, so the keys are exactly these). Aggressor words use Japan first (`dipAggr` National
Front 1.4); if the real war has other order, use `w.a`/`w.b` and `w.att` for who is "the aggressor" in text.

## The state machine

```
 DORMANT --(Tense)--> 1 SHOAL --(Hostile)--> 2 INCIDENT --(Brink)--> 3 MOBILISATION --(war)--> 4 WAR --> 5 AFTERMATH --(cooldown)--> DORMANT
                            \______ meters cool / talks / de-escalate: back to DORMANT early, cooldown 15 d ______/
```

| Beat | Name | Enter when (real state) | Leaves when |
|---|---|---|---|
| 0 | Dormant | `S.story.ys.st==0`, `S.day>=ys.cd`, none of the 3 countries in `dip().ruler`, no war on the pair above WARL 1 | beat 1 trigger |
| 1 | The Shoal | `wf().tens[pair].v>=25` (`wfStage(v)[1]==="Tense"`) **or** a war on the pair exists with `w.l==1` (`warHour` "Tension rising", or `dipDay` "accuses ... of border violations") | meter >= 50 or `w.l>=2`; or meter hits 0 / `w.l` back to 0 for 6 h: reset to 0, `cd=S.day+15` |
| 2 | The Incident | `tens[pair].v>=50` ("Hostile") **or** `w.l==2` ("imposes sanctions", `dipDay` escalation) | `v>=80` or `w.l==3`; cool-down as above |
| 3 | Mobilisation | `tens[pair].v>=80` ("Brink of War") **or** `w.l==3` (border clashes; `allyDay` may add Mongolia/Philippines etc. via `w.al`) | `wfBreak` or `w.l==4` |
| 4 | War | `wfBreak(a,b)` fired (it sets `w.l=4`, `w.att=fav`, `w.pin=S.day+1`, `delete d.tens[k]`) **or** `w.l==4` from `warHour`/`dipDay` ("declares war") | war leaves `S.wars` (`peaceEnd`), `dip().ruler[x]` set (`dipConquer`), or `w.l<=2` after WMD ceasefire |
| 5 | Aftermath | see endings below | 8 game days of epilogue lines, then `cd=S.day+40`, `st=0` |

## Beats: what the world says and what the player can do

**1. The Shoal (Tense).** Anniversary of the Kestrel Shoal deaths. Morosawa says "We do not forget eleven
names." Park Ji-hwan calls for calm. *Player:* nothing forced. A Meridian Wire note: "Benedikt Sauer: yen
and won wobble, Toyota shares dip". Hook for [arc-rivalries.md](arc-rivalries.md): if Toyota has an active
feud (`S.wf.cr` with `RIVALS[2]`), `wfFeudPair(2)` pushes Japan against the enemy's HQ country, which is the
most likely way this beat starts.

**2. The Incident (Hostile).** A fishing boat is rammed off the Kestrel Shoal; each side blames the other.
Premier Lin Shoumei: "Our waters, our laws." Seoul closes its airspace to both. Phone message from
**Talia Okonjo** ("reporting from Busan") with two lines of facts and one unconfirmed rumour.
*Player choices* (all optional, none locked behind score):
- **Fund talks** (existing `Fund talks` button, `warAct(id,"peace")`, `warCost(w)`, 55% success, `w.l--`) only
  when a war record exists (`w.l>=1`); ending bias: **Seoul Accord**.
- **Anonymous push** (`wfSend` with `k:"e"`, `to`/`vs` = pair): moves `tens[pair].v` and sets who `fav` is;
  ending bias: war favouring that side.
- **Do nothing / trade as usual:** the arc runs on AI donors (`wfAI`, 30% per hour) and `dipDay` rolls.
- If the player is a Minister/Leader of China, Japan or Korea (`dipPlayerC()`): a backer offer (`wfBack`) may
  arrive from "Mr Gray"; see [arc-rivalries.md](arc-rivalries.md) for the take/decline lines.

**3. Mobilisation (Brink).** Reservists called up in Tokyo, border closed at the Yalu, Chinese carrier group
leaves Qingdao. `warMult` cuts profit in all three countries (WARL 3 = 0.8). The Counting House: "Three
transfers in 48 hours, cleared by the Notary." *Player:* last chance for talks (`Fund talks`, or as Leader
`peaceOffer`, 40-60%). If the player holds a Leader seat in a bystander, `warJoin` (Fight for X) is offered
at WARL 3+ (`allyBtns`). Supply contracts open at WARL 3 (`wsupSign`, pays 3%/day of stake).

**4. War.** `wfBreak` text: "War breaks out between {fav} and {oth} after a surge of anonymous funding" plus a
Ledger line. From here the generic engine runs: see [arc-wars.md](arc-wars.md) (front swings, captured
cities, allies, ceasefire). Arc-specific extras: Seoul is the likeliest first captured city
(`wlTarget` picks the city nearest the front); Hasegawa (Toyota) and Marsh (JPMorgan) get a line each.
Both governments get +10 approval (`wfBreak`) or +5 (`dipDay`), so rally lines are true to the numbers.
*Player:* supply a side (`wsupSign`), sell arms (`warAct "stoke"`), send troops as Leader (`warJoin`), fund a
side (`wfSend k:"w"`), or fund talks. `PEACE`: any Leader of a combatant can `peaceOffer`.

**5. Aftermath.** Pick the ending by how the war leaves state (check in this order):
1. **Conquest:** `dip().ruler` now holds one of the three. Text: "{ruler} takes control of {country}", Wen
   Kaixuan / Aiko Tanabe condemn it. Epilogue: liberation chance after `libAfter` 20 days (`dipDay`), then
   "{country} is free again" and `gov(country).appr=55`.
2. **Seoul Accord** (peace deal): war gone via `peaceEnd` or de-escalated below WARL 1 with `d.pcd` truce
   (`PEACE.truce` 10 d, `dipDay` 10 d, invasion truce 25 d). Ambassador Demirel hosts it in Istanbul; Dr
   Nwosu's relief agency appears. Supply contracts pay `WSUP.peace` 50% reconstruction bonus.
3. **Frozen line** (WMD ceasefire or stalled invasion): `w.l` drops to 2 via `wmdDay` or `dipInvDay`
   "stalls"; sanctions stay. No winner line, only "shaky ceasefire holds".

## Ending variants driven by the player (summary)

| Player did | Likely ending | Why (real mechanic) |
|---|---|---|
| Funded talks before WARL 4 | Seoul Accord or early reset | `warAct peace` drops `w.l`; `w.pin` is only 1 day after `wfBreak` so talks bite again soon |
| Funded one side anonymously | War favouring that side | `wfBreak` picks `fav` by `T.f` totals and gives it +6 front points (`WFCFG.headFp`) |
| Supplied the winner | Victory bonus | `wsupDay`: stake back if the other side is ruled |
| Stayed out | Whatever the AI rolls | `wfAI`, `dipDay`; most likely ending is Frozen line or Accord |
| Is Leader of a combatant | Invasion path if the AI wins | `dipInvade` when the player's country is conquered (3-day warning, `dipRally`); never game over |

## Rules

- Cooldown: after beat 5 `cd=S.day+40`; resets to `+15` after an early cool-down. Only one Yellow Sea run at a time.
- The arc only **narrates** state the game already produced. It never raises `tens`, starts a war or changes
  `w.l` on its own (that would be `meridian-events`' call and balance's for any money).
- Never blame the player's country as aggressor unless `w.att` really is the player's country.
- Offline catch-up (`quiet`): skip toasts; write beats 1-5 as one summary line in `S.log`.
- Online/shared worlds (`wwShared()`): only the authority (`wfAuth()`) advances `ys.st`.
