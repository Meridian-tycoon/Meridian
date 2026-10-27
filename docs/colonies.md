# Moon and Mars colonies

Countries can claim the Moon and Mars. Only a player who **holds office** (Government app) can run a national colony; the colony belongs to the country, so if you lose office it stays with your country and the next player who governs it takes over.

**Unlock:** research **Lunar outpost** (Space tier, after Launch complex) for the Moon, then **Mars colony** (now needs Lunar outpost) for Mars. Open Mission control → **Colonies**.

**How it works**
- Every mission flies from one of your spaceports and uses orbital launches plus cargo from that city's depot.
- The Moon is 3 days away (3 real hours). Mars is 45 days (45 real hours) and you can only launch during a shared window: 3 days open out of every 15.
- Each planet has 12 sites, each with an ore. Founding a colony on a free site pays a government grant.
- A supplied colony mines ore and makes research. Without supply it goes idle and its defence halves; nothing dies.
- Every ship that lands brings the colony's stored ore home to its spaceport, where a government buyer pays for it.
- You can take another country's colony with an assault, but only while you are at war with that country.
- Government and AI space programs (NASA, CNSA, Roscosmos, ESA, ISRO, JAXA, CSA, Orbitron AI) slowly claim about half of the free sites. Their sites show as coloured squares on the discs and under **Agency colonies**. You can't found on them, but you can assault them without a war.
- Colonies can be upgraded (habitat dome, mass driver, research lab, defence turret), get fresh crews, and fly tourists.
- Space ore can be sold anywhere to the **Space broker** at 85% of the government price, or traded with other players on the **Ore exchange** tab.

| Mission | Launches (Moon/Mars) | Cargo |
|---|---|---|
| Found | 2 / 4 | 5 robots, 10 electronics, 200 fuel |
| Supply (+30 days, max 120) | 1 / 2 | 20 bread, 10 medicine, 100 fuel |
| Expand (+1 level, max 5) | 2 / 3 | 20 steel, 10 electronics, 200 fuel |
| Garrison | 1 / 2 | 2 armored vehicles **or** 5 drones |
| Assault (force ×1 to ×4) | 2 / 3 | 4 armored vehicles **or** 10 drones, times the force size |
| Build upgrade | 1 / 2 | see the upgrade table |
| Crew rotation | 1 / 2 | 20 medicine, 40 bread, 150 fuel |
| Tourist flight (level 2+, needs a dome) | 1 / 2 | 20 medicine, 40 bread, 150 fuel |

| Number | Value |
|---|---|
| Founding grant | $50M Moon / $250M Mars |
| New colony supply | 30 days |
| Ore | 2 × level units per day while supplied |
| Research | +2 × level points per hour while supplied |
| Auto-supply | flies a supply run when under 15 days |
| Defence | 10 × level + 20 per turret level + 15 per armored + 5 per drone (halved with no supply) |
| Assault strength | 15 per armored, 5 per drone; win if strength beats defence |
| Win | colony, level and ore change hands; garrison becomes the attackers |
| Lose | the defender's garrison is halved |

Moon ores: Helium-3 $60k, Ilmenite $20k, Lunar ice $25k, KREEP rare earths $45k, Anorthite $20k, Regolith glass $30k.
Mars ores: Hematite $50k, Jarosite $70k, Olivine $60k, Deuterium ice $150k, Perchlorate salts $90k, Martian basalt $50k.


Note: ores land in the spaceport city's depot. Government buyers only exist in cities that have one (government licence, city size 4+), so ship ores from a small spaceport city to a bigger one to sell at the government price.

## Upgrades

Each upgrade goes to level 3; level N needs a level N colony. One Build mission adds one level.

| Upgrade | Launches (Moon/Mars) | Cargo | Effect per level |
|---|---|---|---|
| 🫧 Habitat dome | 1 / 2 | 40 steel, 20 electronics, 200 fuel | −30% supply use (floor 10%) |
| 🧲 Mass driver | 1 / 2 | 40 steel, 30 electronics, 200 fuel | +50% ore on every return ship; Mars return leg −25% time |
| 🔬 Research lab | 1 / 2 | 40 electronics, 10 robots, 200 fuel | +100% research |
| 🗼 Defence turret | 1 / 2 | 40 steel, 2 armored vehicles, 200 fuel | +20 defence |

