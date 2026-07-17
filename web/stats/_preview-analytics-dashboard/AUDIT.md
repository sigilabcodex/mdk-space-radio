# MDK Space Radio analytics preview — data audit

Audit snapshot: 2026-07-17 UTC. This preview is read-only and isolated from the generated production report.

## Sources inspected

| Source | What exists today | Used in preview |
| --- | --- | --- |
| `data/play-history.sqlite3` | Catalog releases/tracks and idempotent track-start events. At snapshot: 965 plays, 733 distinct tracks, 148 releases; tracking begins 2026-07-12. No listener or connection rows. | Real broadcast-play rankings, recent track changes, chart markers. |
| Public `/stats/stats.json` and generated `/stats/index.html` | Five-minute static report with play totals, catalog coverage, droughts, album balance, recent 200 plays and repeat windows. | Real tracking range and report freshness. Production files were only read. |
| Public `/now-playing.json` | Current Icecast-derived status, current/lifetime-peak connections, bitrate, format, track/release metadata, progress and 12-entry transmission log. | Real header state, current connections, lifetime peak, Now Playing and recent transmissions. |
| `cache/transmission-log.json` | 12 latest track transitions with release links; mirrors the public payload. | Audited; public payload is the snapshot input. |
| `data/radio-manifest.json` / `catalog/radio-manifest.json` | 150 releases, 1,109 tracks, durations, catalog metadata and real cover URLs. | Real titles, releases, durations and cover provenance. |
| Public `/covers/` | Local high-resolution catalog covers. | Resized into small WebP preview assets; no synthetic artwork. |
| `bin/generate-play-report.py` | Reads SQLite and atomically writes production HTML/JSON; measures broadcast starts, coverage, drought and balance only. | Audited; not modified or executed against production output. |
| `bin/update-now-playing.py` | Reads Icecast `status-json.xsl`, resolves catalog metadata, maintains progress and a 12-item transmission log. | Explains live fields and their provenance. |
| Icecast `http://127.0.0.1:8000/status-json.xsl` | Configured endpoint in the updater and catalog deploy script. The aggregate JSON endpoint was verified directly for the new sampler. | Direct aggregate listener, bitrate, format and mount-health snapshots. |
| Service state | Direct `systemctl` access is unavailable inside the isolated sandbox. | Health uses fresh artifacts; Liquidsoap and consumer are labeled `inferred`, never asserted as direct service checks. |

## Real metrics available now

- Current stream connections and Icecast source lifetime peak.
- Current track, release, cover, elapsed/duration/progress, bitrate and format.
- Track-start events, total broadcast plays, distinct played tracks/releases and tracking interval.
- Broadcast-play rankings for tracks/releases.
- Recent transmissions and real track-change times.
- Freshness of now-playing, SQLite consumer output and generated report.
- Aggregate Icecast listener snapshots for `/strange-waves.mp3`, including period peaks, average concurrency, estimated listener-hours, bitrate and mount health. Initial preview coverage begins with the first sampler run on 2026-07-17.

These data do **not** identify unique people. “Listeners” in the live source is presented as current stream connections.

## Metrics that do not exist yet

The following are stored only in `demo-data.json` and every presentation is labeled `DEMO DATA`:

- Listening sessions and session-duration buckets.
- Web visits.
- Player starts.
- Per-release and per-track listening hours/session counts.

The production Icecast snapshot exposes a peak, but it is a source-lifetime peak rather than a period-filtered 24-hour peak. The KPI says so in its helper text.

## Graph semantics

- **Listeners over time:** real five-minute buckets from aggregate Icecast snapshots. Empty coverage remains a gap. Amber markers are sampled real play-history transitions in the last 24 hours; hover exposes track/time.
- **Top releases:** ordered by real committed broadcast starts. Bars encode those real starts. Purple sparklines, hours and sessions are demo.
- **Top tracks:** ordered by real committed broadcast starts. Listening minutes and sessions are demo; real play counts remain visible.
- **Session duration:** demo counts across the requested five duration buckets.
- **Recent activity:** real current connection snapshot plus real transmission changes. There is no historical connection-event or health-event log yet.
- **System health:** green `signal` means a direct fresh artifact; amber `inferred` means downstream output indicates the component recently worked.

Current listeners, 24-hour peak, average concurrent listeners and estimated listener-hours now come exclusively from the public `/stats/listener-analytics.json`. Listener-hours integrate listeners over consecutive valid sample durations and are not sessions. `tests/fixtures/listener-analytics-preview.json` is a development fixture with limited initial coverage; production code never requests it and there is no silent fallback.

## Future navigation map

1. **Overview** — fully developed in this preview.
2. **Live Signal** — concurrent connections, bitrate, mount status, source events.
3. **Listening** — sessions, hours, duration, retention once connection telemetry exists.
4. **Content** — release/track performance, rotation, catalog coverage and drought.
5. **Website** — visits, player starts and start failures once privacy-safe web analytics exists.
6. **System** — direct service checks, latency, errors and pipeline freshness.

## Rebuild

Run `python3 web/stats/_preview-analytics-dashboard/build-real-data.py` from the repository root. It reads existing sources and regenerates only this preview's `real-data.json` and small cover derivatives.
