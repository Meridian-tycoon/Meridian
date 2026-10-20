# Meridian Tycoon to-do list

Shared work queue for the subagents in `.claude/agents/`.

Format: `- [ ] [agent-name] (priority, area) task`
- `agent-name`: the agent that should do it (`meridian-builder`, `meridian-balance`, `meridian-tester`, `agent-manager`).
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
- [ ] [meridian-tester] (med, Stocks & crypto) Check the stocks app for errors on a phone screen
