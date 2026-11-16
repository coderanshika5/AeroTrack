import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { snapshot } from '../services/ingest.js';
const router=Router();
const querySchema=z.object({search:z.string().max(60).optional(),onGround:z.enum(['true','false']).optional(),minAltitude:z.coerce.number().optional(),maxAltitude:z.coerce.number().optional()});
router.get('/aircraft',async(req,res,next)=>{try{
 const q=querySchema.parse(req.query),data=await snapshot();
 let aircraft=data.aircraft;
 if(q.search){const s=q.search.toLowerCase();aircraft=aircraft.filter(a=>[a.callsign,a.icao24,a.originCountry].some(v=>v?.toLowerCase().includes(s)));}
 if(q.onGround!==undefined)aircraft=aircraft.filter(a=>a.onGround===(q.onGround==='true'));
 if(q.minAltitude!==undefined)aircraft=aircraft.filter(a=>(a.altitude??-Infinity)>=q.minAltitude);
 if(q.maxAltitude!==undefined)aircraft=aircraft.filter(a=>(a.altitude??Infinity)<=q.maxAltitude);
 res.json({...data,count:aircraft.length,aircraft});
 }catch(e){next(e);}});
router.get('/aircraft/:icao24/history',async(req,res,next)=>{try{
 const icao24=req.params.icao24.toLowerCase();
 if(!/^[a-f0-9]{6}$/.test(icao24))return res.status(400).json({error:'Invalid ICAO24 identifier'});
 const rows=await db.observation.findMany({where:{icao24},orderBy:{observedAt:'desc'},take:100});
 res.json({icao24,observations:rows.reverse()});
 }catch(e){next(e);}});
router.get('/aircraft/:icao24',async(req,res,next)=>{try{
 const id=req.params.icao24.toLowerCase();if(!/^[a-f0-9]{6}$/.test(id))return res.status(400).json({error:'Invalid ICAO24 identifier'});
 const data=await snapshot();const a=data.aircraft.find(a=>a.icao24===id);
 if(a)return res.json({...a,stale:data.stale,source:data.source});
 const record=await db.aircraft.findUnique({where:{icao24:id}});
 if(!record)return res.status(404).json({error:'Aircraft not found'});
 res.json({...record,stale:true});
 }catch(e){next(e);}});
router.get('/analytics/overview',async(req,res,next)=>{try{
 const data=await snapshot(),a=data.aircraft;
 const flying=a.filter(x=>!x.onGround);
 const avgAltitude=flying.filter(x=>x.altitude!=null);
 res.json({total:a.length,airborne:flying.length,onGround:a.length-flying.length,averageAltitude:avgAltitude.length?Math.round(avgAltitude.reduce((s,x)=>s+x.altitude,0)/avgAltitude.length):0,source:data.source,stale:data.stale,updatedAt:data.updatedAt});
 }catch(e){next(e);}});
router.get('/analytics/altitude',async(req,res,next)=>{try{
 const data=await snapshot();const buckets=[{label:'< 3 km',min:-Infinity,max:3000},{label:'3–6 km',min:3000,max:6000},{label:'6–9 km',min:6000,max:9000},{label:'9–12 km',min:9000,max:12000},{label:'12+ km',min:12000,max:Infinity}];
 res.json({buckets:buckets.map(b=>({label:b.label,count:data.aircraft.filter(a=>a.altitude!=null&&a.altitude>=b.min&&a.altitude<b.max).length}))});
 }catch(e){next(e);}});
router.get('/analytics/ingestion',async(req,res,next)=>{try{res.json({runs:await db.ingestionRun.findMany({orderBy:{startedAt:'desc'},take:15})});}catch(e){next(e);}});
export default router;
