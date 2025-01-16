import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createEmbed } from "@magicyan/discord";
import { settings } from "#settings";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
export async function logChannel(interaction, title, description, author, authorURL) {
    const channel = await interaction.client.channels.fetch(config.logsChannelID);
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
