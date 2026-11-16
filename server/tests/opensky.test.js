import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState } from '../src/services/opensky.js';
import { demoAircraft } from '../src/services/demo.js';
test('normalizes valid OpenSky state',()=>{
 const state=['abc123','TEST12 ','India',null,null,77.2,28.6,10000,false,230,120,null,null,10100];
 const result=normalizeState(state,1700000000);
 assert.equal(result.icao24,'abc123');assert.equal(result.callsign,'TEST12');assert.equal(result.altitude,10100);
});
test('rejects coordinates missing from state',()=>{
 assert.equal(normalizeState(['abc123',null,null,null,null,null,null],1700000000),null);
});
test('demo produces valid aircraft',()=>{
 const rows=demoAircraft(new Date('2026-01-01T00:00:00Z'));
 assert.ok(rows.length>0);assert.ok(rows.every(a=>Number.isFinite(a.latitude)&&Number.isFinite(a.longitude)));
});
