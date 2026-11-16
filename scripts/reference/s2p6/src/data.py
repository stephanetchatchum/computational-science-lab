import json, os

def mauna_loa():
    import requests  # only needed when downloading
    path = os.path.join("data", "co2_mm_mlo.json")
    if os.path.exists(path): return tuple(json.load(open(path)))
    lines = [l for l in requests.get("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv").text.splitlines() if l and not l.startswith("#")]
    head = lines[0].split(","); i_d, i_a = head.index("decimal date"), head.index("average"); t, c = [], []
    for l in lines[1:]:
        p = l.split(",")
        if float(p[i_a]) > 0: t.append(float(p[i_d])); c.append(float(p[i_a]))
    os.makedirs("data", exist_ok=True); json.dump([t, c], open(path, "w")); return t, c
