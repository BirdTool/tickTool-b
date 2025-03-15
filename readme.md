# Bot de Tickets Para discord
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
[![GitHub release](https://img.shields.io/github/release/BirdTool/tickTool-b.svg)](https://GitHub.com/BirdTool/tickTool-b/releases/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/BirdTool/tickTool-b/graphs/commit-activity)

## Gerencie tickets no Discord de forma simples e eficiente!

Um bot de tickets personalizavel que é possivel criar seus próprios embeds de maneira fácil e atribuir facilmente um botão ou selectMenu

---

Foi construido utilizando typescript utilizando a base do [RinckoDev](https://github.com/rinckodev)

---

Foi pensado para usuários mais leigos, apenas necessita de por o token em um arquivo [`env.txt`](https://github.com/BirdTool/tickTool-b/blob/main/env.txt)

Para desenvolvedores que baixarem a versão typescript o arquivo env é `.env`

---

## Instrução de instalação

### Utilizando terminal:

#### Requisitos:

1. Tenha o git baixado
2. Execute esse comando dentro do diretório preferido

``` bash
git clone https://github.com/BirdTool/tickTool-b
```

3. Modifique ou faça o que quiser com o código

### Baixando no GitHub:

#### Requisitos:
- Ter algum descompactador zip baixado no seu sistema
- #### Compactores recomendados:
- - Zarchiever (celular)
- - Winhar (windows)
- - 7-zip (linux e windows)

No linux se você baixar a versão `tar.gz` não será necessário o descompactador

Tenha a **Atenção** que a versão source será a versão de desenvolvedor, se você quer baixar a versão buildada(para quem só quer usar o bot) baixe `build-js.zip`

#### Passos:

1. Acesse a página aonde está todas as [versões do repositório](https://github.com/BirdTool/tickTool-b/releases)
2. Escolha a versão, você pode escolher entre a versão beta mais recente (se houver) ou a versão estável mais recente
3. Selecione "`build-js.zip`" ou se você é um desenvolvedor baixe a versão "`dev-ts.zip`"
4. Descompacte o arquivo
5. Use como quiser

## Instrução de uso

#### Como ligar
1. Coloque o seu token no arquivo `env.txt` / ou se você baixou a versão dev: `.env`.
2. Use `npm install` para instalar as dependências.
3. Use `npm run start` para ligar o bot / ou se você baixou a versão dev use `npm run dev`.

Assim que ligado, o bot reconhecerá seu id na primeira ligação, caso contrário, modifique manualmente a database ou crie uma [issues](https://github.com/BirdTool/tickTool-b/issues) pedindo ajuda.

Use `/dashboard` para ver o que você pode fazer.

#### Criar um embed e atribuir um ticket a ele:

1. Use `/dashboard` e selecione `embed`, e após isso pressione para criar um novo embed.
2. Faça as alterações desejadas no embed.
3. Após criar o embed use `/dashboard` novamente e selecione `tickets`, e selecione criar um novo ticket.
4. Configure o ticket como desejar e salve ele.
5. Use `/dashboard` novamente e selecione `tickets` de novo, e selecione `Atribuir a um embed` e faça como pedir.
6. Use `/dashboard` e selecione `embeds` e após isso, enviar embed.
7. Selecione o embed desejado, escolha entre: `Enviar sem botões ou menu` ou `Enviar com botões ou menu`, e depois selecione o canal desejado.
8. Tudo pronto! seu embed foi enviado ao canal selecionado com a(as) opções de ticket

## Contribuição

Contribuições são bem-vindas! Se você deseja contribuir, siga estas etapas:

1. Faça um fork do repositório.
2. Crie um branch com a sua feature ou correção de bug:  
   ```bash
   git checkout -b minha-feature
3. faça as alterações e commit:
    ```bash
    git commit -m "Adicionando nova funcionalidade"
    ```
4. Envie para o repositório remoto:
    ```bash
    git push origin minha-feature
    ```
