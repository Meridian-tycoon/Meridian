# Playtest progress reports

Testers can opt in to send their progress to a Google Form. Every report becomes a row in a Google Sheet, so you can follow each tester over time. Nothing is sent until the form is set up below **and** the tester taps "Share my progress".

## What gets sent

Only the tester's chosen nickname, a random tester id, and game numbers: save slot, game day, cash, net worth, all-time earnings, cities, businesses, goals done, debt, why the report was sent (auto / manual / goal / new city / first loan), and a version tag. No email, IP list, device info or location is collected by the game. (Google sees the request like any web request.)

Reports go out every 3 game days, on milestones, and whenever the tester taps **Send progress now** in *Your empire → Playtesting*. Testers can switch it off there at any time.

## One-time setup (about 10 minutes)

1. Go to [forms.google.com](https://forms.google.com) and create a blank form called "Meridian playtest".
2. Add these **Short answer** questions, in this order (titles don't matter to the game, but these keep the sheet readable):
   Tester, Tester ID, Slot, Day, Cash, Net worth, Earned, Cities, Businesses, Goals, Debt, Event, Version.
   Leave them all **not required**.
3. In **Settings → Responses**, make sure "Collect email addresses" is **off** and "Limit to 1 response" is **off**.
4. In the **Responses** tab, click **Link to Sheets** to create the spreadsheet.
5. Find the field ids: click the **⋮** menu → **Get pre-filled link**, type something in every box (e.g. `x`), then **Get link → Copy link**. The link looks like
   `https://docs.google.com/forms/d/e/1FAIpQL.../viewform?usp=pp_url&entry.111=x&entry.222=x&...`
   Each `entry.NNN` is one field, in the same order as your questions.
6. Open `index.html`, find `const PLAYTEST=` and fill it in:
   - `form`: the same link up to `/viewform`, with `viewform` changed to `formResponse`, e.g. `https://docs.google.com/forms/d/e/1FAIpQL.../formResponse`
   - `f`: paste each `entry.NNN` next to its name (`tester`, `tid`, `slot`, `day`, `cash`, `networth`, `earned`, `cities`, `businesses`, `goals`, `debt`, `event`, `ver`). Fill in all of them: a field left empty is not sent.

   Or just send the pre-filled link to Claude and it will fill this in for you.
7. Ship it. Testers will see the opt-in card the next time they open the game.

## Before the form is set up

The Playtesting section still works: **Send progress now** copies a text summary that testers can paste to you in a message.
