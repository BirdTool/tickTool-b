import { createResponder, ResponderType } from "#base";
import Staff from "../../../class/staff.js";
import { db } from "#database";
createResponder({
    customId: "set/:action",
    types: [ResponderType.ChannelSelect], cache: "cached",
    async run(interaction, { action }) {
        const staff = new Staff(interaction);
        if (!staff.hasPosition(interaction.user.id, { positionChoiced: "superAdmin" })) {
            return interaction.reply({ content: "Você não é um Super Admin ou superior!", flags });
        }
        ;
        if (action === "logsChannelID") {
            const choice = interaction.values[0];
            if (!choice)
                return interaction.reply({ content: "Selecione um canal de logs!", flags });
            await db.guilds.set("logsChannel", choice);
            return interaction.reply({ content: "Canal de logs selecionado com sucesso!", flags });
        }
        else {
            return interaction.reply({ content: "Esta interação não existe!", flags });
        }
    },
});
