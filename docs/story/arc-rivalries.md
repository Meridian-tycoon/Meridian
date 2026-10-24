# Arc 2: Boardroom Wars and the Quiet Ledger's Offers

Design doc; nothing is wired yet. Turns two existing systems into stories with build-up and payoff:
**corporate feuds** (`wfFeud`, `S.wf.cr`) and **backer offers** (`wfBack`, `wfOffer`, `S.wf.off`).
People: [cast.md](cast.md). Companies and HQ countries: [world.md](world.md). Headlines: [headlines.md](headlines.md).

## Real mechanics these arcs sit on

- **Feud birth** (`wfFeud`, hourly in `wfLocalHour`): 3%/hour, at most 3 at once (`WFCFG.cr`). Company `a` is
  random; target `b` is the player (`-1`, 35%, only if the player owns something) or another rival. Length
  5-12 game days (`x.end = S.day + 5..12`). Birth line: "{Company} declared a corporate rivalry against your
  company" or "{A} started a corporate rivalry with {B}" (also `wfSay` into the feed).
- **While it lasts:** `wfAI` makes a feuding rival push its **HQ country** against its enemy's HQ country 70% of
  its tension donations (`wfFeudPair(i)`; HQ = `wfHQ(i)`, player = `wfMe()`, the country of `S.home.city`). Same
  country on both sides, or an existing war on the pair, means no push (domestic feud: pure boardroom story).
  A feud against the player cuts profit 8% in cities the rival also holds (`wfFeudHit`, `WFCFG.cr.hit` 0.92).
