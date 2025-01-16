import { createEvent } from "#base";
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import path from 'path';
import { Team } from 'discord.js';
// Função para obter o ID do dono do bot
async function getBotOwnerID(client) {
    const owner = (await client.application.fetch()).owner;
    if (owner instanceof Team) {
        return owner.members.map((x) => x.id).join(", ");
    }
    else {
        return owner.id;
    }
}
// Simula __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf-8'));
const version = "0.3.3";
createEvent({
    name: "onReady",
    event: "ready",
    async run(client) {
        console.log(chalk.green("Obrigado por usar a minha source!"));
        console.log(chalk.green("Desenvolvido por ", chalk.hex("#2e2e2e")("BirdTool")));
        console.log(chalk.red("Essa cópia não está à venda! Se você comprou ela, você levou um golpe!"));
        // Caminho relativo ao arquivo atual
        const configPath = path.join(__dirname, '../data/config.json');
        try {
            // Lê o arquivo config.json
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            // Verifica se botOwnerID é "0", undefined ou não é um ID de usuário existente
            let botOwnerID = config.botOwnerID;
            if (botOwnerID === "0" || botOwnerID === undefined || !(await client.users.fetch(botOwnerID).catch(() => null))) {
                // Obtém o ID do dono do bot utilizando a função
                botOwnerID = await getBotOwnerID(client);
                if (!botOwnerID) {
                    console.error(chalk.red("Não foi possível encontrar o ID do dono do bot."));
                    return;
                }
                // Atualiza "botOwnerID" no config.json e garante que seja uma string
                config.botOwnerID = botOwnerID;
                // Escreve o novo valor no arquivo config.json
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
                console.log(chalk.green(`botOwnerID atualizado para ${botOwnerID}`));
            }
        }
        catch (error) {
            console.error(chalk.red("Erro ao ler ou atualizar o arquivo config.json:"), error);
        }
        if (version !== packageJson.version) {
            console.log(chalk.red("Package.json foi alterado! baixe a versão mais recente do bot!"));
            return;
        }
        ;
        console.log(chalk.green("Versão atual: ", chalk.underline(version)));
    },
});
