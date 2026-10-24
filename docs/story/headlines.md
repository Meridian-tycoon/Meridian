# Headline table by fault line and tension stage

Paste-ready wire headlines. Stages follow `WFCFG.stages` (`wfStage`): **Calm** 0-24, **Tense** 25-49,
**Hostile** 50-79, **Brink** 80-99, then **War start** when `wfBreak` fires (or `w.l==4`). Prefix with
`Day {day}: ` as `dipSay` does. Placeholders: `{A}` `{B}` the two countries (A = the side with more
funding, `fav`), `{capA}` `{capB}` = `cap(n).name`, `{amt}` = `fmt(amt)`, `{co}` company name,
`{city}` a city name, `{fav}` `{oth}` as in `wfBreak`. Names from [cast.md](cast.md). Keep one cast name
per line. Never invent amounts; `{amt}` always comes from game state.

How to wire: pick the fault line from the pair (see [world.md](world.md) "How to use this"), then the row for
the stage. Rows with `|` give 2-3 variants; choose at random. Every war-start row ends with a Ledger tail:
`" Funds cleared by the Notary."` (optional).

## 1. Northern Line: USA - Canada
| Stage | Headlines |
|---|---|
| Calm | Cross-border trade steady as {A} and {B} extend the lumber truce \| Sasha Kovalenko: "Vancouver is open for business" |
| Tense | {B} taxes cloud traffic; Ruth Calloway calls Amazon "a company with a country attached" \| Mark Dev recalls trade envoy from {capA} |
| Hostile | {A}-{B} talks collapse in {capB}; truckers block the border at {city} \| Dale Pruett: Walmart shelves "at risk" if the Data Act stays |
| Brink | Reservists called up on both sides of the 49th parallel \| Doug Tremblay: "Not one more tariff" as {capA} masses on the border |
| War start | Unthinkable: {fav} and {oth} at war after a surge of anonymous funding |

## 2. Yellow Sea Triangle: China - South Korea - Japan
| Stage | Headlines |
|---|---|
| Calm | Kestrel Shoal memorial held in {capA}; ferries run normally \| Benedikt Sauer: yen, yuan and won move in lockstep |
| Tense | Hideaki Morosawa: "We do not forget eleven names" \| Park Ji-hwan urges calm as {A} and {B} swap ambassadors' protests |
| Hostile | Boat rammed off Kestrel Shoal; {A} and {B} blame each other \| Lin Shoumei: "Our waters, our laws"; Seoul closes its airspace |
| Brink | {A} mobilises reservists, {B} carrier group leaves Qingdao \| Talia Okonjo, Busan: "Streets are empty, ports are not" |
| War start | War in the Yellow Sea: {fav} and {oth} exchange fire after anonymous money surges. Toyota halts Tokyo lines |

## 3. Gulf Ledger: Saudi Arabia - UAE - Iraq - India
| Stage | Headlines |
|---|---|
| Calm | Oil quotas hold for now; Faisal al-Qadri and Noor bint Rashed pose in {capA} \| Shell traders stay long on Brent |
| Tense | {A} undercuts {B} on crude again; Hassan Kirkuki "listens to both" |
| Hostile | OPEC-style talks fail in Istanbul; Kerem Aydınlı offers a new round \| Pipeline row: India quietly funds a bypass |
| Brink | {A} moves armour toward the {B} border; tankers wait off Fujairah \| Sir Alistair Penrose denies Shell money is behind the build-up |
| War start | Gulf war: {fav} and {oth} clash; Brent jumps, Lars Vinding reroutes the fleet |

## 4. Channel Rivalry: UK - France - Germany - Poland
| Stage | Headlines |
|---|---|
| Calm | London and Paris squabble over a bank licence, nothing more \| Gas flows normally through the Baltic pipeline |
| Tense | Clare Ashdown recalls envoy; Étienne Marchais: "Paris will not be lectured" \| Ewa Kowalczyk accuses Matthias Brandl of pipeline "games" |
| Hostile | {A}-{B} fishing and port talks collapse; Claudine Vautrin: "Nestlé has no comment" \| Dominic Faulke demands a Channel blockade |
| Brink | Nuclear powers {A} and {B} on alert; Solène Darrieux calls for a general strike |
| War start | Europe at war: {fav} and {oth} exchange fire. Kerem Aydınlı calls for talks |

