import { ChannelType, PermissionFlagsBits } from "discord.js";
import { createResponder, ResponderType } from "#base";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createResponder({
    customId: "open-ticket/button/:choice",
    types: [ResponderType.Button],
    async run(interaction, { choice }) {
        const ticketData = config.ticketsManage?.[choice];
        if (!ticketData?.ticketMessage && !ticketData?.embedMessage) {
            return interaction.reply({
                content: "Erro: É necessário ter pelo menos uma mensagem ou embed configurado!",
                flags
            });
        }
        // Tenta encontrar a categoria se estiver configurada
        let categoryId = null;
        if (config.ticketCategoryID && config.ticketCategoryID !== "0") {
            const category = await interaction.guild?.channels.fetch(config.ticketCategoryID)
                .catch(() => null);
            if (category?.isCategory()) {
                categoryId = category.id;
            }
        }
        // Cria o canal
        const channel = await interaction.guild?.channels.create({
            name: `${ticketData.ticketname}-${config.ticketsCreated}`,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                ...config.superAdmins.map(id => ({
                    id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                })),
                ...config.admins.map(id => ({
                    id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                })),
                ...config.moderators.map(id => ({
                    id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }))
            ]
        });
        // Envia as mensagens configuradas
        if (ticketData.ticketMessage && channel) {
            const message = ticketData.ticketMessage.replace(/{user}/g, interaction.user.toString());
            await channel.send(message);
        }
        if (ticketData.embedMessage && channel) {
            const embedData = JSON.parse(ticketData.embedMessage);
            if (embedData.description) {
                embedData.description = embedData.description.replace(/{user}/g, interaction.user.toString());
            }
            await channel.send({ embeds: [embedData] });
        }
        // subir 1 em ticketsCreated
        config.ticketsCreated++;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        return interaction.reply({
            content: `Ticket criado com sucesso em: ${channel}`,
            flags
        });
    }
});
