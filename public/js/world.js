import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {CONFIG} from './config.js';
const colors={grass:0x6ca94b,dirt:0x8b6040,stone:0x8e969c,wood:0x9a7042,leaves:0x408a4b,sand:0xdcc68c,planks:0xc69a60,coal:0x45454b};
const cube=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
const hash=(x,z)=>{let n=Math.imul(x,374761393)+Math.imul(z,668265263)+731|0;n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0};
export class World{
 constructor(scene){this.scene=scene;this.chunks=new Map();this.edits=new Map();this.materials=Object.fromEntries(Object.entries(colors).map(([k,c])=>[k,new THREE.MeshLambertMaterial({color:c})]));}
 height(x,z){return Math.max(1,Math.floor(2+Math.sin(x*.12)*.7+Math.cos(z*.1)*.7));}
 tree(x,z){return hash(x,z)%173===0&&Math.abs(x)+Math.abs(z)>8;}
 base(x,y,z){if(y<0||y>80)return 'air';const h=this.height(x,z);if(y<=h)return y===h?'grass':y>=h-2?'dirt':'stone';
 // Trees are queried as real voxels, including over chunk boundaries.
 for(let tx=x-1;tx<=x+1;tx++)for(let tz=z-1;tz<=z+1;tz++)if(this.tree(tx,tz)){const th=this.height(tx,tz);if(x===tx&&z===tz&&y>=th+1&&y<=th+3)return 'wood';if(Math.abs(x-tx)<=1&&Math.abs(z-tz)<=1&&y>=th+3&&y<=th+4)return 'leaves';}
 return 'air';}
 blockAt(x,y,z){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);const key=`${x},${y},${z}`;return this.edits.has(key)?this.edits.get(key):this.base(x,y,z);}
 loadEdits(edits){this.edits=new Map(Object.entries(edits||{}));for(const id of [...this.chunks.keys()]){const [cx,cz]=id.split(',').map(Number);this.buildChunk(cx,cz)}}
 setBlock(x,y,z,type){this.edits.set(`${x},${y},${z}`,type);const cx=Math.floor(x/16),cz=Math.floor(z/16);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)if(this.chunks.has(`${cx+dx},${cz+dz}`))this.buildChunk(cx+dx,cz+dz);}
 buildChunk(cx,cz){const id=`${cx},${cz}`,old=this.chunks.get(id);if(old){this.scene.remove(old);old.traverse(o=>{if(o.isInstancedMesh)o.dispose?.()})}const group=new THREE.Group(),byType={};for(const type of Object.keys(colors))byType[type]=[];
 const sx=cx*16,sz=cz*16;
 for(let x=sx;x<sx+16;x++)for(let z=sz;z<sz+16;z++){let maxY=Math.max(12,this.height(x,z)+6);for(const key of this.edits.keys()){const [ex,ey,ez]=key.split(',').map(Number);if(ex===x&&ez===z)maxY=Math.max(maxY,ey)}for(let y=0;y<=Math.min(80,maxY);y++){
 const type=this.blockAt(x,y,z);if(type==='air'||!byType[type])continue;
 if([[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].every(([dx,dy,dz])=>this.blockAt(x+dx,y+dy,z+dz)!=='air'))continue;
 byType[type].push([x,y,z]);}}
 for(const [type,positions] of Object.entries(byType)){if(!positions.length)continue;const mesh=new THREE.InstancedMesh(cube,this.materials[type],positions.length);mesh.userData.positions=positions;positions.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.instanceMatrix.needsUpdate=true;group.add(mesh)}
 this.scene.add(group);this.chunks.set(id,group);}
 updateAround(x,z){const cx=Math.floor(x/16),cz=Math.floor(z/16),r=CONFIG.renderDistance,needed=new Set();for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const id=`${cx+dx},${cz+dz}`;needed.add(id);if(!this.chunks.has(id))this.buildChunk(cx+dx,cz+dz)}for(const [id,g] of this.chunks)if(!needed.has(id)){this.scene.remove(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose?.()});this.chunks.delete(id)}}
 pick(camera){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);ray.far=6;const meshes=[];for(const g of this.chunks.values())for(const m of g.children)if(m.isInstancedMesh)meshes.push(m);const hit=ray.intersectObjects(meshes,false)[0];if(!hit||hit.instanceId==null)return null;const pos=hit.object.userData.positions[hit.instanceId];if(!pos)return null;const normal=hit.face.normal.clone();return {x:pos[0],y:pos[1],z:pos[2],normal:{x:Math.round(normal.x),y:Math.round(normal.y),z:Math.round(normal.z)}};}
}
