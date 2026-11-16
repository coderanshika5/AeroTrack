import {MapContainer,TileLayer,Marker,Popup,Polyline,useMap} from 'react-leaflet';
import L from 'leaflet';
import {useEffect} from 'react';
const icon=L.divIcon({html:'<div class="plane-icon">✈</div>',className:'aircraft-pin',iconSize:[28,28],iconAnchor:[14,14]});
function Focus({aircraft}){const map=useMap();useEffect(()=>{if(aircraft?.latitude!=null&&aircraft?.longitude!=null)map.flyTo([aircraft.latitude,aircraft.longitude],8,{duration:1});},[aircraft?.icao24,map]);return null;}
export default function FlightMap({aircraft,selected,onSelect,history}){
 const path=history.filter(x=>x.latitude!=null&&x.longitude!=null).map(x=>[x.latitude,x.longitude]);
 return <MapContainer center={[28.6,79.2]} zoom={6} className="flight-map" scrollWheelZoom={true}>
  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
  {aircraft.filter(a=>a.latitude!=null&&a.longitude!=null).map(a=><Marker key={a.icao24} position={[a.latitude,a.longitude]} icon={icon} eventHandlers={{click:()=>onSelect(a)}}><Popup><b>{a.callsign||a.icao24}</b><div>{a.originCountry||'Unknown origin'}</div><div>{Math.round(a.altitude??0).toLocaleString()} m</div></Popup></Marker>)}
  {path.length>1&&<Polyline positions={path} pathOptions={{color:'#22c55e',weight:3}}/>}
  <Focus aircraft={selected}/>
 </MapContainer>;
}
