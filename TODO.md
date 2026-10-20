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
- [ ] [meridian-builder] (high, Businesses) Add a casino business that only opens in big cities
- [ ] [meridian-balance] (med, Economy) Work out payback time for every business and flag outliers
- [ ] [meridian-tester] (med, Stocks & crypto) Check the stocks app for errors on a phone screen
