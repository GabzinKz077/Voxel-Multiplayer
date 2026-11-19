export class Input {
 constructor(canvas,onAction){
  this.keys={};this.wantJump=false;this.yaw=0;this.pitch=0;this.drag=false;this.lastX=0;this.lastY=0;this.onAction=onAction;
  addEventListener("keydown",e=>{this.keys[e.key.toLowerCase()]=true;if(e.code==="Space")e.preventDefault();if(["1","2","3"].includes(e.key))onAction("select",["dirt","stone","wood"][Number(e.key)-1])});
  addEventListener("keyup",e=>this.keys[e.key.toLowerCase()]=false);
  canvas.addEventListener("contextmenu",e=>e.preventDefault());
  canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button===0){this.drag=true;this.lastX=e.clientX;this.lastY=e.clientY}});
  addEventListener("pointerup",()=>this.drag=false);
  addEventListener("pointermove",e=>{if(this.drag){this.look(e.clientX,e.clientY)}});
  canvas.addEventListener("pointerup",e=>{if(e.pointerType==="mouse"&&e.button===2)onAction("place")});
  canvas.addEventListener("dblclick",()=>onAction("break"));
  document.querySelectorAll("[data-move]").forEach(b=>{const k=b.dataset.move;b.addEventListener("pointerdown",e=>{e.preventDefault();this.keys[k]=true});["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>this.keys[k]=false))});
  document.querySelector("#mobile-jump").onclick=()=>onAction("jump");
  document.querySelector("#mobile-break").onclick=()=>onAction("break");
  document.querySelector("#mobile-place").onclick=()=>onAction("place");
  let touch=null;
  canvas.addEventListener("touchstart",e=>{if(e.touches.length===1){touch={x:e.touches[0].clientX,y:e.touches[0].clientY}}},{passive:true});
  canvas.addEventListener("touchmove",e=>{if(touch&&e.touches.length===1){const t=e.touches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;this.yaw-=dx*.006;this.pitch=Math.max(-1.1,Math.min(1.1,this.pitch-dy*.004));touch={x:t.clientX,y:t.clientY}}},{passive:true});
  canvas.addEventListener("touchend",()=>touch=null);
 }
 look(x,y){this.yaw-=(x-this.lastX)*.004;this.pitch=Math.max(-1.1,Math.min(1.1,this.pitch-(y-this.lastY)*.003));this.lastX=x;this.lastY=y}
 move(){return {forward:(this.keys.w||this.keys.forward?1:0)-(this.keys.s||this.keys.back?1:0),side:(this.keys.d||this.keys.right?1:0)-(this.keys.a||this.keys.left?1:0)}}
}
