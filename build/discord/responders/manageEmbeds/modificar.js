import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
createResponder({
    customId: "manage/embed/modificar",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        return interaction.update({ components: menus.createEmbed().components });
    },
});
