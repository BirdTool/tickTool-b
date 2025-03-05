import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandType } from "discord.js";
createCommand({
    name: "tutorial",
    description: "aprenda a usar o bot",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        return interaction.reply(menus.tutorial());
    }
});
