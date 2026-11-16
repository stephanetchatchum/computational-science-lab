import json, os
import requests

def get_population(country_code):
    path = os.path.join("data", "pop.json")
    if os.path.exists(path): return [tuple(x) for x in json.load(open(path))]
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/SP.POP.TOTL?format=json&per_page=100"
    recs = requests.get(url).json()[1]; out = sorted((int(r["date"]), r["value"]) for r in recs if r["value"] is not None)
    os.makedirs("data", exist_ok=True); json.dump(out, open(path, "w")); return out
