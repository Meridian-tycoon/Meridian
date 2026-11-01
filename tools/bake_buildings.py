#!/usr/bin/env python3
"""Download a city's buildings from OpenStreetMap (Overpass) and save them as
small tile files the game loads in street view instead of the map tiles.

Usage: python3 tools/bake_buildings.py montreal
Output: data/buildings/<city>/index.json and one <x>_<y>.json per tile.
Each tile: {"o":[lng,lat],"b":[[h,minh,dx0,dy0,dx1,dy1,...],...]}
where dx/dy are 1e-6 degree steps from o (about 10 cm)."""
import json, os, sys, time, urllib.request, urllib.parse

CITIES = {
    # name: (south, west, north, east) - Montreal island and the near shores
    "montreal": (45.40, -73.98, 45.71, -73.47),
}
TILE = 0.05  # degrees per tile side
SERVERS = ["https://overpass-api.de/api/interpreter",
           "https://overpass.kumi.systems/api/interpreter",
           "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]

def num(v):
    try:
        return float(str(v).split(";")[0].replace("m", "").strip())
    except Exception:
        return None

def height(tags):
    h = num(tags.get("height")) or num(tags.get("building:height"))
    if h is None:
        lv = num(tags.get("building:levels"))
        h = lv * 3.66 if lv else None
    mh = num(tags.get("min_height"))
    if mh is None:
        ml = num(tags.get("building:min_level"))
        mh = ml * 3.66 if ml else 0
    return (h or 8.0), (mh or 0.0)

def fetch(s, w, n, e):
    q = f'[out:json][timeout:180];(way["building"]({s},{w},{n},{e});way["building:part"]({s},{w},{n},{e}););out tags geom;'
    data = urllib.parse.urlencode({"data": q}).encode()
    for attempt in range(6):
        url = SERVERS[attempt % len(SERVERS)]
        try:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": "meridian-bake/1"})
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.load(r)["elements"]
        except Exception as ex:
            print("  retry", attempt, url, ex, flush=True)
            time.sleep(10 * (attempt + 1))
    raise SystemExit("Overpass failed for tile")

def main(city):
    s0, w0, n0, e0 = CITIES[city]
    out = os.path.join("data", "buildings", city)
    os.makedirs(out, exist_ok=True)
    tiles, total = [], 0
    nx = round((e0 - w0) / TILE); ny = round((n0 - s0) / TILE)
    for ix in range(nx):
        for iy in range(ny):
            w = w0 + ix * TILE; s = s0 + iy * TILE
            # take a building in the tile its first point falls in, so seams have no copies
            els = fetch(s, w, s + TILE, w + TILE)
            o = [round(w, 6), round(s, 6)]
            b = []
            for el in els:
                g = el.get("geometry")
                if not g or len(g) < 4:
                    continue
                p0 = g[0]
                if not (w <= p0["lon"] < w + TILE and s <= p0["lat"] < s + TILE):
                    continue
                tags = el.get("tags", {})
                # skip the outline when it has parts, the parts carry the real shape
                if "building" in tags and tags.get("building:part") is None and tags.get("has_parts") == "yes":
                    continue
                h, mh = height(tags)
                if h - mh < 1:
                    continue
                row = [round(h, 1), round(mh, 1)]
                for p in g:
                    row += [round((p["lon"] - o[0]) * 1e6), round((p["lat"] - o[1]) * 1e6)]
                b.append(row)
            name = f"{ix}_{iy}.json"
            with open(os.path.join(out, name), "w") as f:
                json.dump({"o": o, "b": b}, f, separators=(",", ":"))
            tiles.append({"f": name, "w": round(w, 6), "s": round(s, 6), "n": len(b)})
            total += len(b)
            print(f"tile {name}: {len(b)} buildings", flush=True)
            time.sleep(2)
    with open(os.path.join(out, "index.json"), "w") as f:
        json.dump({"city": city, "bbox": [w0, s0, e0, n0], "tile": TILE, "count": total,
                   "baked": time.strftime("%Y-%m-%d"), "tiles": tiles}, f, separators=(",", ":"))
    print("total", total)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "montreal")
