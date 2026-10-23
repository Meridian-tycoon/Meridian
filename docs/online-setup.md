# Turning on online players (Firebase)

Until you do this, the game stays fully offline: `FIREBASE_CONFIG` in `index.html` is `null`, so nothing loads and no online UI shows.

1. Go to https://console.firebase.google.com, click **Add project**, name it (e.g. `meridian-tycoon`). Google Analytics is optional (you can turn it off).
2. On the project overview click the **web icon `</>`** ("Add app"), nickname it `Meridian`, leave Hosting unticked, click **Register app**. Copy the `firebaseConfig = { ... }` object it shows.
3. **Build → Authentication → Get started → Sign-in method**: enable **Email/Password**, then enable **Google** (pick a support email, Save).
4. Still in Authentication: **Settings → Authorized domains → Add domain** → `vanzdub.github.io`.
5. **Build → Firestore Database → Create database** → choose a location near your players → start in **production mode**.
6. In Firestore open the **Rules** tab, replace everything with the contents of `firestore.rules` from this repo, click **Publish**.
7. In `index.html`, near the top of the script, replace
   `const FIREBASE_CONFIG=null;`
   with
   `const FIREBASE_CONFIG={apiKey:"...",authDomain:"...",projectId:"...",storageBucket:"...",messagingSenderId:"...",appId:"..."};`
   (the object from step 2). These values are public by design; the rules protect the data.
8. Commit and push. On the site open **Empire** (the portfolio screen) → **Online** section → create an account. Others appear on the globe as small coloured diamonds next to their home/HQ cities; tap a city to see "Players here". A pulsing ring marks the city a player is in right now (public profile field `loc`, in-game only).

**Re-publish the rules** after updating to the live-location version: Firestore → **Rules** → paste the current `firestore.rules` → **Publish**. Until then, profile publishing is rejected (`loc` is a new allowed field).

Listing players sorts on one field (`lastSeen`), so no custom index is needed.

## Cloud saves (sign in on other devices)

Signed-in players' saves are also stored privately in Firestore at `saves/{uid}` (large saves spill into `saves/{uid}/parts/{n}`). Only the owner can read or write them.

**You must re-publish the rules** after this update: Firestore → **Rules** tab → replace everything with the current `firestore.rules` from this repo → **Publish**. Until you do, cloud saving shows "Cloud save failed: permission-denied" in the Online section and the game keeps working from the local save.

## Money transfers

Signed-in players can send cash to each other from the Bank app on the phone ($1 to $1,000,000 per transfer). Each transfer is a `transfers/{id}` document that the recipient's game credits and then deletes. This needs the `match /transfers/{id}` block in `firestore.rules`: **re-publish the rules** (Firebase console → Firestore → Rules, paste `firestore.rules`, Publish), otherwise sends fail and the sender is refunded. Saves are client-side, so this is not cheat-proof.

The rules require `amt` to be a whole number (`amt is int`, 1 to 1,000,000); the game always sends whole dollars. If cheating ever becomes a problem, the next step is a server-side check: a Cloud Function (needs the paid Blaze plan) that validates each new transfer against a per-sender rate limit (e.g. N transfers / $ per hour) and a server-held balance, deleting or flagging bad ones. Not built yet. Whenever `firestore.rules` changes, re-publish it.

## Shared live leaderboard and world rivals

The Empire → **Leaderboard** is now one shared board: every signed-in save publishes its profile to `players/{uid}` (name, colour, net worth `nw`, businesses `nb`, cities `nc`, `lastSeen`) on every save (throttled to once a minute) and every 15 s tick, and the board ranks all players plus the 8 rivals by net worth via live `onSnapshot` listeners. Offline it shows the last cached copy (labelled "offline · last saved").

Rivals are one shared world: only the developer's save (uid `BRGRStgYLlbkVbrBTagBrDbpVyg1`, listed in `DEV_UIDS`) grows rivals and writes them to the new document `world/rivals` (`{list:[{nw,cities}] x8, updated}`). Every other save mirrors that document and skips its own rival growth.

Console steps:
1. **Re-publish the rules**: Firestore → **Rules** → paste the current `firestore.rules` → **Publish**. Until then profile writes fail (new fields `nb`, `nc`) and `world/rivals` cannot be written.
2. Nothing to create by hand: the `world` collection and `rivals` document appear the first time the developer signs in on the master save. To check, open Firestore → **Data** → `world` → `rivals`.
3. No new index is needed.

## Bot company "Meridian Freight"

A rule-based company (not an AI) that shows on every globe and on the shared leaderboard with a **BOT** badge. Like the world rivals it is simulated only on the master save (the developer's, `DEV_UIDS`), which stores its state in its own save (`S.botw`) and publishes `world/bot` (name, colour, net worth, trucks, cities, goods stock and prices). Everyone else just mirrors that document.

Players use it from the Bank app (phone): **Buy goods** (bot sells at 120% of base price), **Sell goods** (bot pays 80%) and **Hire truck** (haul goods between your own warehouses on one landmass, fee = $300 + $0.10 per tonne-km, max 120 t). Money and goods are taken from the player first and a request is created in `botreq/{id}`. The master's game (while open and signed in) answers each one with `botres/{id}` and deletes the request in one batch; the player's game credits cash/goods once (deduped by id) and deletes the reply. Rejected requests (no stock, no free trucks, bot out of cash, price moved more than 5%) refund everything. Deliveries and hauls take time (distance / 400 km per day, a quarter of that, min 2 min). If the master is not online, requests simply wait (the Bank app says "processed when the world server is online") and the bot looks greyed out on the board after a week.

**Mark must re-publish the rules** (Firebase console → Firestore → Rules → paste `firestore.rules` → Publish) for the new `world/bot`, `botreq` and `botres` blocks. Until then the bot never appears and bot requests fail with a refund. Nothing to create by hand: the collections appear on first use. No new index is needed. As with transfers, saves are client-side, so this is not cheat-proof; the master validates prices, capacity and amounts and processes each request id once.
