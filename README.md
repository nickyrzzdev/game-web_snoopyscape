# 🔫 TriggerHell

> Top-down shooter 2D em HTML5 inspirado em **Berzerk** e **Enter the Gungeon**, feito com **Excalibur.js** e **TypeScript**.

[![Deploy](https://github.com/nickyrzzdev/game-web_triggerhell/actions/workflows/deploy.yml/badge.svg)](https://github.com/nickyrzzdev/game-web_triggerhell/actions)

🎮 **Jogue online:** https://nickyrzzdev.github.io/game-web_triggerhell/

---
 
## 📖 Sobre o jogo

Você está preso num labirinto cheio de robôs. Atire para sobreviver, esquive no último segundo e não fique parado por muito tempo: um chefe indestrutível, inspirado no **Evil Otto** do clássico Berzerk, aparece para te caçar.

O jogo mistura a tensão dos labirintos e robôs perseguidores de **Berzerk** com a mobilidade e o ritmo intenso de **Enter the Gungeon** (rolamento de esquiva com frames de invulnerabilidade e projéteis dinâmicos).

Projeto desenvolvido como **trabalho acadêmico** por uma equipe de 3 pessoas, com foco em boas práticas de versionamento (branches, Pull Requests e GitHub Projects) e deploy automático.

**Referências de gameplay**
- Berzerk: https://www.youtube.com/watch?v=ELE24jchei4
- Enter the Gungeon: https://www.youtube.com/watch?v=U5r6mUaKnDY

---

## ✨ Funcionalidades

Legenda: ✅ pronto · 🚧 em desenvolvimento · 📝 planejado

| Status | Funcionalidade |
|:--:|---|
| 📝 | Engine, cenas (Menu / Jogo / Game Over) e física top-down |
| 📝 | Movimentação em 8 direções (WASD / setas) |
| 📝 | Tiro do jogador com projéteis |
| 📝 | Colisões (projétil × parede, projétil × inimigo, jogador × inimigo) |
| 📝 | Robôs inimigos que perseguem o jogador |
| 📝 | Ondas de inimigos (spawner) |
| 📝 | Esquiva (**dodge roll**) com frames de invulnerabilidade |
| 📝 | Chefe indestrutível estilo **Evil Otto** |
| 📝 | HUD com vida e pontuação |
| 📝 | Efeitos sonoros e partículas |

> Atualize esta tabela conforme as tarefas forem sendo concluídas.

---

## 🕹️ Controles (previstos)

| Ação | Tecla |
|---|---|
| Mover | `W` `A` `S` `D` ou setas |
| Atirar | A definir (mouse ou teclas) |
| Esquivar (dodge roll) | A definir (ex.: `Espaço`) |

---

## 🛠️ Tecnologias

- [Excalibur.js](https://excaliburjs.com/): engine de jogos 2D em TypeScript
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/): servidor de desenvolvimento e build
- [GitHub Actions](https://docs.github.com/actions) + [GitHub Pages](https://pages.github.com/): deploy automático

---

## 🚀 Como rodar localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18 ou superior e Git.

```bash
# 1. Clonar
git clone https://github.com/nickyrzzdev/game-web_triggerhell.git
cd game-web_triggerhell

# 2. Instalar dependências
npm install

# 3. Rodar em modo desenvolvimento
npm run dev

# 4. Gerar o build de produção (pasta dist/)
npm run build
```

Depois do `npm run dev`, abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

---

## 📁 Estrutura de pastas (prevista)

```
.
├── public/
│   └── assets/          # sprites, sons e demais arquivos estáticos
├── src/
│   ├── actors/          # Player, Enemy, Bullet, Boss...
│   ├── scenes/          # MenuScene, GameScene, GameOverScene
│   ├── config/          # constantes (velocidades, cooldowns, grupos de colisão)
│   ├── ui/              # HUD
│   └── main.ts          # ponto de entrada (Engine)
├── .github/
│   └── workflows/
│       └── deploy.yml   # deploy no GitHub Pages
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 👥 Equipe e divisão de tarefas

| Integrante | Papel | Responsabilidades |
|---|---|---|
| **Nicole** | Líder do projeto (complexidade alta) | Engine/Scenes/Physics, máquina de estados e dodge roll, IA do chefe, repositório, CI/CD e revisão de PRs |
| **Erick** | Desenvolvedor (complexidade média) | Tiro e projéteis, colisões, IA de perseguição, spawner de ondas, efeitos sonoros e partículas |
| **Gabriel** | Desenvolvedor (complexidade fácil) | Entrada do jogador, movimentação, HUD, carregamento de assets e organização do GitHub Projects |

O acompanhamento das tarefas é feito no **GitHub Projects** do repositório (colunas *To Do*, *In Progress* e *Done*).

---

## 🔀 Fluxo de trabalho com Git

> ## 🚨 É PROIBIDO fazer commit direto na branch `main`.
> Todo código entra por **branch → Pull Request → revisão → merge**.

1. Atualize a `main`: `git checkout main && git pull origin main`
2. Crie sua branch: `git checkout -b feat/nome-da-tarefa`
3. Faça commits pequenos e claros: `git commit -m "feat: descreve o que foi feito"`
4. Envie a branch: `git push -u origin feat/nome-da-tarefa`
5. Abra um **Pull Request**, vincule a issue (`Closes #número`) e marque a **Nicole** como revisora
6. Após a aprovação e o merge, apague a branch e comece a próxima tarefa

**Prefixos de branch:** `feat/` (funcionalidade) · `fix/` (correção) · `ci/` (pipeline) · `docs/` (documentação)

**Prefixos de commit:** `feat:` · `fix:` · `chore:` · `docs:`

Antes de abrir o PR, rode `npm run build` para garantir que o projeto compila.

---

## 🌐 Deploy

O deploy é automático: a cada merge na `main`, o **GitHub Actions** faz o build e publica no **GitHub Pages**.

> No `vite.config.ts`, mantenha `base: '/game-web_triggerhell/'` para os assets carregarem corretamente no Pages.

---

## 📚 Referências

- [Documentação do Excalibur.js](https://excaliburjs.com/docs)
- [Documentação do Vite](https://vitejs.dev/guide/)
- [GitHub Pages](https://docs.github.com/pages)
- [GitHub Projects](https://docs.github.com/issues/planning-and-tracking-with-projects)

---

## 📄 Licença

Projeto acadêmico. Defina aqui a licença, se for o caso (ex.: MIT).
