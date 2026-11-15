# Data snapshots (audit item A3)

Backup copies of every third-party dataset the build guides download, so a project still works
when an API is down, rate-limited or gone. They are fetched on GitHub's servers by
`.github/workflows/data-snapshots.yml` (Actions tab → "Refresh data snapshots" → Run workflow),
and refreshed monthly. `manifest.json` records the source URL, time, size and SHA-256 of each file.

Use them from Python with the raw URL, for example:

```python
url = "https://raw.githubusercontent.com/<you>/computational-science-lab/main/data/snapshots/disease_sh_rwanda_historical.json"
```

The app shows the right links on each project's Build tab.
