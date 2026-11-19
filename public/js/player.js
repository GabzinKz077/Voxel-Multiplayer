import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {CONFIG} from "./config.js";
export class Player {
 constructor(scene,camera){this.scene=scene;this.camera=camera;this.x=0;this.y=4;this.z=0;this.vx=0;this.vy=0;this.vz=0;this.mesh=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(.62,1.15,.4),new THREE.MeshLambertMaterial({color:0x397bd5}));body.position.y=.72;this.mesh.add(body);const head=new THREE.Mesh(new THREE.BoxGeometry(.45,.45,.45),new THREE.MeshLambertMaterial({color:0xf0c59e}));head.position.y=1.55;this.mesh.add(head);scene.add(this.mesh)}
 update(dt,input){const {forward,side}=input.move(),sin=Math.sin(input.yaw),cos=Math.cos(input.yaw),speed=CONFIG.playerSpeed;const tx=(side*cos-forward*sin)*speed,tz=(-side*sin-forward*cos)*speed;this.vx+=(tx-this.vx)*Math.min(1,dt*12);this.vz+=(tz-this.vz)*Math.min(1,dt*12);this.x+=this.vx*dt;this.z+=this.vz*dt;this.vy-=CONFIG.gravity*dt;this.y+=this.vy*dt;const floor=2.1;if(this.y<floor){this.y=floor;this.vy=0}if(input.keys[" "]&&this.y<=floor+.01)this.vy=CONFIG.jumpSpeed;this.mesh.position.set(this.x,this.y-1.8,this.z);this.mesh.rotation.y=input.yaw;this.camera.position.set(this.x,this.y+.35,this.z);this.camera.rotation.order="YXZ";this.camera.rotation.y=input.yaw;this.camera.rotation.x=input.pitch}
 data(yaw){return {x:this.x,y:this.y,z:this.z,yaw}}
}
