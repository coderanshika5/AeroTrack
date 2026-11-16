# AeroTrack — Real-Time Aircraft Tracking & Aviation Analytics

A full-stack SDE portfolio project featuring an interactive aircraft map, OpenSky integration, Redis cache, PostgreSQL observation history, analytics, background ingestion, and tests.

> **Important:** This is a learning/demo application. It must not be used for real-world aviation navigation or operational decisions. Demo data is synthetic and should not be presented as live flights.

## Prerequisites
- Node.js **20+** and npm
- Docker Desktop with Docker Compose (recommended for PostgreSQL and Redis)
- Optional: OpenSky account/API credentials for live telemetry

## Quick start (Windows PowerShell or macOS/Linux)
```bash
# From the project root
npm install
npm run install:all
docker compose up -d
# Copy server/.env.example to server/.env
# Copy client/.env.example to client/.env
npm run db:push
npm run dev
```

Open **http://localhost:5173** (API at **http://localhost:4000/api/health**).

On Windows PowerShell copy environment files with:
```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

On macOS/Linux:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Live flight data
Change `DATA_MODE=demo` to `DATA_MODE=live` in `server/.env` and restart the backend. By default the backend uses anonymous OpenSky `/states/all` with a bounded geographic area. **Provider availability, quota, geographic coverage, and authorization rules may change.** You can optionally set `OPENSKY_CLIENT_ID` and `OPENSKY_CLIENT_SECRET` to use OAuth2 credentials; never put secrets in the frontend or commit `.env` files.

**Important limitation:** OpenSky state vectors contain telemetry, not full flight schedules or guaranteed departure/destination airport pairs. Some aircraft have missing position, speed, altitude, or callsign. The UI uses only supported fields.

To avoid quota exhaustion, the server performs one shared scheduled fetch rather than requesting OpenSky for each visitor. Default is once every 2 minutes. Browser refreshes every 60 seconds and may show the same snapshot between ingestions. Configure `POLL_MINUTES` and the bounding box according to your actual provider quota. If the live API fails and a prior snapshot exists, the API marks it `stale: true`. No fabricated live data is substituted.

## Project structure
```
aerotrack/
  client/          React, Vite, React Leaflet, TanStack Query, Recharts
  server/          Express API, OpenSky integration, scheduler, Redis, Prisma
    prisma/        PostgreSQL schema
    tests/         Unit tests
  docs/            Architecture and benchmark guide
  docker-compose.yml
```

## API endpoints
- `GET /api/health` — status
- `GET /api/aircraft?search=AIC&minAltitude=3000` — aircraft snapshot with filters
- `GET /api/aircraft/:icao24` — current details or last known record
- `GET /api/aircraft/:icao24/history` — last 100 observations
- `GET /api/analytics/overview` — totals, average altitude, freshness
- `GET /api/analytics/altitude` — altitude buckets
- `GET /api/analytics/ingestion` — recent ingestion runs

## Tests
```bash
npm test
npm run build --prefix client
```

## Notes for deployment
- Deploy frontend to a static host and server to a persistent Node host. Set `VITE_API_URL` to the deployed API URL and `CLIENT_ORIGIN` to the deployed frontend origin.
- Use managed PostgreSQL and Redis; configure `DATABASE_URL` and `REDIS_URL`.
- This starter runs the ingestion scheduler in the API process. **Run only one server replica** or move ingestion into a separate worker with a distributed lock to avoid duplicate polling.
- Keep OpenSky credentials on the server. Use provider-approved request rates.
- OpenStreetMap standard tile servers have a usage policy; use a suitable tile provider for significant production traffic.
- `prisma db push` is for rapid prototyping. For production, create and commit Prisma migrations.
- This starter stores at most 500 observations per ingestion run. Implement retention/partitioning for long-term use.

## What to measure for your resume
Benchmark uncached vs cached endpoint latency, ingestion success rate, number of observations, and database history query time. Report **measured** numbers only.

## Attribution
Aircraft telemetry: [OpenSky Network](https://opensky-network.org/) (when live mode enabled). Map data: © OpenStreetMap contributors.
