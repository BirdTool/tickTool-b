# Bot de Tickets para Discord

<p align="center">
  <img src="src/assets/logo-ticktool-b-300px.png" alt="Logo do TickTool" width="200">
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript"></a>
  <a href="https://github.com/BirdTool/tickTool-b/releases"><img src="https://img.shields.io/github/release/BirdTool/tickTool-b.svg" alt="GitHub release"></a>
  <a href="https://github.com/BirdTool/tickTool-b/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintenance"></a>
</p>

## 🚀 O que é isso?

Este é um bot de Discord feito para simplificar a vida de quem precisa gerenciar tickets de suporte. Com ele, você cria embeds bonitinhos, adiciona botões ou menus e organiza o suporte no seu servidor de um jeito prático e eficiente. Tudo isso sem complicação!

---

## 🎉 Como usar o bot

Quer colocar o bot pra rodar sem dor de cabeça? Então segue esse guia rápido e fácil:

### 📥 Instalação

1. **Baixe o bot**: Vai na [página de releases](https://github.com/BirdTool/tickTool-b/releases) e pega o `build-js.zip` da versão mais recente.
2. **Descompacte**: Extrai tudo do arquivo zipado.
3. **Token do bot**: Abre o `env.txt` com qualquer editor de texto e cola o **token** do seu bot onde tá indicado. Não tem token? Dá uma olhada [neste guia](https://discordjs.guide/preparations/setting-up-a-bot-application.html) pra criar um.
4. **Extras (opcional)**: Quer notificações de erro? Tira o `#` da linha do *webhook* no `env.txt` e coloca a URL do seu *webhook*.
5. **Hospedagem**: Entra no site da [Discloud](https://discloud.com), faz login e sobe o arquivo com o comando `.upc` ou direto pelo painel.

> **Dica**: Usa o `.upc` direitinho pra subir o arquivo sem erro!

### ⚙️ Primeiros passos

Depois de ligar o bot, ele vai te reconhecer como dono na primeira execução. Se algo der errado, dá pra ajustar o banco de dados manualmente ou pedir ajuda abrindo uma [issue](https://github.com/BirdTool/tickTool-b/issues).

- **Rápido e fácil**: Digita `/start` no Discord e o bot configura tudo sozinho.
- **Mais controle**: Usa o `/dashboard` pra abrir um painel interativo e ajustar o bot do seu jeito.

### 🎨 Criando um embed com tickets

Quer um embed personalizado pra abrir tickets? É simples:

1. Digita `/dashboard` no Discord.
2. Clica em `embed` > "Criar novo embed".
3. Escolhe título, descrição e cores pra deixar tudo com a sua cara.
4. Volta no `/dashboard`, vai em `tickets` e cria um novo ticket (ex.: "Suporte Geral").
5. Em `tickets`, seleciona "Atribuir a um embed" e escolhe o embed que você fez.
6. Em `embeds`, clica em "Enviar embed", decide se quer botões ou menu, e manda pro canal que você quiser.
7. Tá pronto! Seu embed com tickets já tá no ar! 🎉

---

## 🛠️ Pra quem curte por a mão na massa

Se você manja de código e quer mexer no bot ou ajudar no projeto, aqui vão as infos que você precisa:

### 📂 Como o projeto é organizado

Olha só como as pastas e arquivos estão estruturados:

```plaintext
└── dev-ts/
    ├── discloud.config       # Config pra hospedagem
    ├── package.json          # Dependências e scripts
    ├── readme.md             # Esse arquivo aqui!
    ├── src/                  # Onde a mágica acontece
        ├── index.ts          # Começa tudo aqui
        ├── colors.json       # Cores pra customizar
        ├── types/            # Tipos pro TypeScript
        ├── settings/         # Configurações gerais
        ├── menus/            # Menus interativos
        ├── functions/        # Funções úteis
        ├── discord/          # Integração com Discord
        ├── database/         # Banco de dados
        ├── class/            # Classes auxiliares
        └── assets/           # Imagens e afins
```

### 🧑‍💻 Quer contribuir?

Adoramos ajuda! Segue o passo a passo pra colaborar:

1. Faz um *fork* do repositório.
2. Cria um *branch* novo:
   ```bash
   git checkout -b minha-ideia-legal
   ```
3. Mete a mão no código e faz um *commit*:
   ```bash
   git commit -m "Adicionei algo incrível"
   ```
4. Envia pro GitHub:
   ```bash
   git push origin minha-ideia-legal
   ```
5. Abre um *Pull Request* e espera a gente dar uma olhada! 😊

---

## 📜 Licença

O projeto usa a [Licença MIT](LICENSE.md). Pode usar, alterar e compartilhar, só não esquece de dar crédito!

---

## 🤝 Valeu!

Um agradecimento especial ao [RinckoDev](https://github.com/rinckodev) que foi usando a base de bots de Discord dele que eu fiz essa maravilhosa source.

---

Quer criar o seu próprio bot assim como fiz o meu? Use `npx constatic@latest` e [veja esse vídeo aqui](https://youtu.be/0wkw-Vh8Ags?si=xTRG_tGzZkHkJ9JH)