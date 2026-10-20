# Meridian Tycoon to-do list

Shared work queue for the subagents in `.claude/agents/`.

Format: `- [ ] [agent-name] (priority, area) task`
- `agent-name`: the agent that should do it (`meridian-builder`, `meridian-reviewer`, `meridian-tester`, `meridian-release`, `meridian-balance`, `agent-manager`).
- `priority`: `high`, `med` or `low`. `area`: the part of the game or repo it touches.
- An agent with no specific task picks the first unticked item tagged with its name.
- When done, tick it `[x]` and append ` — done YYYY-MM-DD: one-line result`.
- Follow-ups go in as new unticked items, tagged with the agent that should do them.

## Items

- [x] [agent-manager] (high, Agents) Have agents work on the to-do list — done 2026-10-20: added TODO.md and a "To-do list" section to all four agents
- [x] [meridian-builder] (high, Businesses) Add a casino business that only opens in big cities — done 2026-10-20: Casino locked to the 10 size-5 cities, repriced to $6M base (2.2-day payback), rule enforced on buy and rent
- [x] [meridian-balance] (med, Economy) Work out payback time for every business and flag outliers — done 2026-10-20: docs/payback.md; most Lv1 paybacks are 20–45 game days, casino 52 (fine); outliers are big-city retail stock costs, small-city apartments, Lv4→5 upgrades and leases
- [ ] [meridian-balance] (high, Economy) Cut retail stock unit costs (SUP kiosk 1.3→1.0, shop 2.8→2.0, rest 13→8): size-5 restaurant payback 101→55 days (see docs/payback.md #1)
- [ ] [meridian-balance] (med, Economy) Tone down small-city apartment blocks (up 1900→2300, small-city bonus 1.25→1.1): 20.5→25.7 days in size 2 (docs/payback.md #2)
- [ ] [meridian-balance] (med, Economy) Flatten upgrade cost growth in upCost (1.6→1.4) so Lv4→5 isn't a trap (docs/payback.md #3)
- [ ] [meridian-balance] (med, Economy) Fix leases that lose money: RENT 1/40→1/60, or warn on the rent button when rent exceeds profit (docs/payback.md #4)
- [x] [meridian-tester] (med, Stocks & crypto) Check the stocks app for errors on a phone screen — done 2026-10-20: PASS at 390x844, 0 errors; all tabs/details, stock+crypto buy/sell/sell-all fees exact, live ticks keep view+scroll, CoinGecko empty-200 falls back to sim prices, old save without mkt2 loads
- [ ] [meridian-builder] (low, Stocks & crypto) Detail chart is blank on a fresh game until the first mktStep (10s) because sparkS needs 2+ points; seed m.h with two points in MK() or draw a flat line
- [ ] [meridian-builder] (low, Stocks & crypto) Portfolio header labels market value (holdVal) as "invested"; rename to "value" or show cost basis separately
- [ ] [meridian-builder] (low, Stocks & crypto) Phone Buy buttons use the dark --ink fill on the dark phone so their surface barely stands out, and 3-column qty buttons wrap unevenly ("Buy 100"/"Sell 10" on two lines); give phone .buy a lighter fill and nowrap. Also the Buy disabled check uses a 0.5% fee for stocks (fee is 0.1%)
- [x] [meridian-builder] (med, Businesses) refreshButtons() (5s tick on the Business tab) re-enables any Buy/Rent whose label has a $ price when cash is enough, so rows blocked by bizBlock (no HQ, gambling banned, no airport, seaport size<3) turn clickable again after ~5s; tapping enters placement and ends in a generic "Couldn't complete that purchase" (no state change). Skip buttons in rows with a bizBlock reason (e.g. mark them data-fixed). Small casino "Locked" button is unaffected but is very faint (white on grey at row opacity .6 × .32) — done 2026-10-20: retested; blocked Buy/Rent (no HQ, gambling ban, no airport site, small seaport, small-casino Locked) stay disabled through 2+ refresh cycles (data-fixed="1"); unblocked rows still toggle with cash in ~2.5–4.5s; casino.js no regressions; 0 errors at 390x844.
- [ ] [meridian-builder] (low, Code health) Rename block-scoped `const L` locals (index.html:1041, 1045, 1059 mLevel results; 1490 `for(const L of LANES)`; 1590 last point; 1793 `L=LAWS[k]`) to e.g. `lv`/`ln`/`law`; harmless today but they shadow Leaflet `L` and break the "never name anything L" rule meridian-reviewer checks
