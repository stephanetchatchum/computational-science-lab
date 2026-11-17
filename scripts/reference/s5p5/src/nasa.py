import json, os

def fetch_daily(lat, lon, start, end):
    import requests  # only needed when downloading
    path = os.path.join("data", f"daily_{lat}_{lon}_{start}_{end}.json")
    if os.path.exists(path): return json.load(open(path))
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=RE&longitude={lon}&latitude={lat}&start={start}&end={end}&format=JSON"
    par = requests.get(url, timeout=60).json()["properties"]["parameter"]; out = {}
    for key, d in par.items():
        vals = []; last = None
        for day in sorted(d.keys()):
            v = d[day]
            if v == -999: v = last
            vals.append(v); last = v
        out[key] = vals
    os.makedirs("data", exist_ok=True); json.dump(out, open(path, "w")); return out
