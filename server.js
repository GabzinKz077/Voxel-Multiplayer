import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { WorldStore } from "./src/world-store.js";
import { RoomManager } from "./src/room-manager.js";

const app = express();
const http = createServer(app);
const io = new Server(http, { cors: { origin: "*" } });
const worldStore = new WorldStore("./data/worlds.json");
const rooms = new RoomManager(io, worldStore);

app.use(express.static("public"));
app.get("/health", (_req,res) => res.json({ ok:true, players:rooms.playerCount }));

io.on("connection", socket => rooms.attach(socket));

const port = Number(process.env.PORT || 3000);
http.listen(port, () => console.log(`Voxel Online v2 em http://localhost:${port}`));
