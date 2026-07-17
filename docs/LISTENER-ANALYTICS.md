# Aggregate Icecast listener analytics

This subsystem samples only mount-level counters exposed by Icecast. It does not read access logs and does not collect listener-level records.

## Architecture

```text
Icecast status-json.xsl
        │ every 60 seconds
        ▼
sample-listener-analytics.py
        │ aggregate snapshot, SQLite WAL
        ▼
data/analytics.sqlite3
        │ read-only aggregation
        ▼
generate-listener-analytics.py
        │ atomic replace
        ▼
/stats/listener-analytics.json
```

The configured Liquidsoap output identifies the real mount as `/strange-waves.mp3`. Mount selection compares the URL path in each Icecast `listenurl`, including when `icestats.source` is an array.

## SQLite schema

`listener_snapshots` stores:

- `sampled_at`: second-resolution UTC ISO-8601 timestamp;
- `mount`: normalized mount path;
- `listeners`: current aggregate connections, nullable when unknown;
- `listener_peak_source`: Icecast source-lifetime peak, not a period peak;
- `bitrate_kbps` and `source_format`;
- `server_up`, `source_up`, and an aggregate `error_code`;
- a uniqueness constraint on `(sampled_at, mount)` and an index on `sampled_at`.

SQLite uses WAL, a five-second busy timeout, constraints, and transactional upserts. A duplicate invocation for the same UTC second and mount updates one row instead of creating two.

## Errors and unknown values

Errors are valid health snapshots and return success to systemd after they are stored. Possible codes include `timeout`, `connection_error`, `http_<status>`, `invalid_json`, `invalid_payload`, and `missing_mount`.

Unknown audience values are always `NULL`, never a fabricated zero. Zero is stored only when Icecast explicitly reports `listeners: 0` for the selected active mount.

## Aggregates

The JSON generator provides current listeners, 24-hour and seven-day peaks, 24-hour time-weighted average, estimated listener-hours, fixed-bucket series, coverage, missing samples, freshness, bitrate, format, and source health.

Estimated listener-hours use:

```text
sum(listeners × duration until the next consecutive valid sample)
```

Only positive gaps of at most 150 seconds are integrated. Invalid snapshots and longer gaps break integration instead of filling missing time. Average concurrent listeners is listener-seconds divided by the observed valid duration. Listener-hours are an aggregate estimate and are **not listening sessions**.

The 24-hour series uses five-minute buckets; the seven-day series uses hourly buckets. Empty buckets contain `listeners: null`.

The public JSON is created as mode `0644`. Generation fsyncs the temporary file, atomically replaces the target, and then fsyncs the containing directory. The analytics preview reads only `/stats/listener-analytics.json`. `tests/fixtures/listener-analytics-preview.json` is development-only and is never an automatic fallback.

## Privacy

The schema and scripts contain no listener IP addresses, user-agents, cookies, fingerprints, referrers, listener hostnames, session IDs, or individual identifiers. The sampler requests the local JSON status endpoint and never scrapes HTML or reads Icecast access logs.

These metrics describe concurrent stream connections, not unique people.

## Proposed schedule

The versioned `mdk-listener-analytics.service` and `.timer` run a oneshot pipeline at second zero of every minute. systemd does not overlap an already active oneshot unit, and `flock --nonblock` provides an additional process lock. The service and timer are proposals only; they are not installed or enabled by this work.

## Manual operation

Sample once into a non-production database:

```bash
bin/sample-listener-analytics.py --database /tmp/mdk-analytics.sqlite3
```

Generate a non-production JSON file:

```bash
bin/generate-listener-analytics.py \
  --database /tmp/mdk-analytics.sqlite3 \
  --output /tmp/listener-analytics.json
```

## Retention

Raw snapshots are initially retained for 90 days. Purge is intentionally **not scheduled** yet. Run maintenance manually only after inspecting the database and backup policy:

```bash
bin/sample-listener-analytics.py \
  --database /opt/swr-radio/data/analytics.sqlite3 \
  --purge-days 90
```

An explicit UTC cutoff is also supported with `--purge-older-than 2026-04-18T00:00:00Z`.
