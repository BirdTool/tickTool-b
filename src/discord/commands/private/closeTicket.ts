import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, ThreadChannel } from "discord.js";
import { createCommand } from "#base";
import { createEmbed, createRow } from "@magicyan/discord";
import { db } from "#database";
import { settings } from "#settings";

createCommand({
    name: "fechar",
    description: "Fecha o ticket atual",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.deferReply({});

        // Verifica se o canal é uma thread (tópico)
        if (!interaction.channel || (interaction.channel.type !== ChannelType.PublicThread && interaction.channel.type !== ChannelType.PrivateThread)) {
            return interaction.editReply({ content: "Esse comando só pode ser usado em um tópico (thread)!" });
        }

        const thread = interaction.channel as ThreadChannel;

        // Obtém o dono do ticket do banco de dados
        const ticketOwner = await db.guilds.get<string>(`ticketsExisting.${thread.id}`);
        if (!ticketOwner) {
            return interaction.editReply({ content: "Esse tópico não é um ticket!" });
        }

        // Remove o membro da thread (fecha o ticket para ele)
        await thread.members.remove(ticketOwner);

        const embed = createEmbed({
            title: "Ticket fechado",
            description: "O ticket foi fechado com sucesso!",
            author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() || undefined },
            color: settings.colors.danger
        });

        const row = createRow(
            new ButtonBuilder({
                customId: "ticket/transcript",
                label: "Transcrever o ticket",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: "ticket/delete",
                label: "Excluir Ticket",
                style: ButtonStyle.Danger
            })
        );

        return interaction.editReply({ embeds: [embed], components: [row] });
    }
});