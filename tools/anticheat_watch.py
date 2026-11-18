# Meridian anti-cheat watchdog: signs in as the bot account and lists suspects flagged by the Cloud Functions (acflags/{uid}).
# Needs env MERIDIAN_BOT_EMAIL / MERIDIAN_BOT_PASSWORD, and the bot's uid in Firestore config/anticheat.readers.
# Usage: python3 -I tools/anticheat_watch.py index.html [state.json]
# Prints JSON {at, total, open:[...], fresh:[...]} where fresh = flags newer than the last run (kept in state.json).
import json, os, re, sys, time, urllib.request
html = open(sys.argv[1] if len(sys.argv) > 1 else "index.html", encoding="utf8").read()
STATE = sys.argv[2] if len(sys.argv) > 2 else "anticheat-last.json"
K = [k for k in re.findall(r'apiKey *: *"([^"]+)"', html) if k.startswith("AIza")][0]
REF = "https://meridian-tycoon.github.io/Meridian/"
H = {"Content-Type": "application/json", "Referer": REF}
def post(u, d): return json.load(urllib.request.urlopen(urllib.request.Request(u, json.dumps(d).encode(), H)))
tok = post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + K,
           {"email": os.environ["MERIDIAN_BOT_EMAIL"], "password": os.environ["MERIDIAN_BOT_PASSWORD"], "returnSecureToken": True})["idToken"]
B = "https://firestore.googleapis.com/v1/projects/meridian-world-players/databases/(default)/documents/"
def get(p): return json.load(urllib.request.urlopen(urllib.request.Request(B + p, headers={"Authorization": "Bearer " + tok, "Referer": REF})))
def v(x):
    if not isinstance(x, dict): return x
    for k, y in x.items():
        if k == "mapValue": return {a: v(b) for a, b in y.get("fields", {}).items()}
        if k == "arrayValue": return [v(b) for b in y.get("values", [])]
        if k in ("integerValue", "doubleValue"): return float(y)
        return y
try: prev = json.load(open(STATE)).get("at", 0)
except Exception: prev = 0
docs = [{a: v(b) for a, b in d.get("fields", {}).items()} for d in get("acflags?pageSize=300").get("documents", [])]
now = time.time() * 1000
rows = []
for f in docs:
    w = (f.get("list") or [{}])[0]
    rows.append({"uid": f.get("uid"), "name": f.get("name") or "(no name)", "st": f.get("st", "new"), "n": int(f.get("n", 1)),
                 "last": f.get("last", 0), "why": w.get("why", ""), "src": w.get("src", "")})
rows.sort(key=lambda r: -r["last"])
out = {"at": now, "total": len(rows), "open": [r for r in rows if r["st"] == "new"], "fresh": [r for r in rows if r["last"] > prev and r["st"] != "ok"]}
json.dump({"at": now}, open(STATE, "w"))
print(json.dumps(out))
