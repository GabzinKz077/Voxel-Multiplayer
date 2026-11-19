import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
export class Remotes {
 constructor(scene){this.scene=scene;this.items=new Map()}
 add(p){if(this.items.has(p.id))return;const g=new THREE.Group();const color=new THREE.MeshLambertMaterial({color:p.color||0xd18a48});const body=new THREE.Mesh(new THREE.BoxGeometry(.62,1.15,.4),color);body.position.y=.72;g.add(body);const head=new THREE.Mesh(new THREE.BoxGeometry(.45,.45,.45),new THREE.MeshLambertMaterial({color:0xf0c59e}));head.position.y=1.55;g.add(head);g.position.set(p.x,p.y,p.z);this.scene.add(g);this.items.set(p.id,{group:g,name:p.name})}
 move(p){const r=this.items.get(p.id);if(r){r.group.position.set(p.x,p.y,p.z);r.group.rotation.y=p.yaw}}
 remove(id){const r=this.items.get(id);if(r){this.scene.remove(r.group);this.items.delete(id)}}
 names(){return [...this.items.values()].map(v=>v.name)}
}
