O propósito do bot é ser o mais facil possivel para usuários leigos.

## Como usar

1. Baixe o bot
2. Coloque o token do bot no arquivo .env
3. NÃO mexa no config.json, a menos que o bot não reconheça seu id na primeira execução
4. Execute o bot

## Como atualizar

1. Baixe o bot
2. Coloque o token do bot no arquivo .env
3. NÃO mexa no config.json
4. Execute o bot

--- --- --- --- --- --- ---

É esperado que o bot reconheça seu id na primeira execução, caso não reconheça, mexa no config.json.

--- --- --- --- --- --- ---

Se o bot não funcionar, verifique se o token do bot está correto, e se o bot tem permissão para enviar mensagens no canal de logs.

## Possiveis erros:

caso no console esteja escrito "user desalowed intents" é necessário entrar no site portal do desenvolvedor e ativar os intents do bot.
o site é https://discord.com/developers/applications

especificamente na area bot, clique em "bot" e depois em "Privileged Gateway Intents" e ative os intents.

## Assim que estiver tudo funcionando, e o bot reconhecer seu id

use /dashboard para configurar o bot.
crie pelo menos um embed, para que possa configurar o botão ou select menu

---

após criar um embed use /dashboard novamente e selecione gerenciar tickets, crie ao menos um ticket, o nome do ticket é o que vai aparecer no nome do canal.

---

finalmente, após isso use /dashboard novamente, aperte em gerenciar tickets e clique em atribuir, após isso selecione o embed que deseja atribuir e o(s) ticket(s) que deseja atribuir.

---

por fim, use /dashboard pela ultima vez, aperte em gerenciar embeds, clique em enviar embed, selecione o embed que deseja enviar e clique em enviar com ticket (ou com botões caso apareça assim) e selecione o canal que deseja enviar.

## Como adicionar staffs

use /dashboard, aperte em gerenciar staffs, clique em adicionar, selecione o(s) usuário(s) que deseja adicionar e selecione o cargo que deseja adicionar e clique em adicionar.

## O que staffs podem fazer?

Moderadores: ver tickets criados
Admins: Todas de um moderador, criar embed, criar ticket.
superAdmin: Todas as permissões, exceto: transformar mais de 1 usuário em staff de uma única vez // modificar outros superAdmins