- **Feud end:** `wfCR()` drops it when `S.day >= x.end`. Nothing is logged today. That is the payoff gap.
- **Backer offers** (`wfBack`, only if `pol().r>=0`): 12%/hour, max 3 waiting, each lives 6 days (`exp`). 60% from a
  rival company (`ty:"co"`, `fr` = company name; picks a target from the company's feud pair if it has one), 40%
  from a foreign government (`ty:"gov"`, `fr:"Government of X"`). Kind `e` = stir tension between the player's
  country `to` and `vs`; kind `w` = fund the player's side of a war it is in. Amount $85M-$100B, small likelier.
- **Player choice** (`wfOffer(id,yes)`): Yes = cash and `S.earned` up now, `wfPush` turns the same amount into
  anonymous funding (so tension or a war budget rises), log "Took {amt} from {fr} against {vs}". No = "Declined
  {fr}'s money". Ignoring = expires silently.

## Arc A: The Feud (5 beats)

Stored later in `S.story.rv.feud[<a>_<b>] = {st, t0}`; keyed by `x.a`/`x.b` so one feud has one story.

| # | Beat | Trigger in code | Text (phone / news) |
|---|---|---|---|
| F1 | **The Spark** | `wfFeud` pushes a new `x` (new entry in `wfCR()`) | News: "{A} snubs {B} at {city} trade fair; {nameA} calls it 'a misunderstanding'". If `b===-1`, phone from the rival's figure (below): "You took {city}. We noticed." |
| F2 | **Needling** | one `wfAI` donation by `i===x.a` with `wfFeudPair` hit (the 70% case), or 2 days after F1 | News: "Anonymous donor sent {amt} to {HQ_A} against {HQ_B}" is already in the feed; add a rumour: "Counting House: money flows from the boardroom, not the ministry". |
| F3 | **Spillover** | `wfStage(tens[pair].v)` rises to Tense or Hostile while the feud is live | News: "{A}-{B} tension rising; both CEOs accused of lobbying". If the pair lies on a fault line (world.md) use that line's Tense row. |
| F4 | **Climax** | either `wfBreak(a,b)` for the HQ pair while `x` is live (the boardroom war becomes a real one) or `x.end-S.day<=1` | Break: "{CEO} says the war 'is nobody's fault'. Shares of {A} up {pct}%." No break: "{A} and {B} CEOs shake hands at {city}". |
| F5 | **Truce / payoff** | `wfCR()` filters `x` out (S.day >= x.end) | Phone: "{CEO_A}: 'No hard feelings.'" For `b===-1` add: "Profit in shared cities is back to normal." Optional +1 flavour only; no cash. |

**Against the player (`b===-1`)** adds beats the player can feel: F1 phone message, F3 the 8% hit is real and the
Business tab can show "Feud with {Company}: -8% in {n} shared cities, ends in {d} days" from `x.end-S.day`.
F5 gives closure. Never strip anything extra; the story never changes odds (that is `meridian-events`).
Player agency without punishment: the Finance/Business view tells the player which cities share the hit
(`S.rivals[x.a].cities`), so "out-expand them" is a legitimate answer.

### Marquee pairs (voices; derive others from the two people's catchphrases in cast.md)

| Feud | Why it matters | Line |
|---|---|---|
| Toyota vs Amazon | Japan against Canada (HQ pair Japan-Canada, no fault line: invent a "chip row") | Hasegawa: "We build cars. They deliver parcels. Know your place." |
| Toyota vs JPMorgan | Yellow Sea link: Japan against the USA, Morosawa's donor | Marsh: "I lend to everyone. Even Tokyo." |
| Shell vs Nestlé | Channel Rivalry: UK against France | Penrose: "Water is not a commodity." Vautrin: "Neither is oil, apparently." |
| Shell vs Maersk | UK against Sweden: fuel surcharge war | Vinding: "I will sail around you." |
| Amazon vs Walmart | USA against Canada: Northern Line | Kovalenko: "Vancouver delivers." Pruett: "Houston delivers first." |
| Walmart vs Apple | both USA: **domestic** feud, no tension push | Pruett: "Phones are not shelf space." Castell: "Neither is loyalty." |
| Any vs the player | `b===-1`, HQ pair = rival HQ vs your home country | rival figure phones, polite and cold |

## Arc B: The Offer (4 beats)

Stored later in `S.story.rv.off = {taken, declined, last, by}`.

| # | Beat | Trigger | Text |
|---|---|---|---|
| B1 | **The Approach** | `wfBack` pushes an offer `o` onto `wfOff()` | Phone from **Mr Gray** (company offers: he speaks for the rival's figure; government offers: "a friend of {Government}"): "Good afternoon, {office}. A sum of {amt} is available, should {to} take a firmer line with {vs}. No names. Six days." |
| B2 | **The Decision** | player taps Yes/No in `wfOffer` (or `o.exp<now`) | Yes: toast stays; news adds nothing. No: Mr Gray: "A pity. The offer was sincere." Expire: nothing (silence is the story). |
| B3 | **The Echo** | Yes: next `wfStage` change on `o.to`/`o.vs` pair, or `wfBreak` on it within 3 days. No: nothing. | News: "Tensions rising between {to} and {vs}: {stage}". The Counting House: "A transfer of exactly {amt} cleared the Notary this week." (True to the player's own record; never names them.) |
| B4 | **The Payoff** | Yes with `taken>=3` (a pattern), or a taken offer ends in `wfBreak`/`dipConquer` | **Priya Lindqvist** phones: "I am writing about the Ledger. Do you want to comment?" Choices are flavour only: "No comment" / "Ask her what she knows". Lines from **Ines Barros** (defector) can follow as a rare leak. Declined-only players get a different closer: **Dr Amara Nwosu** thanks "whoever turned down money to start a fight". |

**Rules for Arc B**
- No fine, arrest or approval penalty is added by the story. The only costs are the real ones the game already has
  (tension rising, war risk, `dipMult` on a war-torn country).
- The text must never accuse the player of starting a war. B3/B4 may say "a transfer", never "you".
- Offer text can name the **company figure** only for `ty:"co"` (Penrose, Hasegawa, ...); governments use their
  leader from cast.md ("the office of Faisal al-Qadri").

## Voices per rival CEO

Full list and catchphrases in [cast.md](cast.md) (section "Rival CEOs"). Phone messages signed by the figure for a
feud against the player; offers signed by Mr Gray.

## Join to other arcs

- Yellow Sea beat 1: Toyota feud with a USA/Canada rival is the usual spark ([arc-yellow-sea.md](arc-yellow-sea.md)).
- A feud that ends in `wfBreak` hands over to the generic war lines ([arc-wars.md](arc-wars.md)).
- Cooldown: each company pair tells its story once per 30 days (`S.story.rv.cd[<a>_<b>]`).
- Offline (`quiet`) catch-up: summarise F1-F5 and B1-B3 in one `S.log` line.
