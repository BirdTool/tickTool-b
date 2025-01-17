import { setupCreators } from "#base";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ButtonStyle, ButtonBuilder } from "discord.js";
import { createRow, createEmbed } from "@magicyan/discord";
import { settings } from "#settings";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
export const { createCommand, createEvent, createResponder } = setupCreators({
    commands: {
        async middleware(interaction) {
            const configPath = path.join(__dirname, './data/config.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            // verificar se o bot precisa de atualizações
            const api = await fetch("https://birdtool.github.io/apiforTicket/version.json").then(res => res.json());
            const { version, linkNewVersion } = api;
            const randomTime = Math.floor(Math.random() * 60) + 1;
            if (version !== packageJson.version) {
                setTimeout(async () => {
                    let channel = null;
                    if (config.logsChannelID && config.logsChannelID !== "0") {
                        channel = await interaction.guild?.channels.fetch(config.logsChannelID).catch(() => null);
                    }
                    ;
                    const ownerAvatar = await interaction.client.users.fetch(config.botOwnerID).then(user => user.displayAvatarURL({ extension: 'png' }));
                    const embed = createEmbed({
                        title: "Você está utilizando uma versão antiga do bot!",
                        description: `# Sistema \n \`Versão antiga do bot! Versão atual\`: **${packageJson.version}** \n\`Versão mais recente\`: **${version}** \n\`Link para baixar a versão mais recente\`: **${linkNewVersion}**`,
                        color: settings.colors.danger,
                        timestamp: new Date().toISOString(),
                        author: { name: "Versão antiga", iconURL: interaction.client.application.iconURL() || ownerAvatar },
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
                        const owner = await interaction.client.users.fetch(config.botOwnerID).catch(() => null);
                        if (owner) {
                            await owner.send({ embeds: [embed], components: [button] });
                            return;
                        }
                        // Última tentativa: enviar na onde o comando foi executado
                        interaction.followUp({ embeds: [embed], components: [button] });
                    }
                    catch (error) {
                        console.error("Não foi possível enviar o embed em nenhum canal");
                    }
                    return;
                }, randomTime * 1000);
                return;
            }
        }
    }
});
