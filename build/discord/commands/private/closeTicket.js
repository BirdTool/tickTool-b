import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType } from "discord.js";
import { createCommand } from "#base";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
createCommand({
    name: "fechar",
    description: "Fecha o ticket atual",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const configPath = path.resolve(__dirname, '../../../discord/data/config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        await interaction.deferReply({});
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return interaction.editReply({ content: "Este comando só pode ser usado em canais de texto!" });
        }
        const channel = interaction.channel;
        const channelName = channel.name;
        // Verifica se o canal é um ticket  
        const ticketType = Object.values(config.ticketsManage || {}).find(ticket => channelName.toLowerCase().startsWith(ticket.ticketname.toLowerCase()));
        if (!ticketType) {
            return interaction.editReply({ content: "Este canal não é um ticket!" });
        }
        // Encontra o dono do ticket (primeira permissão que não é staff)
        const ticketOwner = channel.permissionOverwrites.cache
            .find(perm => !config.superAdmins.includes(perm.id) &&
            !config.admins.includes(perm.id) &&
            !config.moderators.includes(perm.id) &&
            perm.id !== channel.guild.id);
        if (!ticketOwner) {
            return interaction.editReply({ content: "Não foi possível encontrar o dono do ticket!" });
        }
        // Remove permissões do dono
        await channel.permissionOverwrites.edit(ticketOwner.id, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });
        const row = createRow(new ButtonBuilder({
            customId: "ticket/delete",
            label: "Excluir Ticket",
            style: ButtonStyle.Danger
        }));
        // Envia mensagens de fechamento se configuradas
        if (ticketType.closeTicketMessage || ticketType.closeTicketEmbedMessage) {
            if (ticketType.closeTicketMessage) {
                const message = ticketType.closeTicketMessage.replace(/{user}/g, interaction.user.toString());
                return interaction.editReply({ content: message, components: [row] });
            }
            else if (ticketType.closeTicketEmbedMessage) {
                const embedData = JSON.parse(ticketType.closeTicketEmbedMessage);
                if (embedData.description)
                    embedData.description = embedData.description.replace(/{user}/g, interaction.user.toString());
                return interaction.editReply({ embeds: [embedData], components: [row] });
            }
            else if (ticketType.closeTicketMessage && ticketType.closeTicketEmbedMessage) {
                const message = ticketType.closeTicketMessage.replace(/{user}/g, interaction.user.toString());
                const embedData = JSON.parse(ticketType.closeTicketEmbedMessage);
                if (embedData.description)
                    embedData.description = embedData.description.replace(/{user}/g, interaction.user.toString());
                return interaction.editReply({ content: message, embeds: [embedData], components: [row] });
            }
            else {
                return interaction.editReply({ content: "Não foi possível encontrar a mensagem de fechamento do ticket!", components: [row] });
            }
        }
        else {
            // Cria embed de fechamento com botão de exclusão
            const embed = createEmbed({
                title: "Ticket Fechado",
                description: ticketType.closeTicketEmbedMessage
                    ? JSON.parse(ticketType.closeTicketEmbedMessage).description?.replace(/{user}/g, interaction.user.toString())
                    : `Ticket fechado por ${interaction.user}`,
                footer: { text: "Use o botão abaixo para excluir o ticket permanentemente" }
            });
            return interaction.editReply({ embeds: [embed], components: [row] });
        }
    }
});
