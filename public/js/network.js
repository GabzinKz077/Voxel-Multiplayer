export class Network {
 constructor(onEvent){this.socket=io();this.onEvent=onEvent;this.selfId=null;this.room="";this.socket.on("connect",()=>onEvent("connected"));this.socket.on("disconnect",()=>onEvent("disconnected"));
  for(const event of ["room:state","player:joined","player:moved","player:left","room:count","block:changed"])this.socket.on(event,data=>{if(event==="room:state")this.selfId=data.selfId;onEvent(event,data)});
 }
 join(room,name){this.room=room;this.socket.emit("room:join",{code:room,name})}
 updatePlayer(player){if(this.socket.connected)this.socket.volatile.emit("player:update",player)}
 changeBlock(x,y,z,type){this.socket.emit("block:change",{x,y,z,type})}
}
