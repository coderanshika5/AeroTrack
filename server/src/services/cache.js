import Redis from 'ioredis';
let redis;
export function getRedis() {
 if (!process.env.REDIS_URL) return null;
 if (!redis) {
  redis=new Redis(process.env.REDIS_URL,{lazyConnect:true,maxRetriesPerRequest:1,retryStrategy:()=>null});
  redis.on('error',err=>console.warn('Redis unavailable:',err.message));
 }
 return redis;
}
export async function cacheRead(key) {
 try {const r=getRedis();if(!r)return null;if(r.status==='wait')await r.connect();const value=await r.get(key);return value?JSON.parse(value):null;}catch{return null;}
}
export async function cacheWrite(key,value,ttl) {
 try {const r=getRedis();if(!r)return;if(r.status==='wait')await r.connect();await r.set(key,JSON.stringify(value),'EX',ttl);}catch{}
}
