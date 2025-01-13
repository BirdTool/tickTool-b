import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { menus } from "#menus";
createResponder({
    customId: "embed/create/colors/:type",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { type }) {
        if (interaction.isButton()) {
            if (type === "return") {
                return interaction.update({ components: menus.createEmbed().components });
            }
            else {
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                embed.setColor(type);
                interaction.update({ embeds: [embed], components: menus.createEmbed().components });
            }
        }
        else {
            try {
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                const color = interaction.fields.getTextInputValue("cor");
                if (!color)
                    return interaction.reply("Você precisa informar uma cor para o embed");
                embed.setColor(color);
                interaction.update({ embeds: [embed], components: menus.createEmbed().components });
            }
            catch (error) {
                return interaction.reply("Ocorreu um erro ao definir a cor do embed, provavelmente você inseriu um código invalid, certifique-se de que ele está no formato #ffffff");
            }
        }
    },
});
