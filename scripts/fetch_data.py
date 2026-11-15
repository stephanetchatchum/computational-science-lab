"""Download backup copies of every third-party dataset the build guides use (audit item A3).

Runs on GitHub's servers via .github/workflows/data-snapshots.yml (monthly, or by hand), because
those servers can reach NASA, the World Bank, disease.sh and Open Topo Data. Each file is stored in
data/snapshots/ with its source URL, download time, size and SHA-256 in data/snapshots/manifest.json.
Standard library only.  Usage: python3 scripts/fetch_data.py [--only NAME]
"""
import hashlib, json, os, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'snapshots')
POWER = 'https://power.larc.nasa.gov/api/temporal'

def power_daily(lat, lon, start, end):
    return f'{POWER}/daily/point?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=RE&longitude={lon}&latitude={lat}&start={start}&end={end}&format=JSON'
def power_monthly(param, lat, lon, y1, y2):
    return f'{POWER}/monthly/point?parameters={param}&community=RE&longitude={lon}&latitude={lat}&start={y1}&end={y2}&format=JSON'

# name -> (url or list of urls, used by, note)
SOURCES = {
    'nasa_power_daily_kigali_2023.json': (power_daily(-1.94, 30.06, 20230101, 20231231), 's0p4', 'Kigali, Rwanda — the guide example'),
    'nasa_power_monthly_T2M_nairobi_1991_2023.json': (power_monthly('T2M', -1.29, 36.82, 1991, 2023), 's1p1', 'Nairobi, Kenya — the guide example'),
    'worldbank_RWA_population.json': ('https://api.worldbank.org/v2/country/RWA/indicator/SP.POP.TOTL?format=json&per_page=100', 's0p3', 'Rwanda total population'),
    'worldbank_KEN_cereal_yield.json': ('https://api.worldbank.org/v2/country/KEN/indicator/AG.YLD.CREL.KG?format=json&per_page=100', 's5p5', 'Kenya cereal yield'),
    'disease_sh_rwanda_historical.json': ('https://disease.sh/v3/covid-19/historical/rwanda?lastdays=all', 's3p3', 'disease.sh is an unmaintained mirror; this copy is the fallback'),
    'owid_co2_data.csv': ('https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv', 's2p3', 'Our World in Data CO2'),
    'geonames_cities15000.zip': ('https://download.geonames.org/export/dump/cities15000.zip', 's2p5', 'GeoNames towns over 15 000 people'),
}
GRID_LATS = [-4, -2, 0, 2, 4, 6, 8, 10]
GRID_LONS = [30, 32, 34, 36, 38, 40, 42, 44]
DEM_BOX = (-1.97, -1.93, 30.03, 30.08, 60)   # lat0, lat1, lon0, lon1, points per side (s5p6)

def get(url, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'computational-science-lab data snapshot (GitHub Actions)'})
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError) as e:
            if k == tries - 1: raise
            print('  retry after', e); time.sleep(5 * (k + 1))

def save(name, data, url, used_by, note, manifest):
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f: f.write(data)
    manifest[name] = {'source': url, 'used_by': used_by, 'note': note, 'bytes': len(data),
                      'sha256': hashlib.sha256(data).hexdigest(), 'fetched_at': datetime.now(timezone.utc).isoformat(timespec='seconds')}
    print(f'  saved {name} ({len(data):,} bytes)')

def main():
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    os.makedirs(OUT, exist_ok=True)
    mpath = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(mpath)) if os.path.exists(mpath) else {}
    failures = []
    for name, (url, used_by, note) in SOURCES.items():
        if only and only != name: continue
        print('fetch', name)
        try: save(name, get(url), url, used_by, note, manifest)
        except Exception as e: failures.append((name, str(e))); print('  FAILED', e)
    name = 'nasa_power_monthly_PRECTOTCORR_grid64_1991_2023.json'
    if not only or only == name:
        print('fetch', name); grid = {}
        try:
            for lat in GRID_LATS:
                for lon in GRID_LONS:
                    grid[f'{lat},{lon}'] = json.loads(get(power_monthly('PRECTOTCORR', lat, lon, 1991, 2023)))
                    time.sleep(1)
            save(name, json.dumps(grid).encode(), power_monthly('PRECTOTCORR', 'LAT', 'LON', 1991, 2023), 's4p5', '8 x 8 grid used by the guide', manifest)
        except Exception as e: failures.append((name, str(e))); print('  FAILED', e)
    name = 'opentopodata_srtm30m_kigali_box.json'
    if not only or only == name:
        print('fetch', name)
        lat0, lat1, lon0, lon1, n = DEM_BOX
        pts = [(lat0 + (lat1 - lat0) * i / (n - 1), lon0 + (lon1 - lon0) * j / (n - 1)) for i in range(n) for j in range(n)]
        results = []
        try:
            for k in range(0, len(pts), 100):
                locs = '|'.join(f'{a:.6f},{b:.6f}' for a, b in pts[k:k + 100])
                results += json.loads(get(f'https://api.opentopodata.org/v1/srtm30m?locations={locs}'))['results']
                time.sleep(1.2)   # public API: at most 1 request per second
            save(name, json.dumps({'box': DEM_BOX, 'results': results}).encode(), 'https://api.opentopodata.org/v1/srtm30m?locations=LAT,LON', 's5p6', f'{n} x {n} elevation grid', manifest)
        except Exception as e: failures.append((name, str(e))); print('  FAILED', e)
    json.dump(manifest, open(mpath, 'w'), indent=2, sort_keys=True)
    if failures:
        print('\nSome downloads failed (older copies, if any, were kept):'); [print(' -', n, e) for n, e in failures]
        sys.exit(1 if len(failures) == len(SOURCES) + 2 else 0)

if __name__ == '__main__':
    main()
