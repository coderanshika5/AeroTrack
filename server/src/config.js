import 'dotenv/config';
const num = (name, fallback) => Number(process.env[name] ?? fallback);
export const config = {
  port: num('PORT', 4000),
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mode: process.env.DATA_MODE || 'demo',
  openskyBase: process.env.OPENSKY_BASE_URL || 'https://opensky-network.org/api',
  bbox: { lamin: num('BBOX_LAMIN',25), lomin: num('BBOX_LOMIN',75), lamax: num('BBOX_LAMAX',31), lomax: num('BBOX_LOMAX',83) },
  pollMinutes: Math.max(1,num('POLL_MINUTES',2)),
  ttl: Math.max(60,num('CACHE_TTL_SECONDS',180))
};
