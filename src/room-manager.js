const BLOCKS = new Set(["air","grass","dirt","stone","wood","leaves","sand"]);
const clamp = (n,min,max) => Math.max(min,Math.min(max,Number(n)||0));

export class RoomManager {
  constructor(io, store) {
    this.io = io;
    this.store = store;
    this.rooms = new Map();
  }
  get playerCount() {
    let count = 0;
    for (const room of this.rooms.values()) count += room.players.size;
    return count;
  }
  getRoom(code) {
    if (!this.rooms.has(code)) this.rooms.set(code,{players:new Map()});
    return this.rooms.get(code);
  }
  attach(socket) {
    let roomCode = null;
    socket.on("room:join", ({code,name}={}) => {
      code = String(code || "MUNDO1").trim().toUpperCase().replace(/[^A-Z0-9_-]/g,"").slice(0,16) || "MUNDO1";
      name = String(name || "Jogador").trim().slice(0,16) || "Jogador";
      if (roomCode) this.leave(socket,roomCode);
      roomCode = code;
      const room = this.getRoom(code);
      const player = {id:socket.id,name,x:0,y:2.2,z:0,yaw:0,color:Math.floor(Math.random()*0xffffff)};
      room.players.set(socket.id,player);
      socket.join(code);
      socket.emit("room:state",{
        selfId:socket.id,
        players:[...room.players.values()],
        blocks:this.store.get(code)
      });
      socket.to(code).emit("player:joined",player);
      this.io.to(code).emit("room:count",room.players.size);
    });

    socket.on("player:update", data => {
      if (!roomCode) return;
      const room = this.rooms.get(roomCode);
      const p = room?.players.get(socket.id);
      if (!p || !data) return;
      p.x=clamp(data.x,-256,256); p.y=clamp(data.y,0,100); p.z=clamp(data.z,-256,256);
      p.yaw=clamp(data.yaw,-1000,1000);
      socket.to(roomCode).volatile.emit("player:moved",p);
    });

    socket.on("block:change", data => {
      if (!roomCode || !data) return;
      const x=Number(data.x),y=Number(data.y),z=Number(data.z),type=String(data.type);
      if (![x,y,z].every(Number.isInteger) || [x,y,z].some(v=>Math.abs(v)>256) || !BLOCKS.has(type) || y<0 || y>128) return;
      const room=this.rooms.get(roomCode);
      const p=room?.players.get(socket.id);
      if (!p) return;
      const dx=x-p.x,dy=y-(p.y-1),dz=z-p.z;
      if (dx*dx+dy*dy+dz*dz>64) return;
      const key=`${x},${y},${z}`;
      this.store.setBlock(roomCode,key,type);
      this.io.to(roomCode).emit("block:changed",{x,y,z,type});
    });

    socket.on("disconnect",()=>{if(roomCode)this.leave(socket,roomCode)});
  }
  leave(socket,code) {
    const room=this.rooms.get(code);
    if (!room) return;
    room.players.delete(socket.id);
    socket.to(code).emit("player:left",socket.id);
    this.io.to(code).emit("room:count",room.players.size);
    socket.leave(code);
    if (!room.players.size) this.rooms.delete(code);
  }
}
