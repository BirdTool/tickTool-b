import { createResponder, ResponderType } from "#base";
import * as menus from "#menus";
createResponder({
    customId: "dashboard/return/:local",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { local }) {
        // Verifica se o menu existe em menus.menus
        if (typeof menus.menus[local] === "function") {
            // Chama o menu correspondente
            const menuS = menus.menus[local]();
            return interaction.update(menuS);
        }
        else {
            // Envia uma mensagem de erro caso o menu não exista
            return interaction.reply({
                content: `O menu "${local}" não foi encontrado.`,
                ephemeral: true,
            });
        }
    },
});
