import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
createResponder({
    customId: "manage/embeds/criar",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        return interaction.update(menus.createEmbed());
    },
});
