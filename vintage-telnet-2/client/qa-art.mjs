import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {placeArt,placeIllustrations,bestiaryThumbnail} from './ui-data.js';
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
console.log(`PASS: ${entries.length} room variants, final asset routes, unchanged names/captions and safe fallback.`);

const veyra=JSON.parse(fs.readFileSync(new URL('../content/regions/veyra.json',import.meta.url)));
const dungeon=Object.values(veyra.rooms).filter(room=>room.id.startsWith('veyra_mazmorra_'));
assert.equal(dungeon.length,8);
for(const room of dungeon){
 const art=placeArt(room);
 assert.equal(art.name,room.name);
 for(const key of ['illustration','thumbnail']){
  const data=fs.readFileSync(new URL('../'+art[key].slice(1),import.meta.url));
  assert.equal(data.subarray(8,12).toString(),'WEBP');
 }
}
console.log('PASS: eight Bastion rooms have base illustrations and thumbnails.');

const thumbnails=JSON.parse(fs.readFileSync(new URL('./art/bestiary-thumbnails.json',import.meta.url)));
for(const entry of thumbnails){
 const creature={id:entry.creatures[0],illustration:entry.illustration};
 const before=JSON.stringify(creature);
 assert.equal(bestiaryThumbnail(creature),'/'+entry.target);
 assert.equal(creature.illustration,entry.illustration);
 assert.equal(JSON.stringify(creature),before);
 for(const asset of [entry.target,entry.illustration.slice(1)]){
  const data=fs.readFileSync(new URL('../'+asset,import.meta.url));
  assert.equal(data.subarray(8,12).toString(),'WEBP');
  const expected=asset===entry.target?entry.sha256:entry.parent_sha256;
  assert.equal(createHash('sha256').update(data).digest('hex'),expected);
 }
}
const legacy={illustration:'/client/art/bestiary/mordelinde-anime-v1.webp'};
assert.equal(bestiaryThumbnail(legacy),legacy.illustration);
assert.equal(bestiaryThumbnail(null),null);
assert.equal(bestiaryThumbnail({illustration:'https://external.invalid/image.webp'}),null);
assert.equal(bestiaryThumbnail({illustration:'/client/art/encounters/forajido-camino-anime-v1.webp'}),null);
const dragon=JSON.parse(fs.readFileSync(new URL('../content/world.json',import.meta.url))).creatures.dragon_aguas_antiguas;
assert.equal(bestiaryThumbnail(dragon),'/client/art/bestiary/dragon_aguas_antiguas-anime-v1-thumb.webp');
console.log(`PASS: ${thumbnails.length} bestiary thumbnails, dragon content mapping, full illustrations retained, legacy fallback and read-only selection.`);
