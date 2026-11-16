import json, os
import requests

def fetch_monthly_temp(lat, lon, start_year, end_year):
    path = os.path.join("data", f"monthly_{lat}_{lon}_{start_year}_{end_year}.json")
    if os.path.exists(path): return tuple(json.load(open(path)))
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M&community=RE&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"
    d = requests.get(url, timeout=60).json()["properties"]["parameter"]["T2M"]; xs, ys = [], []
    for k in sorted(d):
        if k.endswith("13") or d[k] == -999: continue
        xs.append(int(k[:4]) + (int(k[4:]) - 0.5) / 12); ys.append(d[k])
    os.makedirs("data", exist_ok=True); json.dump([xs, ys], open(path, "w")); return xs, ys
