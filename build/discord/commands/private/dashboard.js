import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandType } from "discord.js";
import { isStaff } from "functions/isStaff.js";
createCommand({
    name: "dashboard",
    description: "Menu do administrador",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const userId = interaction.user.id;
        if (!isStaff(userId)) {
            return interaction.reply({ content: "Você não tem permissão para acessar este menu.", flags });
        }
        return interaction.reply(menus.dashBoard());
    },
});
