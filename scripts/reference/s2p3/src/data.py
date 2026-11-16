import csv, json, os

def get_co2(country):
    import requests  # only needed when downloading
    path = os.path.join("data", f"co2_{country}.json")
    if os.path.exists(path): return [tuple(x) for x in json.load(open(path))]
    text = requests.get("https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv").text
    out = [(int(r["year"]), float(r["co2"])) for r in csv.DictReader(text.splitlines()) if r["country"] == country and r["co2"]]
    os.makedirs("data", exist_ok=True); json.dump(out, open(path, "w")); return out
