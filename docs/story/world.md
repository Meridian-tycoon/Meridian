# Meridian world bible

Background for the world of Meridian Tycoon, so news, wars, rivals and events read like one story.
Everything here is grounded in what `index.html` actually simulates. Names of people are in [cast.md](cast.md).

## Premise: the Long Calm is over

For thirty years after the **Halden Accords**, the world traded more than it fought. Shipping lanes, cloud
servers and supply chains tied every capital to every other, and eight giant companies grew so large that
people half-joked they were the real governments. That era is called **the Long Calm**.

It ended slowly. Three years before the game starts, a run of crop failures, a sovereign-debt panic and a
string of close elections pushed populist and protectionist parties into power across four continents.
Old border quarrels came back. And money started moving that nobody would sign their name to: large,
anonymous transfers to whichever government was ready to escalate. The press calls the people behind it
**the Quiet Ledger**. Nobody knows if it is one network, eight companies, or everyone at once.

The player arrives with a food cart and a bank balance. By the end they may be a Leader who decides wars,
or the anonymous donor everyone is writing about.

**Tone:** dry wire-service realism with a wink. Wars hurt, but the game never preaches. Headlines are short
and dated (`Day 42: ...`). Companies are real brands; every person is fictional.

## The world in game terms

- 63 cities in 38 countries. A country's weight is `ctyScale(n)` (sum of its city sizes); its capital is
  `cap(n)`, its biggest city (so "capitals" in text are New York, Shanghai, Mumbai, Sydney, etc.).
- Every country has a ruling party (`gov(n).party`): Workers' Party, Liberal Alliance, Conservatives,
  National Front. It starts from a name hash and changes at elections every 90 game days.
  Party drives aggression (`dipAggr`: Workers 0.7, Liberal 0.8, Conservative 1.0, National Front 1.4;
  ×1.3 under 40% approval, ×1.2 in recession).
- Wars only start between countries whose capitals are **under 5000 km apart**. So every story war is a
  regional story: a neighbour quarrel that outsiders join or pay for.
- Five countries hold nuclear weapons (`WMDCFG.nuke`): USA, China, UK, France, India.

## The major powers

