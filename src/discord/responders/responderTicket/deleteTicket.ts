import { createResponder, ResponderType } from "#base";
import { db } from "#database";

createResponder({
    customId: "ticket/delete",
    types: [ResponderType.Button],
    async run(interaction) {
        // Responde à interação imediatamente
        await interaction.reply({ content: "Excluindo ticket...", ephemeral: true });

        try {
            // Verifica se o canal ainda existe
            if (!interaction.channel) {
                return interaction.followUp({ content: "Erro: Canal não encontrado.", ephemeral: true });
            }
            
            // Remove o valor do banco de dados
            await db.guilds.delete(`ticketsExisting.${interaction.channel.id}`);

            // Exclui o canal
            await interaction.channel.delete("Ticket excluído pelo bot.");

        } catch (error) {
            console.error("Erro ao deletar o canal:", error);
            await interaction.followUp({ content: "Ocorreu um erro ao excluir o ticket.", ephemeral: true });
        }
    }
});