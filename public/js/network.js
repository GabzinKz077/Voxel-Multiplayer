export class Network{
 constructor(onEvent){this.socket=io();this.onEvent=onEvent;this.selfId=null;this.room='';this.socket.on('connect',()=>{onEvent('connected');if(this.room)this.join(this.room,this.name)});this.socket.on('disconnect',()=>onEvent('disconnected'));for(const event of ['room:state','player:joined','player:moved','player:left','room:count','block:changed','inventory:state','stats','mobs:state','player:respawn','notice'])this.socket.on(event,data=>{if(event==='room:state')this.selfId=data.selfId;onEvent(event,data)})}
 join(room,name){this.room=room;this.name=name;this.socket.emit('room:join',{code:room,name})}
 updatePlayer(player){if(this.socket.connected&&this.room)this.socket.volatile.emit('player:update',player)}
 changeBlock(x,y,z,type){this.socket.emit('block:change',{x,y,z,type})}
}
