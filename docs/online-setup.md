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
8. Commit and push. On the site open **Empire** (the portfolio screen) → **Online** section → create an account. Others appear on the globe as small coloured diamonds next to their home/HQ cities; tap a city to see "Players here".

Listing players sorts on one field (`lastSeen`), so no custom index is needed.

## Cloud saves (sign in on other devices)

Signed-in players' saves are also stored privately in Firestore at `saves/{uid}` (large saves spill into `saves/{uid}/parts/{n}`). Only the owner can read or write them.

**You must re-publish the rules** after this update: Firestore → **Rules** tab → replace everything with the current `firestore.rules` from this repo → **Publish**. Until you do, cloud saving shows "Cloud save failed: permission-denied" in the Online section and the game keeps working from the local save.

## Money transfers

Signed-in players can send cash to each other from the Bank app on the phone ($1 to $1,000,000 per transfer). Each transfer is a `transfers/{id}` document that the recipient's game credits and then deletes. This needs the `match /transfers/{id}` block in `firestore.rules`: **re-publish the rules** (Firebase console → Firestore → Rules, paste `firestore.rules`, Publish), otherwise sends fail and the sender is refunded. Saves are client-side, so this is not cheat-proof.