## 5. Bosporus Hinge: Türkiye and neighbours
| Stage | Headlines |
|---|---|
| Calm | Istanbul hosts yet another conference; Ambassador Yusuf Demirel smiles for the cameras |
| Tense | Drone sales to {B} anger {A}; Selin Oztürkmen demands an inquiry |
| Hostile | {A} suspends talks hosted in Istanbul; Demirel flies shuttle to {capB} |
| Brink | Turkish drones spotted on both sides of the {A}-{B} line |
| War start | {fav} and {oth} at war; Istanbul offers to host the ceasefire talks "the moment anyone asks" |

## 6. Southern Cone: Brazil - Argentina - Chile
| Stage | Headlines |
|---|---|
| Calm | River Plate grain barges move again; Lívia Montenegro predicts a good soy year |
| Tense | Rodrigo Bastião: "The Cone is ours"; Mariela Quiroga closes another port to {B} steel |
| Hostile | Grain dispute turns to ban: {A} and {B} expel ambassadors; Chile sells copper to both |
| Brink | {A} troops mass on the River Plate; Walmart warns of empty shelves in {capB} |
| War start | South America at war: {fav} advances on {oth}'s grain belt |

## 7. Copper Belt: DR Congo - Kenya - South Africa - Nigeria
| Stage | Headlines |
|---|---|
| Calm | Cobalt prices steady; Joseph-Désiré Mbala signs another supply deal |
| Tense | {A} accuses {B} of smuggling cobalt through Lubumbashi |
| Hostile | Mine seized at Kolwezi; Dr Amara Nwosu counts new arrivals at Nairobi camps |
| Brink | Mercenaries cross the {A}-{B} border; every battery maker watches the price |
| War start | War over the Copper Belt: {fav} moves on {oth}. Apple's Mina Castell flies to {capA} |

## 8. Side stories
| Fault line | Tense | Hostile | War start |
|---|---|---|---|
| Malacca Straits (Singapore, Indonesia, Thailand) | Toll hike on the lane; Maersk "reviewing routes" | {A} detains a tanker; Lars Vinding raises rates | Straits closed: {fav} and {oth} at war, ships detour via Lombok |
| Tasman (Australia - New Zealand) | Sheep tariff: Kieran Walsh vs Hana Te Rangi | Both ambassadors recalled; "this is not a joke anymore" | Tasman war: {fav} and {oth} exchange fire, farmers fume |
| Generic fallback | Old wounds: {A} recalls its ambassador from {capB} | {A}-{B} talks collapse; markets slide | War between {fav} and {oth} after a surge of anonymous funding |

## WARL rows (any fault line)
| Trigger | Headline |
|---|---|
| `w.l==2` Sanctions | {A} sanctions {B}: {good} exports blocked (good = grain, oil, chips, fish, steel, cobalt per fault line) |
| `w.l==3` Border clashes | Shots on the {A}-{B} border; {C} sends troops to back {A} |
| `w.l==4` War | War. {A}'s leader: "We did not choose this." (use Leader from cast.md) |
| Peace / ceasefire | Ceasefire signed in Istanbul; {A} and {B} agree a {n}-day truce |
| Conquest | {A} takes control of {B}; Meridian Wire: "the map has changed" |
| Liberation | {B} is free again; crowds in {capB} |
| Leak (rare) | The Counting House: "{amt} reached {fav} through the Notary before the war" |

## Paste shape
```js
const FL_NEWS={ "China|Japan|South Korea":{calm:[...],tense:[...],hostile:[...],brink:[...],war:[...]}, ... };
// pick: FL_NEWS[faultKey(a,b)||"generic"][stageKey].; fill {A} {B} {capA} {capB} {fav} {oth} {amt} {city} by replace(/\{(\w+)\}/g,...)
```
