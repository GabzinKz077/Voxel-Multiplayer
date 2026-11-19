import fs from "node:fs";

export class WorldStore {
  constructor(file) {
    this.file = file;
    this.worlds = {};
    try {
      if (fs.existsSync(file)) this.worlds = JSON.parse(fs.readFileSync(file,"utf8"));
    } catch (error) {
      console.error("Não foi possível ler os mundos salvos:", error.message);
    }
  }
  get(room) {
    return this.worlds[room] || {};
  }
  setBlock(room, key, type) {
    if (!this.worlds[room]) this.worlds[room] = {};
    this.worlds[room][key] = type;
    this.save();
  }
  save() {
    fs.mkdirSync(new URL("../data/", import.meta.url), {recursive:true});
    fs.writeFileSync(this.file, JSON.stringify(this.worlds));
  }
}
