# What's missing? (scout, 2026-10-24)

Compared Meridian Tycoon with: AdVenture Capitalist (idle), Capitalism Lab (business sim), OpenTTD / Transport Tycoon (map tycoon), Rise of Industry (production tycoon), Two Point Hospital (management sim, achievements/onboarding), Supremacy 1914 / map strategy (session goals).
No earlier docs/scout reports existed.

Already in Meridian (not gaps): goals with cash rewards (`GOALS`/`checkGoals`), research tree, managers per city (`S.mgr`), leaderboard, net-worth chart (`S.hist`/`spark`), offline catch-up logs, loans/bank, stocks & crypto, wars/diplomacy, rivals.

| Feature | Game | Meridian has it? (grep) | Effort | Value |
|---|---|---|---|---|
| Prestige / "new venture" reset with permanent bonus | AdVenture Capitalist (angel investors) | No — 0 hits `prestige`, no rebirth system | M | High (late-game retention) |
| Achievements / badges beyond one-off goals | Two Point Hospital, Steam games | No — 0 hits `achiev` | S | High |
| Natural disasters + business insurance | OpenTTD (disasters), Capitalism Lab | No — 0 hits `disaster`/`earthquake`/`insur` | M | High (risk + money sink) |
| Marketing / ad campaigns per city or brand | Capitalism Lab (advertising, brand loyalty) | No — 0 hits `advert`/`marketing` | M | Med-High |
| Guided first-run tutorial | Two Point Hospital, Rise of Industry | Partial — one "Start here" hint line (index.html:1252), 0 hits `tutorial` | M | High (new-player drop-off) |
| "While you were away" summary card | AdVenture Capitalist | Partial — separate log lines only (1358, 1487) | S | Med |
| Seasonal demand (holidays, tourism season) | Rise of Industry, Capitalism Lab | Barely — 3 hits `seasonal/holiday`, no demand curve | M | Med |
| Buying out rival companies (M&A) | Capitalism Lab | Partial — takeover only as news flavour | L | Med |

## Top 5
1. **Prestige "New Venture"** — retire your empire for permanent Legacy points that boost income next run; gives the late game a purpose. (M, meridian-economy)
2. **Achievements** — 30–50 badges (first casino, 10 countries, survive a war…) on a trophy page, saved in `S.ach`. (S, meridian-builder)
3. **Disasters + insurance** — rare quakes/storms/floods damage businesses in a city; optional insurance premium per business softens them. (M, meridian-events)
4. **Guided tutorial** — 6–8 step first-run walkthrough (home → job → first business → upgrade → manager), skippable. (M, meridian-designer)
5. **Marketing campaigns** — pay for a timed city or global ad push that lifts revenue %, with diminishing returns. (M, meridian-economy)

## Sources
- AdVenture Capitalist: https://toucharcade.com/games/adventure-capitalist , https://adventure-capitalist.fandom.com/wiki/Angel_Investors
- Capitalism Lab: https://www.capitalismlab.com/ , https://www.enlight.com/capitalism2/
- OpenTTD disasters: https://wiki.openttd.org/en/Manual/Disasters
- Rise of Industry: https://store.steampowered.com/app/671440/Rise_of_Industry/
- Two Point Hospital: https://store.steampowered.com/app/535930/Two_Point_Hospital/
