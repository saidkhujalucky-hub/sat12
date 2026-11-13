import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,legacyCatalog} from '../server/questions.mjs';
import {moduleRefs} from '../server/exams.mjs';
import {readFileSync} from 'node:fs';

test('balanced routes preserve question pool, domain and difficulty counts',()=>{
 const collect=c=>c.variants.flatMap(v=>Object.values(v.sections).flatMap(b=>Object.values(b).flat()));
 assert.deepEqual(collect(catalog).map(q=>q.id).sort(),collect(legacyCatalog).map(q=>q.id).sort());
 assert.equal(new Set(collect(catalog).map(q=>q.id)).size,1470);
 for(const v of catalog.variants){
  const old=legacyCatalog.variants.find(x=>x.id===v.id);
  for(const section of ['rw','math'])for(const branch of ['mixed','easy','hard']){
   const counts=a=>a.reduce((m,q)=>(m[q.domain+q.difficulty]=(m[q.domain+q.difficulty]||0)+1,m),{});
   assert.deepEqual(counts(v.sections[section][branch]),counts(old.sections[section][branch]));
  }
  for(const branch of ['easy','hard']){
   const rw=[...v.sections.rw.mixed,...v.sections.rw[branch]];
   const math=[...v.sections.math.mixed,...v.sections.math[branch]];
   const topics=a=>a.reduce((m,q)=>(m[q.topic.trim()]=(m[q.topic.trim()]||0)+1,m),{});
   assert.equal(Object.keys(topics(rw)).length,10);
   assert.ok(Math.max(...Object.values(topics(math)))<=9);
  }
 }
});
test('old attempts keep their original references and new attempts use balanced references',()=>{
 for(const v of catalog.variants)for(let index=0;index<4;index++)for(const route of ['easy','hard']){
  const section=catalog.modules[index].section, branch=index%2?route:'mixed';
  const attempt={test:v.id,index,routing:{rw:route,math:route}};
  assert.deepEqual(moduleRefs(attempt),legacyCatalog.variants[v.id-1].sections[section][branch]);
  assert.deepEqual(moduleRefs({...attempt,catalogVersion:2}),v.sections[section][branch]);
 }
 const client=readFileSync(new URL('../public/official.js',import.meta.url),'utf8');
 assert.match(client,/active\.catalogVersion===2\?catalog\.variants:catalog\.legacyVariants/);
});
