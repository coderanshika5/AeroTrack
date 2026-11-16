# Benchmark worksheet

Record the test environment, dataset size, sample count, and command for each benchmark.

| Test | Before | After | Notes |
|---|---:|---:|---|
| GET /api/aircraft p95 latency | TBD | TBD | Measure with autocannon or k6 |
| GET /api/aircraft/:icao24/history p95 | TBD | TBD | Measure indexed queries |
| Cache hit rate | TBD | TBD | Instrument Redis counters |
| Ingestion success rate | TBD | TBD | Inspect /api/analytics/ingestion |

Do not invent benchmark values for a resume.
