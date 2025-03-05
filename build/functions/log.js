import { createEmbed } from "@magicyan/discord";
import { settings } from "#settings";
import { db } from "#database";
export async function logChannel(interaction, title, description, author, authorURL) {
    const logChannel = await db.guilds.get("logsChannel");
    if (!logChannel)
        return console.error(`Não foi encontrado um canal para enviar as logs, informações das logs: title: ${title}, description: ${description}, author: ${author}`);
    const channel = await interaction.client.channels.fetch(logChannel);
    if (!channel?.isTextBased())
        return;
    const embed = createEmbed({
        title: title,
        description: description,
        color: settings.colors.danger,
        timestamp: new Date().toISOString(),
        author: { name: author, iconURL: authorURL }
    });
    try {
        await channel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error(error);
    }
}
