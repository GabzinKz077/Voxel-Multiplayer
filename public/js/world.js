import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {CONFIG} from "./config.js";

const MATERIAL_COLORS={grass:0x69ad50,dirt:0x805438,stone:0x858d96,wood:0x9a693e,leaves:0x3f8847,sand:0xd8c17d};
const geometry=new THREE.BoxGeometry(1,1,1);
const hash=(x,z)=>{let n=(x*374761393+z*668265263+CONFIG.worldSeed)|0;n=(n^(n>>>13))*1274126177;return (n^(n>>>16))>>>0};
export class World {
 constructor(scene){this.scene=scene;this.chunks=new Map();this.edits=new Map();this.materials=Object.fromEntries(Object.entries(MATERIAL_COLORS).map(([k,c])=>[k,new THREE.MeshLambertMaterial({color:c})]));}
 key(cx,cz){return `${cx},${cz}`}
 height(x,z){return Math.max(1,Math.floor(2+Math.sin(x*.12)*.7+Math.cos(z*.1)*.7))}
 baseBlock(x,y,z){const h=this.height(x,z);if(y===h)return "grass";if(y>=h-2)return "dirt";return "stone"}
 blockAt(x,y,z){const k=`${x},${y},${z}`;return this.edits.has(k)?this.edits.get(k):y<=this.height(x,z)?this.baseBlock(x,y,z):"air"}
 setBlock(x,y,z,type){const k=`${x},${y},${z}`;this.edits.set(k,type);this.rebuildAt(x,z)}
 loadEdits(edits){for(const [k,v] of Object.entries(edits||{}))this.edits.set(k,v);for(const key of this.chunks.keys()){const [x,z]=key.split(",").map(Number);this.buildChunk(x,z)}}
 rebuildAt(x,z){const cx=Math.floor(x/CONFIG.chunkSize),cz=Math.floor(z/CONFIG.chunkSize);this.buildChunk(cx,cz)}
 buildChunk(cx,cz){
  const id=this.key(cx,cz),old=this.chunks.get(id);if(old){this.scene.remove(old);old.traverse(o=>{if(o.isInstancedMesh){o.dispose?.()}})}
  const group=new THREE.Group(),positions={};for(const t of Object.keys(this.materials))positions[t]=[];
  const startX=cx*CONFIG.chunkSize,startZ=cz*CONFIG.chunkSize;
  for(let x=startX;x<startX+CONFIG.chunkSize;x++)for(let z=startZ;z<startZ+CONFIG.chunkSize;z++){
   const h=this.height(x,z);
   for(let y=Math.max(0,h-2);y<=h;y++){
    const type=this.blockAt(x,y,z);if(positions[type])positions[type].push([x,y,z]);
   }
   // Simple deterministic trees; only add trunks/canopy in sparse positions.
   if(hash(x,z)%173===0 && Math.abs(x)+Math.abs(z)>8){
    for(let y=h+1;y<=h+3;y++)positions.wood.push([x,y,z]);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(let dy=h+3;dy<=h+4;dy++)positions.leaves.push([x+dx,dy,z+dz]);
   }
  }
  const dummy=new THREE.Object3D();
  for(const [type,list] of Object.entries(positions)){
   if(!list.length)continue;
   const mesh=new THREE.InstancedMesh(geometry,this.materials[type],list.length);
   list.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});
   mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=true;group.add(mesh);
  }
  this.scene.add(group);this.chunks.set(id,group);
 }
 updateAround(x,z){
  const cx=Math.floor(x/CONFIG.chunkSize),cz=Math.floor(z/CONFIG.chunkSize),r=CONFIG.renderDistance,needed=new Set();
  for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const xx=cx+dx,zz=cz+dz,id=this.key(xx,zz);needed.add(id);if(!this.chunks.has(id))this.buildChunk(xx,zz)}
  for(const [id,group] of this.chunks){if(!needed.has(id)){this.scene.remove(group);this.chunks.delete(id)}}
 }
}
