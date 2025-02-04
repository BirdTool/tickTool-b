import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
createResponder({
    customId: "manageEmbedColor/newColor/:hex",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { hex }) {
        if (hex === "modal") {
        }
        const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
        embed.setColor(hex);
    },
});
