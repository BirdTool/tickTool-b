import { createResponder, ResponderType } from "#base";
import { db } from "#database";
createResponder({
    customId: "ticket/delete",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.reply({ content: "Excluindo ticket..." });
        setTimeout(async () => {
            try {
                await interaction.channel?.delete();
                await db.guilds.delete(`ticketsExisting.${interaction.channel?.id}`);
            }
            catch (error) {
                console.error("Erro ao deletar o canal:", error);
            }
        }, 2000);
    }
});
