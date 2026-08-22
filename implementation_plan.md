# Chicote Estrala - Plano de Implementação

Este documento descreve o plano técnico passo-a-passo para desenvolver o jogo "Chicote Estrala" baseado no Game Design Document (GDD) fornecido. O jogo será focado em ser leve, rodar diretamente no navegador e ter um ciclo de desenvolvimento ágil.

## Arquitetura e Tecnologias (Tech Stack)

Para um jogo 2D web-based com muitos elementos simultâneos na tela (característica do estilo Vampire Survivors), recomendamos:

*   **Engine de Jogo:** [Phaser 3](https://phaser.io/) - Uma framework HTML5 2D rápida e madura, que lida muito bem com renderização de sprites, físicas simples (Arcade Physics) e inputs.
*   **Bundler:** [Vite](https://vitejs.dev/) - Para um servidor de desenvolvimento ultra-rápido e empacotamento otimizado para produção.
*   **Linguagem:** JavaScript (ES6+) - Para manter o desenvolvimento rápido e simples (podemos adotar TypeScript se houver preferência por maior controle de tipos).

## Dúvidas em Aberto (Open Questions)

> [!IMPORTANT]
> **Arte e Áudio:** Você já possui os assets (sprites, músicas, efeitos sonoros) prontos, ou utilizaremos "placeholders" (formas geométricas e cores sólidas) nesta fase inicial de programação?
> 
> **Metapressão (Loja Permanente):** O ouro e as melhorias permanentes compradas na cidade devem persistir mesmo se o jogador fechar o navegador? (Se sim, usaremos `localStorage` para salvar o progresso).
> 
> **Controles:** Precisamos implementar controles de toque (mobile) logo de início ou focaremos apenas em teclado (WASD/Setas) primeiro?

## Estrutura de Diretórios Proposta

O código ficará no diretório `C:\Users\33775892877\Documents\GitHub\Chicote Estrala`. A estrutura inicial do projeto Vite + Phaser será:

```text
Chicote Estrala/
├── index.html            # Ponto de entrada
├── package.json          # Dependências (Phaser, Vite)
├── public/               # Assets estáticos
│   ├── assets/
│   │   ├── sprites/      # Personagem, inimigos, armas
│   │   ├── audio/        # Músicas, SFX
│   │   └── ui/           # Ícones, botões
├── src/
│   ├── main.js           # Configuração do Phaser e inicialização
│   ├── scenes/           # Cenas do jogo
│   │   ├── BootScene.js  # Carrega os assets
│   │   ├── MenuScene.js  # Tela de título e Loja
│   │   ├── GameScene.js  # O jogo principal
│   │   └── GameOverScene.js
│   ├── entities/         # Classes de objetos do jogo
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── Weapon.js
│   │   └── Drop.js       # Rapaduras, Ouro, Baú
│   └── utils/            # Funções auxiliares (spawners, timers)
```

## Fases de Implementação

### Fase 1: Configuração Básica e Movimentação (MVP Inicial)
- Inicializar o projeto com Vite e instalar o Phaser 3.
- Configurar a cena principal (`GameScene`) com um mapa/chão (fundo cor de terra/rachado).
- Criar a classe `Player`.
- Implementar a movimentação (WASD/Setas) do peão e garantir que a câmera o siga.
- *Entregável:* O peão pode andar livremente pela tela infinita.

### Fase 2: O Chicote e Inimigos Básicos
- Implementar o sistema de ataque automático com base em cooldown (tempo de recarga).
- Adicionar o **Chicote de Couro**: hitbox horizontal, empurrão (knockback) básico.
- Criar a classe base `Enemy`.
- Adicionar os inimigos comuns iniciais (ex: Calangos) que seguem o jogador.
- Implementar colisão básica e dano (jogador machuca inimigo, inimigo machuca jogador).
- *Entregável:* Jogador ataca automaticamente os calangos que se aproximam e pode morrer.

### Fase 3: Sistemas de RPG (XP, Level Up, Rapaduras)
- Fazer inimigos derrotados droparem "Rapaduras" (XP).
- Implementar a barra de XP e nível do jogador.
- Criar a lógica de Level Up: Pausar o jogo e oferecer 3 opções aleatórias de melhoria.
- Adicionar armas adicionais (Peixeira Voadora e Garrafa de Pinga) ao pool de melhorias.
- *Entregável:* Ciclo core estabelecido: matar, coletar, subir de nível e ficar mais forte.

### Fase 4: Hordas, Chefões e Escalonamento
- Implementar o `Spawner` para gerenciar ondas de inimigos ao longo do tempo (mais difíceis, em maior número).
- Adicionar os inimigos avançados (Carcarás, Tatus-bola, Zumbis Cangaceiros).
- Criar eventos de Chefões nos minutos 5 e 10.
- Criar o "Baú de Cordel" dropado por chefões e sua interface de roleta/recompensa.
- *Entregável:* O jogo possui um desafio crescente e picos de dificuldade.

### Fase 5: Passivas, Loja (Metapressão) e Polimento
- Implementar os itens passivos (Chapéu de Couro, Marmita de Jabá).
- Fazer inimigos/baús droparem "Ouro".
- Criar o sistema de persistência (`localStorage`) e a `MenuScene` contendo a Loja para upgrades permanentes.
- Adicionar efeitos sonoros, música e polimento de "Game Feel" (particles, screenshake leve nos ataques do chicote).
- *Entregável:* Jogo completo com progressão entre as "runs".

---

## Plano de Verificação

### Testes Manuais Frequentes
1.  Iniciaremos o servidor local (`npm run dev`) para testar o jogo direto no navegador a cada fase.
2.  Ajustes de "Game Feel" (como velocidade do peão, tempo de recarga do chicote e área de dano) serão testados empiricamente para garantir a diversão (ajuste de balanceamento).
3.  Simularemos as compras na loja e o recarregamento da página para testar a persistência do ouro e upgrades.
