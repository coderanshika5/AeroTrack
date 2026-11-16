import axios from 'axios';
import { config } from '../config.js';
let tokenCache = {token:null, expiresAt:0};
async function accessToken() {
 const id=process.env.OPENSKY_CLIENT_ID, secret=process.env.OPENSKY_CLIENT_SECRET;
 if (!id || !secret) return null;
 if (tokenCache.token && Date.now()<tokenCache.expiresAt) return tokenCache.token;
 const body=new URLSearchParams({grant_type:'client_credentials',client_id:id,client_secret:secret});
 const {data}=await axios.post('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',body.toString(),{headers:{'Content-Type':'application/x-www-form-urlencoded'},timeout:12000});
 tokenCache={token:data.access_token,expiresAt:Date.now()+(Math.max(30,data.expires_in-60)*1000)};
 return tokenCache.token;
}
export function normalizeState(s, observedAt) {
 if (!Array.isArray(s) || !s[0] || !Number.isFinite(s[5]) || !Number.isFinite(s[6])) return null;
 return {icao24:String(s[0]).toLowerCase(),callsign:s[1]?.trim()||null,originCountry:s[2]||null,
  longitude:s[5],latitude:s[6],altitude:s[13]??s[7]??null,
  onGround:Boolean(s[8]),velocity:s[9]??null,heading:s[10]??null,
  observedAt:new Date(observedAt*1000).toISOString()};
}
export async function fetchOpenSky() {
 const token=await accessToken();
 const {data}=await axios.get(`${config.openskyBase}/states/all`,{
  params:config.bbox,headers:token?{Authorization:`Bearer ${token}`}:{},timeout:18000
 });
 const timestamp=data.time || Math.floor(Date.now()/1000);
 return (data.states||[]).map(s=>normalizeState(s,timestamp)).filter(Boolean);
}
