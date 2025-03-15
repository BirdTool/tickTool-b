import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "help",
    description: "ajuda nos comandos",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const embed = createEmbed({
            title: "Comandos",
            fields: [
                { name: "Staff", value: `- **/dashboard** (\`Painel que contém tudo que um admin pode fazer\`)
                 - **/sudo** (\`Comandos que apenas o dono pode fazer, ele pode listar a db, modificar e excluir valores, é um comando perigoso então só use se você sabe o que está fazendo.\`)` 
                },
                { name: "Outros", value: `- **/help** (\`Mostra todos os comandos disponíveis\`)
                 - **/github** (\`Mostra o link do repositório do bot, e aonde você pode ajuda/sugestões/reportar bug para a source\`)` 
                }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: interaction.client.user?.displayName, iconURL: interaction.client.user?.displayAvatarURL() },
            color: settings.colors.primary
        });

        await interaction.reply({ embeds: [embed] });
    }
});