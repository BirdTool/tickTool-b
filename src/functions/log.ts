import { Interaction, TextChannel } from "discord.js";
import { createEmbed } from "@magicyan/discord";
import { settings } from "#settings";
import { db } from "#database";

export async function logChannel(interaction: Interaction, title: string, description: string, author: string, authorURL: string) {
    const logChannel = await db.guilds.get<string>("logsChannel");
    if (!logChannel) return console.error(`Não foi encontrado um canal para enviar as logs, informações das logs: title: ${title}, description: ${description}, author: ${author}`);
    const channel = await interaction.client.channels.fetch(logChannel);
    if (!channel?.isTextBased()) return;

    const embed = createEmbed({
        title: title,
        description: description,
        color: settings.colors.danger,
        timestamp: new Date().toISOString(),
        author: { name: author, iconURL: authorURL }
    })
    try {
        await (channel as TextChannel).send({ embeds: [embed] });
    } catch (error) {
        console.error(error);
    }
}
