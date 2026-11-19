import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {CONFIG} from "./config.js";
import {World} from "./world.js";
import {Network} from "./network.js";
import {Input} from "./input.js";
import {Player} from "./player.js";
import {Remotes} from "./remotes.js";

const mount=document.querySelector("#game"),scene=new THREE.Scene();
scene.background=new THREE.Color(0x91cbed);scene.fog=new THREE.Fog(0x91cbed,35,100);
const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,140);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,CONFIG.pixelRatioMax));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe2f5ff,0x6c7654,1.8));const sun=new THREE.DirectionalLight(0xfff0d0,1.7);sun.position.set(-25,40,18);scene.add(sun);
const world=new World(scene);const player=new Player(scene,camera);const remotes=new Remotes(scene);
let selected="dirt",lastSend=0,lastFrame=performance.now();
const network=new Network((event,data)=>{
 if(event==="connected")document.querySelector("#connection").textContent="Conectado";
 if(event==="disconnected")document.querySelector("#connection").textContent="Reconectando";
 if(event==="room:state"){for(const p of data.players)if(p.id!==data.selfId)remotes.add(p);world.loadEdits(data.blocks);updateNames()}
 if(event==="player:joined"){remotes.add(data);updateNames()}
 if(event==="player:moved")remotes.move(data);
 if(event==="player:left"){remotes.remove(data);updateNames()}
 if(event==="room:count")document.querySelector("#player-count").textContent=data;
 if(event==="block:changed")world.setBlock(data.x,data.y,data.z,data.type);
});
const input=new Input(renderer.domElement,(action,value)=>{
 if(action==="select")selected=value;
 if(action==="jump"&&player.y<=2.12)player.vy=CONFIG.jumpSpeed;
 if(action==="break"||action==="place")editBlock(action);
});
function updateNames(){document.querySelector("#player-names").textContent=["Você",...remotes.names()].join(", ")}
function editBlock(action){
 const direction=new THREE.Vector3(0,0,-1).applyEuler(camera.rotation),ray=new THREE.Raycaster(camera.position,direction,0,6);
 const meshes=[];for(const group of world.chunks.values())group.traverse(o=>{if(o.isInstancedMesh)meshes.push(o)});
 const hits=ray.intersectObjects(meshes,false);if(!hits.length)return;
 const point=hits[0].point,normal=hits[0].face?.normal;if(!normal)return;
 const x=Math.floor(point.x-normal.x*.01),y=Math.floor(point.y-normal.y*.01),z=Math.floor(point.z-normal.z*.01);
 let target={x,y,z,type:"air"};
 if(action==="place"){target={x:Math.floor(point.x+normal.x*.51),y:Math.floor(point.y+normal.y*.51),z:Math.floor(point.z+normal.z*.51),type:selected}}
 network.changeBlock(target.x,target.y,target.z,target.type);
}
document.querySelector("#join-form").addEventListener("submit",e=>{e.preventDefault();const name=document.querySelector("#nickname").value.trim()||"Jogador";const room=document.querySelector("#room-code").value.trim().toUpperCase()||"MUNDO1";document.querySelector("#room-name").textContent=room;network.join(room,name);document.querySelector("#join-screen").style.display="none"});
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-lastFrame)/1000,.04);lastFrame=now;player.update(dt,input);world.updateAround(player.x,player.z);if(now-lastSend>CONFIG.networkInterval){network.updatePlayer(player.data(input.yaw));lastSend=now}sun.position.x=player.x-25;sun.position.z=player.z+18;renderer.render(scene,camera)}
world.updateAround(0,0);requestAnimationFrame(frame);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,CONFIG.pixelRatioMax))});
