import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
createCommand({
    name: "embed",
    description: "modificações de embed",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "criar",
            description: "criar um embed",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "modificar",
            description: "modificar um embed",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "deletar",
            description: "deletar um embed",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    async run(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "criar": {
                const embedMenu = menus.menuEmbed();
                return await interaction.reply(embedMenu);
            }
        }
    }
});
