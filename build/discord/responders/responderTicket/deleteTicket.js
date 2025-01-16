import { createResponder, ResponderType } from "#base";
createResponder({
    customId: "ticket/delete",
    types: [ResponderType.Button],
    async run(interaction) {
        if (!interaction.channel?.isTextBased())
            return;
        await interaction.reply({ content: "Excluindo ticket..." });
        setTimeout(async () => {
            try {
                await interaction.channel?.delete();
            }
            catch (error) {
                console.error("Erro ao deletar o canal:", error);
            }
        }, 2000);
    }
});
