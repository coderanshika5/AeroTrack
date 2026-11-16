# Architecture

```mermaid
flowchart TD
  A[OpenSky API or Synthetic Demo] --> B[Scheduled Ingestion Worker]
  B --> C[Normalizer]
  C --> D[(PostgreSQL)]
  C --> E[(Redis)]
  E --> F[Express REST API]
  D --> F
  F --> G[React Dashboard]
  G --> H[Leaflet Map]
  G --> I[Recharts Analytics]
```

## Reliability decisions
- One shared polling job prevents per-user upstream quota consumption.
- Last in-process or Redis snapshot is used on upstream failure, marked stale.
- PostgreSQL unique `(icao24, observedAt)` avoids duplicate observations.
- History endpoint limits records to 100 and uses an indexed time filter.
- Frontend requests are cached and polled by TanStack Query.

## Future improvements
- Redis distributed ingestion lock for multi-replica deployments.
- Persistent last-known snapshot with no expiration for prolonged upstream outages.
- Paginated history endpoints, retention policies, observability dashboards.
- Separate worker deployment and event-driven updates.
