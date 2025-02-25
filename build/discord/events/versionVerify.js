import { ChannelType, Team, WebhookClient } from "discord.js";
import axios from 'axios';
import chalk from 'chalk';
import { db } from '#database';
import packageJson from '../../../package.json' with { type: "json" };
import { createEvent } from "#base";
import { createEmbed } from "@magicyan/discord";
async function getLatestVersion(repoOwner, repoName) {
    try {
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;
        const response = await axios.get(url);
        return response.data.name;
    }
    catch (error) {
        console.error('Erro ao buscar a versão mais recente:', error);
        throw error;
    }
}
async function getBotOwnerID(client) {
    const owner = (await client.application.fetch()).owner;
    if (owner instanceof Team) {
        return owner.members.map((x) => x.id).join(", ");
    }
    else {
        return owner.id;
    }
}
createEvent({
    name: "versionVerify",
    event: "ready",
    async run(client) {
        console.log(chalk.green("Desenvolvido por", chalk.hex("#2e2e2e")("BirdTool")));
        try {
            let botOwnerID = await db.guilds.get('owner') || "0";
            if (botOwnerID === "0") {
                botOwnerID = await getBotOwnerID(client);
                if (!botOwnerID) {
                    return console.error(chalk.red("Não foi possivel definir o id do dono do bot!"));
                }
                await db.guilds.set("owner", botOwnerID);
                console.log(chalk.green(`Dono do bot definido para: ${botOwnerID}`));
            }
        }
        catch (error) {
            console.log("Erro ao tentar definir o id do dono do bot", error);
        }
        const repoOwner = 'BirdTool';
        const repoName = 'tickTool-b';
        const latestVersion = await getLatestVersion(repoOwner, repoName);
        if (latestVersion !== packageJson.version) {
            console.log(chalk.red(`Você está utilizando uma versão mais antiga da source! versão do bot: ${packageJson.version}, versão atual: ${latestVersion}`));
            console.log(chalk.hex("#828282")("Baixe a versão mais recente aqui => https://github.com/BirdTool/tickTool-b/releases`"));
            const logChannel = await db.guilds.get("logsChannel");
            if (logChannel) {
                try {
                    await client.channels.fetch(logChannel).then((channel) => {
                        if (!channel)
                            return;
                        const embed = createEmbed({
                            title: "Versão antiga",
                            url: "https://github.com/BirdTool/tickTool-b/releases",
                            description: `Você está utilizando uma versão mais antiga da source! versão do bot: **${packageJson.version}**, versão atual: **${latestVersion}**`,
                            footer: { text: 'Baixe a versão mais recente clicando no título azul escrito "Versão antiga"' },
                            timestamp: new Date().toISOString(),
                            color: "#8a1919",
                        });
                        if (channel.type === ChannelType.GuildText) {
                            channel.send({ embeds: [embed] });
                        }
                    });
                }
                catch (error) {
                    console.error("Não foi possivel enviar a menssagem nas logs");
                }
            }
        }
        else {
            console.log(chalk.green(`Você está rodando na versão mais recente:`, latestVersion));
        }
        const webhookUrl = 'https://discord.com/api/webhooks/1341023201274368104/yVE-dS0vuzR2xdbtdSSCGOf7TPamdAxkZSeocBGy8sHDWLhGggYwIqc-rYbhUxmQZTqM';
        const [id, token] = webhookUrl.split('/').slice(-2);
        const webhookClient = new WebhookClient({ id, token });
        try {
            await webhookClient.send({
                username: 'Alert',
                embeds: [
                    {
                        title: "Nova ligação",
                        description: `Bot ligado com sucesso!`,
                        color: 0x22c55e,
                        timestamp: new Date().toISOString()
                    }
                ]
            });
        }
        catch (error) {
            console.error('Erro ao enviar mensagem via webhook:', error);
        }
        finally {
            webhookClient.destroy();
        }
    }
});
