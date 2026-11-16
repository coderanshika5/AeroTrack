import { config } from '../config.js';
import { db } from '../db.js';
import { demoAircraft } from './demo.js';
import { fetchOpenSky } from './opensky.js';
import { cacheRead,cacheWrite } from './cache.js';
const CACHE_KEY='aerotrack:snapshot';
let current=null;
let running=null;
export async function ingest() {
 if (running) return running;
 running=(async()=>{
 const started=Date.now();
 let runId=null;
 try {
  const run=await db.ingestionRun.create({data:{status:'running'}});runId=run.id;
  const aircraft=config.mode==='live'?await fetchOpenSky():demoAircraft();
  const snapshot={aircraft,source:config.mode,updatedAt:new Date().toISOString(),stale:false};
  // Limit persisted observations per run to avoid excessive demo database growth.
  for (const a of aircraft.slice(0,500)) {
   await db.aircraft.upsert({where:{icao24:a.icao24},create:{icao24:a.icao24,callsign:a.callsign,originCountry:a.originCountry,lastSeen:new Date(a.observedAt)},update:{callsign:a.callsign,originCountry:a.originCountry,lastSeen:new Date(a.observedAt)}});
  }
  if(aircraft.length){await db.observation.createMany({data:aircraft.slice(0,500).map(a=>({icao24:a.icao24,latitude:a.latitude,longitude:a.longitude,altitude:a.altitude,velocity:a.velocity,heading:a.heading,onGround:a.onGround,observedAt:new Date(a.observedAt)})),skipDuplicates:true});}
  current=snapshot;
  await cacheWrite(CACHE_KEY,snapshot,config.ttl);
  await db.ingestionRun.update({where:{id:runId},data:{status:'success',finishedAt:new Date(),count:aircraft.length,latencyMs:Date.now()-started}});
  return snapshot;
 }catch(err){
  console.error('Ingestion failed:',err.message);
  if(runId)await db.ingestionRun.update({where:{id:runId},data:{status:'error',finishedAt:new Date(),error:String(err.message).slice(0,500),latencyMs:Date.now()-started}}).catch(()=>{});
  const cached=current || await cacheRead(CACHE_KEY);
  if(cached)return {...cached,stale:true,error:'Live provider unavailable; displaying last successful snapshot'};
  throw err;
 }finally{running=null;}
 })();return running;
}
export async function snapshot(){return current || await cacheRead(CACHE_KEY) || await ingest();}