| Power | Size | Capital | Starting party | Nuclear | What it wants |
|---|---|---|---|---|---|
| **USA** | 27 | New York | Workers' Party | yes | To stay the market everyone needs, while its own voters ask why it pays for everyone else. |
| **China** | 14 | Shanghai | Workers' Party | yes | Control of its seas and its suppliers; to outbuild Japan and outlast the USA. |
| **India** | 12 | Mumbai | Workers' Party | yes | Energy security from the Gulf and a seat at every table; refuses to pick a bloc. |
| **Japan** | 5 | Tokyo | National Front | no | To stop feeling small next to China. Its populist government is the most hawkish power in Asia. |
| **UK** | 5 | London | Liberal Alliance | yes | To matter again after the Long Calm; London's banks and Shell's oil keep it in every deal. |
| **France** | 5 | Paris | Conservatives | yes | To lead Europe and keep the UK from doing so. Protects its food giants (Nestlé's heartland). |
| **Türkiye** | 4 | Istanbul | Liberal Alliance | no | The crossroads: 17 countries within reach, a broker to all of them, trusted by none. |
| **Brazil** | 5 | São Paulo | National Front | no | To be the unquestioned power of South America. Populist, proud and impatient. |

Second-rank players that recur in the news: **Canada** (13, big and quiet, Amazon's northern base),
**Australia** (12, isolated, only New Zealand in range), **Germany** (6), **Nigeria** (6), and the Gulf
pair **Saudi Arabia** and **UAE**.

## Fault lines

Each fault line is a pair (or cluster) the war generators can actually pick. Use them for backstory,
not as fixed scripts: any war in the game can be read as "the next chapter" of the nearest fault line.

### 1. The Northern Line: USA – Canada (551 km)
**Backstory:** the closest allies in the world, until the **Lumber and Data Act** taxed cross-border cloud
traffic. Canada answered by courting Amazon, whose game HQ sits in Vancouver. Washington calls it
"a company with a country attached".
**Why it flares:** Amazon's corporate feuds with Walmart, Apple or JPMorgan Chase push the Canada–USA
tension meter (`wfFeudPair` uses each company's HQ country). Rarely reaches war; when it does, it is a
national shock.

### 2. The Yellow Sea Triangle: China – South Korea – Japan (867 / 1152 / 1758 km)
**Backstory:** a fishing-rights collision in the **Kestrel Shoal** killed eleven sailors in the last year
of the Long Calm. Japan's National Front won on it. Korea sits in the middle and is courted by both.
**Why it flares:** Japan's 1.4 aggression and China's size make this the most likely big war. Toyota
(HQ Tokyo) feuds push Japan against the feud partner's HQ country. Mongolia and the Philippines are the
usual allies to "send troops".

### 3. The Gulf Ledger: Saudi Arabia – UAE – Iraq – India (868 / 1216 / 1935 km)
**Backstory:** an oil-quota split broke the old Gulf cartel. Riyadh and Dubai now undercut each other
while Iraq (capital Kirkuk in-game, the oil city) plays both. India buys from all three and is quietly
paying for pipelines that bypass them.
**Why it flares:** many neighbours in range; Shell's feuds and Gulf backer offers ("Government of Saudi
Arabia offers $X to stir tension with...") fit here. Türkiye and Egypt often join as allies.

### 4. The Channel Rivalry: UK – France – Netherlands – Germany – Poland (343–931 km)
**Backstory:** after the Long Calm the **Halden Accords** were renegotiated and London walked out.
Paris and London now compete for the same banks, ports and voters. Germany and Poland quarrel over
a gas pipeline; Sweden's populists side with whoever is losing.
**Why it flares:** dense cluster, almost every European pair is under 2500 km. Two nuclear powers make
WMD beats possible (UK, France). Nestlé (HQ Paris) vs Shell (HQ London) feuds push France–UK directly.
Maersk (HQ Stockholm) drags Sweden in.

### 5. The Bosporus Hinge: Türkiye and its neighbours (Egypt 1237, Iraq 1477, Italy 1375, Poland 1386 km)
**Backstory:** Istanbul hosts every peace conference and sells drones to both sides of most of them.
**Why it flares:** Türkiye is in range of 17 countries, so it is the most frequent ally in any European,
Gulf or North African war. Story role: the broker. Peace talks headlines can name Istanbul.

### 6. The Southern Cone: Brazil – Argentina – Chile (1675 / 1139 km)
**Backstory:** the **River Plate grain dispute**: Brazil's National Front taxed Argentine wheat, Buenos
Aires closed its ports to Brazilian steel. Chile sells copper to everyone and keeps its head down.
**Why it flares:** Brazil's 1.4 aggression and size advantage. Peru and Colombia are the allies in range.

### 7. The Copper Belt: DR Congo – Kenya – South Africa – Nigeria (1546 / 1618 / 3346 km)
**Backstory:** the cobalt and copper mines around Lubumbashi feed every battery on the map. Nigeria and
South Africa compete to be the continent's banker; Kenya hosts the refugees and the aid money.
**Why it flares:** DR Congo is size 1 and the conquest rules favour a 1.5× power ratio, so it is the most
likely country to be "ruled" by a neighbour (`S.dip.ruler`) and later liberated.

### 8. The Straits and the Tasman (side stories)
- **Malacca Straits: Singapore – Indonesia – Thailand** (905 / 1427 km): a toll war over the shipping lane.
  Maersk cares; shipping headlines.
- **Tasman: Australia – New Zealand** (2156 km): each is the other's only possible war. Play it as a
  comedy of neighbours ("sheep tariff") until it isn't.

## The eight companies

The rivals (`RIVALS`) are real companies with real 2025 figures. In the story they are actors, not just
competitors. Their game HQ country (`wfHQ`, first city in `RIVAL_START`) is what their feuds push:

| Company | Game HQ | Story role |
|---|---|---|
| Walmart | Houston, USA | The populist's favourite employer; lobbies hard for tariffs. |
| Amazon | Vancouver, Canada | The "company with a country attached" (fault line 1). |
| Toyota | Tokyo, Japan | Japan's national champion; feuds turn into Yellow Sea headlines. |
| Shell | London, UK | Gulf oil and the Channel; most often suspected of Quiet Ledger money. |
| Apple | Los Angeles, USA | Neutral on paper, factories everywhere; hates any war near its suppliers. |
| Maersk | Stockholm, Sweden | Ships for everyone; profits from detours, blamed for blockades. |
| JPMorgan Chase | New York, USA | Finances both sides; first to know when a war is coming. |
| Nestlé | Paris, France | Food and water; the face of "war profiteering" scandals. |

- **Corporate rivalries** (`S.wf.cr`, 5–12 days): a feud between companies in different countries is a
  proxy war in boardrooms. While it lasts, the feuding company's anonymous money mostly goes to its own
  HQ country against its enemy's. Feuds with the player cut profit 8% in shared cities.
- **Anonymous war money** (`S.wf`): AI companies donate each hour (30% chance) to a war side or to a
  tension meter. Every donation is an "Anonymous donor" line in the feed. That is the Quiet Ledger.
- **Backer offers** (`S.wf.off`): when the player holds office, a company (60%) or a foreign government
  offers $85M–$100B to escalate against a neighbour. In story terms this is the Ledger trying to recruit
  the player.

## Underground and cartels

The street world mirrors the big one. Gangs and hustles (underground app) and player cartels (online,
price fixing and turf) are the local version of the Quiet Ledger: money with no name on it. Leaders can
raid price-fixing cartels; tie such raids to a crackdown speech by the Leader of that country.

## How to use this

**Escalation ladder and headline style**

| Game state | Trigger | Headline style |
|---|---|---|
| WF meter 0–24 "Calm" | `S.wf.tens["A\|B"].v` | none, or a trade column: "Analysts eye cooling ties between A and B" |
| WF meter 25 "Tense" | `wfStage` change | "Old wounds: A recalls ambassador over [fault-line grievance]" |
| WF meter 50 "Hostile" | stage change | "A–B talks collapse in Istanbul; markets slide" |
| WF meter 80 "Brink of War" | stage change | "Brink: A mobilises reservists, B closes border" |
| Meter hits 100 | `wfBreak` | "War between A and B after a surge of anonymous funding" + a Quiet Ledger line |
| WARL 1 Tension | `warHour`/dip new rivalry | "Tension rising between A and B" (exists) + fault-line flavour |
| WARL 2 Sanctions | escalate | "A sanctions B's [export of that region: grain, oil, chips, fish]" |
| WARL 3 Border clashes | escalate; allies may join | "Shots at the [named border]; C sends troops to back A" |
| WARL 4 War | escalate; approval +10 | "War. A's Leader [cast name]: 'We did not choose this.'" |
| De-escalation / peace | `w.l` drops / `peaceEnd` | "Ceasefire signed in [neutral city]", 25-day truce |
| Conquest / liberation | `S.dip.ruler` set / cleared | "A takes control of B" / "B is free again" |
| WMD use | `S.wmd` | grave, no jokes; name the leader who ordered it |
| Corporate feud | `S.wf.cr` push | "[Company] vs [Company]: boardroom war spills into A–B politics" |
| Backer offer | `S.wf.off` push | phone message from a named Ledger contact |

**Picking the fault line for a war:** find the pair in the list above (either order); if none matches,
use the cluster of the capital (`cap(a)`): Americas north, Southern Cone, Europe, Gulf, Africa, East Asia,
Straits, Tasman. Fall back to the generic wording that already exists.

**Rules for text**
- Keep to wire style: one line, a place, a verb, a consequence. Name a cast member at most once per line.
- Never name the player's country as aggressor unless the player chose it. Never make the player the
  villain of a headline they didn't cause.
- The Quiet Ledger is never unmasked by text alone; only the player's own records can hint who paid.
- All amounts in headlines come from game state (`fmt(amt)`), never invented.
