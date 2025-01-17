import { createEvent } from "#base";
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import path from 'path';
import { ButtonBuilder, ButtonStyle, Team } from 'discord.js';
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
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
const { version, linkNewVersion } = await fetch("https://birdtool.github.io/apiforTicket/version.json").then(res => res.json());
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
                console.log(chalk.hex("#ff87bf")("O bot será reiniciado para evitar erros após atualizar o botOwnerID!"));
                console.log(chalk.hex("#ff87bf")("Por favor ligue o bot novamente..."));
                console.log(chalk.hex("#ff87bf")("Desligando..."));
                // esperar 5 segundos e desligar o bot
                setTimeout(() => {
                    process.exit(0);
                }, 5000);
            }
        }
        catch (error) {
            console.error(chalk.red("Erro ao ler ou atualizar o arquivo config.json:"), error);
        }
        if (version !== packageJson.version) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const ownerAvatar = await client.users.fetch(config.botOwnerID).then(user => user.displayAvatarURL({ extension: 'png' }));
            console.log(chalk.red("Você está utilizando uma versão antiga do bot! baixe a versão mais recente do bot!"));
            console.log(chalk.red("Versão atual: ", chalk.underline(packageJson.version)));
            console.log(chalk.red("Versão mais recente: ", chalk.underline(version)));
            console.log(chalk.red("Link para baixar a versão mais recente: ", chalk.underline(linkNewVersion)));
            // Verifica se o canal de logs existe e é válido
            let channel = null;
            if (config.logsChannelID && config.logsChannelID !== "0") {
                channel = await client.channels.fetch(config.logsChannelID).catch(() => null);
            }
            const embed = createEmbed({
                title: "Você está utilizando uma versão antiga do bot!",
                description: `# Sistema \n \`Versão antiga do bot! Versão atual\`: **${packageJson.version}** \n\`Versão mais recente\`: **${version}** \n\`Link para baixar a versão mais recente\`: **${linkNewVersion}**`,
                color: settings.colors.danger,
                timestamp: new Date().toISOString(),
                author: { name: "Versão antiga", iconURL: client.application.iconURL() || ownerAvatar },
                url: linkNewVersion
            });
            const button = createRow(new ButtonBuilder({
                label: "Clique aqui",
                url: linkNewVersion,
                style: ButtonStyle.Link
            }));
            // Tenta enviar a mensagem em ordem de prioridade
            try {
                if (channel?.isTextBased()) {
                    await channel.send({ embeds: [embed], components: [button] });
                    return;
                }
                // Tenta enviar para o dono do bot
                const owner = await client.users.fetch(config.botOwnerID).catch(() => null);
                if (owner) {
                    await owner.send({ embeds: [embed], components: [button] });
                    return;
                }
                // Última tentativa: enviar em qualquer canal de texto disponível
                for (const guild of client.guilds.cache.values()) {
                    const textChannels = guild.channels.cache.filter(ch => ch.isTextBased());
                    if (textChannels.size > 0) {
                        const randomChannel = textChannels.random();
                        try {
                            await randomChannel.send({ embeds: [embed], components: [button] });
                            break;
                        }
                        catch {
                            continue;
                        }
                    }
                }
            }
            catch (error) {
                console.error("Não foi possível enviar o embed em nenhum canal");
            }
            return;
        }
        console.log(chalk.green("Versão atual: ", chalk.underline(version)));
    },
});
