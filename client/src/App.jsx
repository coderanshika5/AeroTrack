import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Activity,Plane,Search,RadioTower,Clock3,AlertTriangle,RefreshCw} from 'lucide-react';
import {BarChart,Bar,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
import FlightMap from './components/FlightMap.jsx';
import {api} from './api.js';
const fetcher=path=>api.get(path).then(r=>r.data);
export default function App(){
 const [search,setSearch]=useState(''),[selected,setSelected]=useState(null),[tab,setTab]=useState('map');
 const flights=useQuery({queryKey:['flights'],queryFn:()=>fetcher('/aircraft'),refetchInterval:60000});
 const overview=useQuery({queryKey:['overview'],queryFn:()=>fetcher('/analytics/overview'),refetchInterval:60000});
 const altitude=useQuery({queryKey:['altitude'],queryFn:()=>fetcher('/analytics/altitude'),refetchInterval:60000});
 const history=useQuery({queryKey:['history',selected?.icao24],queryFn:()=>fetcher(`/aircraft/${selected.icao24}/history`),enabled:!!selected,refetchInterval:60000});
 const data=flights.data?.aircraft||[];
 const visible=data.filter(a=>`${a.callsign||''} ${a.icao24} ${a.originCountry||''}`.toLowerCase().includes(search.toLowerCase()));
 const stats=overview.data||{};
 return <div className="shell">
  <aside className="sidebar"><div className="brand"><Plane size={28}/><div><b>AEROTRACK</b><small>AVIATION INTELLIGENCE</small></div></div>
   <div className="section-label">NAVIGATION</div>
   <button className={tab==='map'?'nav active':'nav'} onClick={()=>setTab('map')}><RadioTower size={18}/> Live radar</button>
   <button className={tab==='analytics'?'nav active':'nav'} onClick={()=>setTab('analytics')}><Activity size={18}/> Analytics</button>
   <div className="sidebar-bottom">Flight telemetry from OpenSky Network<br/>Demo mode available for offline review.</div>
  </aside>
  <main className="main"><header className="header"><div><div className="eyebrow">AIRSPACE MONITORING</div><h1>{tab==='map'?'Live Flight Radar':'Flight Analytics'}</h1><p>Track aircraft and explore aviation telemetry.</p></div><div className="status"><span className="status-dot"/>{flights.data?.source==='demo'?'DEMO DATA':'LIVE DATA'}</div></header>
   {flights.data?.stale&&<div className="warning"><AlertTriangle size={16}/> Provider unavailable — showing cached observations.</div>}
   {flights.isError&&<div className="warning"><AlertTriangle size={16}/> Cannot reach API. Start the backend and check your environment variables.</div>}
   <div className="stats"><Stat icon={<Plane/>} label="Tracked aircraft" value={stats.total??'—'}/><Stat icon={<RadioTower/>} label="Airborne" value={stats.airborne??'—'}/><Stat icon={<Activity/>} label="Avg altitude" value={stats.averageAltitude!=null?`${(stats.averageAltitude/1000).toFixed(1)} km`:'—'}/><Stat icon={<Clock3/>} label="Last updated" value={stats.updatedAt?new Date(stats.updatedAt).toLocaleTimeString():'—'}/></div>
   {tab==='map'?<div className="workspace"><div className="map-panel"><div className="panel-heading"><b>Airspace overview</b><span><RefreshCw size={13}/> Auto refresh: 60s</span></div><FlightMap aircraft={visible} selected={selected} onSelect={setSelected} history={history.data?.observations||[]}/></div>
    <div className="right-panel"><div className="panel-heading"><b>Aircraft ({visible.length})</b></div><div className="search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search callsign or ICAO24"/></div>
     <div className="aircraft-list">{visible.slice(0,100).map(a=><button key={a.icao24} className={`aircraft-row ${selected?.icao24===a.icao24?'selected':''}`} onClick={()=>setSelected(a)}><div><b>{a.callsign||a.icao24}</b><small>{a.originCountry||'Unknown country'}</small></div><span>{a.altitude!=null?`${Math.round(a.altitude).toLocaleString()} m`:'N/A'}</span></button>)}{!visible.length&&<p className="empty">No aircraft found.</p>}</div>
     {selected&&<div className="details"><div className="details-title"><b>Aircraft details</b><button onClick={()=>setSelected(null)}>✕</button></div><Detail label="Callsign" value={selected.callsign||'Unknown'}/><Detail label="ICAO24" value={selected.icao24}/><Detail label="Altitude" value={selected.altitude!=null?`${Math.round(selected.altitude)} m`:'N/A'}/><Detail label="Speed" value={selected.velocity!=null?`${Math.round(selected.velocity*3.6)} km/h`:'N/A'}/><Detail label="Heading" value={selected.heading!=null?`${Math.round(selected.heading)}°`:'N/A'}/><Detail label="History samples" value={history.data?.observations?.length??0}/></div>}
    </div></div>:<div className="analytics"><div className="chart-card"><h2>Altitude distribution</h2><p>Aircraft by reported altitude band</p><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={altitude.data?.buckets||[]}><CartesianGrid strokeDasharray="3 3" stroke="#263244"/><XAxis dataKey="label" stroke="#9aacc2"/><YAxis allowDecimals={false} stroke="#9aacc2"/><Tooltip contentStyle={{background:'#101b2b',border:'1px solid #334155',color:'#fff'}}/><Bar dataKey="count" fill="#38bdf8" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div><div className="chart-card"><h2>Data provenance</h2><p>Current data source: <b>{stats.source||'—'}</b></p><p>Airborne aircraft: <b>{stats.airborne??'—'}</b></p><p>On ground: <b>{stats.onGround??'—'}</b></p><p>These are observed aircraft states, not scheduled commercial flights.</p></div></div>}
   <footer>Built for learning · Not for navigation or operational aviation use · Map © OpenStreetMap contributors</footer>
  </main></div>;
}
function Stat({icon,label,value}){return <div className="stat"><div className="stat-icon">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></div>}
function Detail({label,value}){return <div className="detail"><span>{label}</span><b>{value}</b></div>}