## Crews and tourists

| Number | Value |
|---|---|
| Crew rotation | ×1.5 ore and research for 180 days (6 game months) after landing |
| Tourist flight | pays level × $5M (Moon) or level × $15M (Mars) on landing |
| Tourists per flight | level × 10 (counted in "Space tourists flown") |
| Achievement / goal | **Space tourism**: fly 100 tourists (goal pays $25M) |

## Agency colonies

| Number | Value |
|---|---|
| Sites ever claimed | about half (fixed by a hash of the site) |
| First claim | Moon: day 20–160, Mars: day 120–400 after 1 Jan 2026 (1 day = 1 real hour) |
| Level | 1 + one per 60 days held, max 4 |
| Defence | 10 × level + 20 |
| Taking one | assault strength must beat the defence; no war needed. You get a colony at the agency's level with 30 days of supply, the attackers as garrison and no ore |

Every player computes the same agency claims from the shared clock. A real colony on a site always replaces the agency's claim.

## Space broker and Ore exchange

| Number | Value |
|---|---|
| Space broker | buys any space ore in your spaceport depots at 85% of the government price, in any city |
| Exchange price range | 50% to 200% of the government price per unit |
| Exchange fee | 5% of the sale, paid by the seller |
| Lot size | 1 to 100,000 units; at most 10 lots at once |

Selling: pick an ore in one of your spaceport depots, the units and a price. The ore leaves the depot and waits in your save until it sells or you cancel (cancel returns the unsold units). Buying needs sign-in, cash up front and a depot (any city with a warehouse); the ore lands there straight away. The seller's game collects the money the next time it is online. You can hold only one uncollected purchase per lot at a time.

## Defence and war rules

- The colony document stores **full** defence. Anyone attacking compares against that, halved if the colony's own stored supply has run out, so an offline owner's colony keeps full defence while supplied.
- Founding, inheriting and conquering a colony all need your public profile to say you govern that country (the game publishes it first).
- When someone launches an assault at one of your country's colonies you get an alert, a news item and a red banner in the Colonies tab and the phone's Space app.
- News reports colonies being founded, conquered and levelled up.
- The globe shows a small 🌙/🔴 badge with colony counts next to each colony-holding country's capital (Settings › Display › Colony badges; tap the badge for the list).

## Space manager

Top of the Colonies tab: **🤖 Space manager**. Turn it on and the only thing left to do is keep your spaceports producing orbital launches. Every 20 seconds (and during offline catch-up) it:

1. **Auto-sell** (off by default): sells any ore stack over 20 units in a spaceport depot to the Space broker.
2. **Stock**: tops up medicine, bread and fuel for the next 2 crew + 2 supply runs per colony (capped at 6 colonies). It stocks the preferred hub, or every spaceport with a launch ready when no hub is set. It buys at that city's market price +10%. If the city can't sell the good, it buys at the nearest other depot city's price +25% ("space freight", no vehicles).
3. **Crew**: sends a crew rotation to every colony whose crew time left is under the one-way flight time + 1 day.
4. **Supply**: flies a supply run to any colony under 15 days (each colony's own auto-supply still works too).

It never spends below the cash reserve, sends at most 6 missions per check, waits for the Mars window, and never founds, expands, builds, assaults or flies tourists. It only runs while you hold office and have Lunar outpost. With no launches ready it does nothing and says so. The card shows a status (Running / Waiting for launches / Out of cash reserve / Off), the settings and the last 20 log lines. The phone's Space app shows "Space manager ON · last: …".

| Number | Value |
|---|---|
| Check interval | 20 s |
| Stock target | 2 × (crew + supply cargo) × colonies (max 6) |
| Handling fee | +10% of the market price |
| Space freight (other city) | +25% of that city's price |
| Auto-sell threshold | stacks over 20 units |
| Default cash reserve | $10M |
| Missions per check | 6 max |
