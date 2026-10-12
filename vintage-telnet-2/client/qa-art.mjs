import assert from 'node:assert/strict';
import fs from 'node:fs';
import {placeArt,placeIllustrations} from './ui-data.js';
const entries=JSON.parse(fs.readFileSync(new URL('./art/place-variants.json',import.meta.url)));
for(const entry of entries){
 const room={id:entry.room,kind:'interior',region:'korven'};
 const base=placeArt(room);
 assert.equal(base.illustration,placeIllustrations[room.id].illustration);
 const before=JSON.stringify(room);
 const selected=placeArt({...room,art_variant:entry.variant});
 assert.equal(selected.illustration,'/'+entry.files[0].path);
 assert.equal(selected.thumbnail,'/'+entry.files[1].path);
 assert.equal(selected.name,base.name);assert.equal(selected.caption,base.caption);
 assert.equal(JSON.stringify(room),before);
 assert.deepEqual(placeArt({...room,art_variant:'unknown'}),base);
 assert.deepEqual(placeArt({...room,art_variant:'../../private'}),base);
 for(const art of [base,selected])for(const key of ['illustration','thumbnail']){
  const asset=fs.readFileSync(new URL('.'+art[key].replace('/client/','/'),import.meta.url));
  assert.equal(asset.subarray(8,12).toString(),'WEBP');
 }
}
assert.equal(placeArt(null),null);
console.log('PASS: three room variants, final asset routes, unchanged names/captions and safe fallback.');
