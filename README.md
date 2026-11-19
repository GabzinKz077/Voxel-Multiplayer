# Voxel Online v2 — arquitetura modular

## Requisitos
- Node.js 18+
- Conexão com internet para carregar Three.js pelo CDN

## Instalação
1. Extraia o ZIP.
2. Abra o terminal na pasta do projeto.
3. Rode `npm install`.
4. Rode `npm start`.
5. Abra `http://localhost:3000`.

## Multiplayer
- Para teste local, abra o endereço acima.
- Para jogar na mesma rede, outros dispositivos acessam `http://IP-DO-PC:3000`.
- Para jogar pela internet, hospede a aplicação em um serviço compatível com Node.js e compartilhe o endereço público.
- Todos entram com o mesmo código de sala.

## Controles
PC: WASD, espaço, arrastar botão esquerdo para olhar, duplo clique para quebrar, botão direito para colocar, 1/2/3 selecionam blocos.
Celular: direcional virtual, arrastar a tela para olhar e botões de pular/quebrar/colocar.

## Organização
- `server.js`: inicialização do servidor.
- `src/room-manager.js`: salas, jogadores e validação básica de alterações.
- `src/world-store.js`: persistência simples dos blocos alterados em JSON.
- `public/js/world.js`: geração procedural por chunks com InstancedMesh.
- `public/js/player.js`: movimento local.
- `public/js/remotes.js`: jogadores remotos.
- `public/js/input.js`: teclado, mouse e toque.
- `public/js/network.js`: eventos multiplayer.
- `public/js/main.js`: inicialização e integração.

## O que esta versão já entrega
- Base modular, com módulos separados.
- Salas multiplayer e sincronização de posição.
- Construção/mineração sincronizada e salva no servidor.
- Geração de terreno por chunks e instanciamento de blocos.
- Controles para PC e celular.
- Limite de pixel ratio e renderização sem sombras em tempo real para aliviar GPUs móveis.

## Limitações desta versão
É uma base jogável em evolução, não um survival completo ainda. O servidor valida posições de forma básica e alterações de blocos por distância, mas ainda não tem anti-cheat robusto, autenticação, inventário/vida/animais/monstros sincronizados nem salvamento de personagens. O terreno procedural é gerado no cliente; os blocos alterados são persistidos no servidor. O sistema de chunks usa uma versão inicial de rebuild por setor e pode ser evoluído para meshing por faces visíveis.
