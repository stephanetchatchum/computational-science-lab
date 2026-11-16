import io, os, zipfile

def get_towns(country_code, how_many):
    import requests  # only needed when downloading
    path = os.path.join("data", "cities15000.txt")
    if not os.path.exists(path):
        content = requests.get("https://download.geonames.org/export/dump/cities15000.zip").content
        os.makedirs("data", exist_ok=True); open(path, "w", encoding="utf-8").write(zipfile.ZipFile(io.BytesIO(content)).read("cities15000.txt").decode("utf-8"))
    rows = [l.split("\t") for l in open(path, encoding="utf-8")]
    out = sorted(((r[1], float(r[4]), float(r[5]), int(r[14])) for r in rows if r[8] == country_code), key=lambda t: -t[3])
    return out[:how_many]
