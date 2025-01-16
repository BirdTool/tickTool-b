import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType } from "discord.js";
import { createCommand } from "#base";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createCommand({
    name: "fechar",
    description: "Fecha o ticket atual",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: "Este comando só pode ser usado em canais de texto!", ephemeral: true });
        }
        const channel = interaction.channel;
        const channelName = channel.name;
        // Verifica se o canal é um ticket
        const ticketType = Object.values(config.ticketsManage || {}).find(ticket => channelName.startsWith(ticket.ticketname));
        if (!ticketType) {
            return interaction.reply({ content: "Este canal não é um ticket!", ephemeral: true });
        }
        // Encontra o dono do ticket (primeira permissão que não é staff)
        const ticketOwner = channel.permissionOverwrites.cache
            .find(perm => !config.superAdmins.includes(perm.id) &&
            !config.admins.includes(perm.id) &&
            !config.moderators.includes(perm.id) &&
            perm.id !== channel.guild.id);
        if (!ticketOwner) {
            return interaction.reply({ content: "Não foi possível encontrar o dono do ticket!", ephemeral: true });
        }
        // Remove permissões do dono
        await channel.permissionOverwrites.edit(ticketOwner.id, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });
        // Envia mensagens de fechamento se configuradas
        if (ticketType.closeTicketMessage) {
            const message = ticketType.closeTicketMessage.replace(/{user}/g, interaction.user.toString());
            await channel.send(message);
        }
        // Cria embed de fechamento com botão de exclusão
        const embed = createEmbed({
            title: "Ticket Fechado",
            description: ticketType.closeTicketEmbedMessage
                ? JSON.parse(ticketType.closeTicketEmbedMessage).description?.replace(/{user}/g, interaction.user.toString())
                : `Ticket fechado por ${interaction.user}`,
            footer: { text: "Use o botão abaixo para excluir o ticket permanentemente" }
        });
        const row = createRow(new ButtonBuilder({
            customId: "ticket/delete",
            label: "Excluir Ticket",
            style: ButtonStyle.Danger
        }));
        return interaction.reply({ embeds: [embed], components: [row] });
    }
});
