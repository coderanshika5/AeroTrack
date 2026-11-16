import cron from 'node-cron';
import { app } from './app.js';
import { config } from './config.js';
import { ingest } from './services/ingest.js';
import { db } from './db.js';
const server=app.listen(config.port,()=>console.log(`AeroTrack API http://localhost:${config.port} (${config.mode})`));
// One worker per deployment: do not run multiple API replicas with this scheduler.
cron.schedule(`*/${Math.min(59,config.pollMinutes)} * * * *`,()=>ingest().catch(console.error));
ingest().catch(e=>console.warn('Initial ingest failed:',e.message));
async function shutdown(){server.close();await db.$disconnect();process.exit(0);}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
