# Voxel Online v3 — multiplayer e sobrevivência (protótipo)

## Publicar sem terminal no PC
1. Extraia o ZIP. No GitHub, abra o repositório do jogo, remova/substitua os arquivos antigos e envie o conteúdo EXTRAÍDO deste ZIP (não o ZIP em si). Verifique `package.json` e `server.js` na raiz.
2. No Render, use o mesmo Web Service conectado ao repositório. A publicação automática começa após o commit; se necessário, use Manual Deploy > Deploy latest commit.
3. Mantenha Build Command `npm install` e Start Command `npm start`.
4. Abra o link `.onrender.com` e compartilhe com amigos. Use o mesmo código de sala.

## Novidades
- Mundo de voxels coerente: árvores consultáveis, blocos removidos mantidos como `air`, chunks atualizados nas bordas e raycast por ID de instância.
- Física AABB básica, colisão lateral e vertical, gravidade, pulo.
- Inventário com barra rápida, seleção, contagem, drops ao quebrar blocos, colocar consumindo item.
- Receitas: madeira -> tábuas, tábuas -> gravetos, graveto + pedra -> espada.
- Animais passivos (vaca, ovelha, porco) e hostis (lobo, zumbi), dano, morte e drops creditados ao atacante.
- Vida, fome, comer maçã/carne, ataque de hostis e respawn.
- Luz e tonemapping ajustados.

## Controles
WASD, espaço, arrastar mouse para olhar, duplo clique para quebrar ou atacar, botão direito para colocar, E inventário, F comer, 1-9 hotbar. No celular, botões de movimento, pulo, quebrar e colocar.

## Limitações importantes
- É uma versão experimental, não um Minecraft completo. Ainda não há texturas detalhadas, animações avançadas, fornalha, baús ou IA com pathfinding.
- Inventário, fome e vida são mantidos pelo servidor enquanto conectado, mas **não são persistidos entre entradas**. Blocos são salvos em `data/worlds.json`, armazenamento local efêmero no Render Free.
- A física e os ataques de blocos são simplificados e devem ser testados no servidor real; ainda não há anti-cheat completo.
- O multiplayer precisa de um servidor Node.js online; o jogador final só usa o navegador.
- As bibliotecas Three.js são carregadas por CDN, portanto é necessária conexão com a internet.
