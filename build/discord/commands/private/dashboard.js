import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandType } from "discord.js";
import Staff from "../../../class/staff.js";
createCommand({
    name: "dashboard",
    description: "Menu do administrador",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const userId = interaction.user.id;
        const staff = new Staff(interaction);
        if (!staff.hasPosition(userId, false, "moderator")) {
            return interaction.reply({ content: "Você não tem permissão para acessar este menu.", flags });
        }
        return interaction.reply(menus.dashBoard());
    },
});
