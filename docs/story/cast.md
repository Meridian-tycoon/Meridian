# Meridian cast list

Recurring fictional characters for news, phone messages and events. One line each; keep spellings exact.
Real companies are used as in the game; every person here is invented. No real politicians or executives.
Background and fault lines: [world.md](world.md).

Leaders are written as "the face of" a country's politics. When an election changes the ruling party,
the **opposition** figure takes over as the Leader in text, and the old Leader becomes the opposition.

## Leaders and opposition

| Country | Leader at game start | Opposition voice |
|---|---|---|
| USA | **Ruth Calloway** (Workers' Party), union lawyer from Pittsburgh, "America pays its own bills first" | **Senator Grant Hollis** (Conservatives), Houston oilman's son |
| China | **Premier Lin Shoumei** (Workers' Party), engineer, speaks in five-year plans | **Wen Kaixuan**, reformist Shanghai mayor |
| India | **Prime Minister Arjun Raghunathan** (Workers' Party), never picks a side out loud | **Meera Satyanath**, Mumbai business lobbyist |
| Japan | **Prime Minister Hideaki Morosawa** (National Front), won on the Kestrel Shoal deaths | **Aiko Tanabe**, pacifist ex-diplomat |
| UK | **Prime Minister Clare Ashdown** (Liberal Alliance), walked out of the Halden Accords talks | **Dominic Faulke**, hard-line Channel MP |
| France | **President Étienne Marchais** (Conservatives), farmers' friend, Nestlé's ally | **Solène Darrieux**, Workers' Party firebrand from Marseille |
| Türkiye | **President Kerem Aydınlı** (Liberal Alliance), host of every peace conference | **Selin Oztürkmen**, drone-industry critic |
| Brazil | **President Rodrigo Bastião** (National Front), "the Cone is ours" | **Lívia Montenegro**, São Paulo economist |
| Canada | **Prime Minister Mark Dev** (Liberal Alliance), in office since day one, calm, courted Amazon | **Doug Tremblay**, prairie populist |
| Australia | **Prime Minister Kieran Walsh** (Liberal Alliance), "she'll be right" until the sheep tariff | — |
| New Zealand | **Prime Minister Hana Te Rangi** (Conservatives), unflappable | — |
| South Korea | **President Park Ji-hwan** (Workers' Party), caught between Tokyo and Shanghai | — |
| Saudi Arabia | **Crown Minister Faisal al-Qadri**, oil-quota hawk | — |
| UAE | **Sheikha Noor bint Rashed**, Dubai's dealmaker | — |
| Iraq | **Governor Hassan Kirkuki**, plays Riyadh against Dubai | — |
| Argentina | **President Mariela Quiroga** (Workers' Party), closed the ports to Brazilian steel | — |
| DR Congo | **President Joseph-Désiré Mbala**, sits on the cobalt everyone wants | — |
| Germany / Poland | **Chancellor Matthias Brandl** / **Prime Minister Ewa Kowalczyk**, the pipeline quarrel | — |

## Press

- **Meridian Wire**: the neutral wire service behind most headlines; signs off "— MW".
- **Talia Okonjo**, Meridian Wire war correspondent; always "reporting from" the front city.
- **Benedikt Sauer**, markets columnist; turns every war into a stock-price line.
- **"The Counting House"**, anonymous newsletter that tracks Quiet Ledger transfers; often right, never sourced.
- **Priya Lindqvist**, investigative reporter chasing the Ledger; may contact a player who donated.

## Company figures (fictional people at real companies)

- **Walmart**: **Dale Pruett**, head of global sourcing; tariff lobbyist with a folksy voice.
- **Amazon**: **Sasha Kovalenko**, VP of northern operations in Vancouver; "the company with a country attached".
- **Toyota**: **Kenji Hasegawa**, managing director; quietly funds Morosawa's campaigns.
- **Shell**: **Sir Alistair Penrose**, trading chief; first name the press links to the Ledger.
- **Apple**: **Mina Castell**, supply-chain chief; flies to any capital where a war threatens a factory.
- **Maersk**: **Lars Vinding**, head of fleet; reroutes ships, raises rates, shrugs.
- **JPMorgan Chase**: **Evelyn Marsh**, head of sovereign lending; lends to both sides.
- **Nestlé**: **Claudine Vautrin**, head of public affairs; denies everything with a smile.

## Rival CEOs (one per `RIVALS` company)

The public face of each company in news and feuds; the earlier "company figures" above are the executives who
phone or fight on the CEO's behalf. Feud phone messages use the voice figure; headlines about the company use the CEO.
Appearance codes: **N** news/world lines, **F** feud arc ([arc-rivalries.md](arc-rivalries.md)), **B** backer offers,
**W** wars ([arc-wars.md](arc-wars.md)).

| Company | CEO | Personality and voice | Catchphrase | Appears |
|---|---|---|---|---|
| Walmart | **Cal Brannigan** | Folksy, stubborn, counts pennies out loud; talks like a county-fair auctioneer | "Everyday low prices, every day." | N record quarters; F vs Amazon/Apple; B (rare) via Dale Pruett |
| Amazon | **Imogen Trask** | Precise, impatient, speaks in metrics and deadlines; never raises her voice | "Working backwards from the customer." | N cloud and Vancouver; F vs Walmart/Shell; W warehouse closures near fronts |
| Toyota | **Takeshi Aoyagi** | Formal, patient, bows in every sentence; hides a hard edge | "Kaizen: a little better each day." | N Tokyo lines; F Yellow Sea sparks; B via Kenji Hasegawa; W halts plants when Japan is at war |
| Shell | **Dame Philippa Wren** | Dry British understatement, never confirms anything | "No comment, which is itself a comment." | N Gulf and Channel; F vs Nestlé/Maersk; B via Sir Alistair Penrose (the Ledger suspect) |
| Apple | **Oliver Ostrander** | Calm, minimalist, speaks in single sentences; hates being asked about wars | "It just works. Until it doesn't." | N factory warnings; W "supply chain at risk" near fronts; F vs Walmart |
| Maersk | **Mette Haraldsen** | Weather-beaten, blunt Nordic humour; talks in tonnes and knots | "Ships do not take sides. Insurance does." | N detours and blockades; F vs Shell; W reroutes in straits wars |
| JPMorgan Chase | **Walter Kessler** | Silver-haired, soft-voiced, knows what you owe; courteous menace | "I lend to everyone. That's the point." | N bailouts and sovereign loans; F Yellow Sea link; W loans to both sides |
| Nestlé | **Henri Vautier** | Genial, shrewd, always has a statement ready; smiles through scandals | "Good food, good life, no further questions." | N war-profiteering stories; F vs Shell; B (rare, via Claudine Vautrin) |

## Ministers and generals of the major powers

Ministers speak at tension stage changes (`wfStage`) and WARL steps (`warHour`, `dipDay`); generals speak at
battle events (`wlDay` captures and holds), ally joins (`allyDay`), surrender and occupation. One line each.

| Power | Minister | Voice and catchphrase | General or admiral | Voice and catchphrase |
|---|---|---|---|---|
| USA | **Marcus Whitlock**, Defense Secretary (Workers' Party) | Union-hall plain; "We bring our people home on time." | **General Dana Reyes** | Clipped, tired, numbers first; "Hold the line, count the cost." |
| China | **Zhao Yilan**, Foreign Minister | Patient, five-year-plan metaphors; "History is long, and we have time." | **General Gao Wenbo** | Few words, never a first name; "The sea does not forget." |
| India | **Kavita Menon**, External Affairs Minister | Courteous refusal, never picks a side; "India chooses India." | **General Vikram Rathore** | Old-school, sentimental about the army; "We do not start, we finish." |
| Japan | **Shingo Kurata**, Defence Minister (National Front) | Hawkish, formal, speaks of "honour"; "We will not be small again." | **Admiral Noriko Hayakawa** | Quiet, precise, cautious; "The tide decides, not the speech." |
| UK | **Hugh Marlowe**, Foreign Secretary | Silky, dry, always "regrettably"; "Britain remains, regrettably, indispensable." | **General Sir Rupert Ainsley** | Old Etonian bark; "Steady, gentlemen." |
| France | **Camille Duvernay**, Foreign Minister | Elegant, theatrical, quotes poets; "La France ne se discute pas." | **General Bastien Roche** | Blunt, proud, sceptical of allies; "We carry our own flag." |
| Türkiye | **Berna Karaca**, Foreign Minister | Warm, brisk broker, drinks tea mid-sentence; "Sit down. We will find a table." | **General Orhan Tekin** | Gruff, proud of the drone fleet; "Air is cheaper than blood." |
| Brazil | **Tiago Valadares**, Defence Minister (National Front) | Loud, football metaphors; "We play at home, we play to win." | **General Ana Beatriz Lacerda** | Steady, ex-engineer, avoids speeches; "Supply first, glory later." |

**Usage rules**
- Use the minister for diplomacy lines (sanctions, ambassadors, talks) and the general for field lines (cities
  captured or held, allies, garrison, occupation). The Leader (above) speaks only for war declarations,
  surrender, conquest and peace signings.
- A minister or general belongs to the country's government, not the party: when `gov(n).party` flips at an
  election, keep the same minister and general but let the Leader line change (Leader table above).
- Generals appear as a named speaker at most once per war per 5 game days, so lines do not repeat.
- Backer offers (**B**) from governments are signed by the country's minister ("the office of Hugh Marlowe");
  company offers by the company figure above. Mr Gray still delivers both.

## The Quiet Ledger

- **The Quiet Ledger**: the press name for the anonymous donor network behind war and tension money.
- **"Mr Gray"**: the voice on backer-offer phone messages; polite, never gives a name or a country.
- **The Notary**: a Zurich-style escrow office that moves the money; only appears as "funds cleared by the Notary".
- **Ines Barros**, a defector from the Ledger who leaks one transfer at a time (future arc hook).

## Peacemakers

- **Ambassador Yusuf Demirel**, Türkiye's chief mediator; hosts talks in Istanbul.
- **Dr Amara Nwosu**, head of a relief agency in Nairobi; appears after every war.

## Street level (underground and cartels)

- **Rook**: the fixer who offers the player hustles; texts in lowercase.
- **Mama Ferreira**: runs the backroom casino circuit; knows every gang.
- **Inspector Haruto Lind**: international anti-cartel investigator; leads raids ordered by Leaders.
