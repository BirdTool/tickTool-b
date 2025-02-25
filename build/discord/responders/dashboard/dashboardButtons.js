import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ChannelSelectMenuBuilder, ChannelType } from "discord.js";
import Staff from "../../../class/staff.js";
createResponder({
    customId: "dashboard/admin/:action",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { action }) {
        const staff = new Staff(interaction);
        switch (action) {
            case "manageEmbeds": {
                if (!staff.hasPosition(interaction.user.id, { positionChoiced: "admin" })) {
                    return interaction.reply("Você não é um admin ou superior!");
                }
                return interaction.update(await menus.manageEmbeds());
            }
            case "manageTickets": {
                if (!staff.hasPosition(interaction.user.id, { positionChoiced: "admin" })) {
                    return interaction.reply("Você não é um admin ou superior!");
                }
                return interaction.update(menus.tickets());
            }
            case "manageStaffs": {
                if (!staff.hasPosition(interaction.user.id, { positionChoiced: "superAdmin" })) {
                    return interaction.reply("Você não é um Super Admin ou superior!");
                }
                const manageStaffsMenu = await menus.manageStaffs();
                return interaction.update(manageStaffsMenu);
            }
            case "logsChannelID": {
                if (!staff.hasPosition(interaction.user.id, { positionChoiced: "superAdmin" })) {
                    return interaction.reply("Você não é um Super Admin ou superior!");
                }
                const row = createRow(new ChannelSelectMenuBuilder({
                    customId: "set/logsChannelID",
                    placeholder: "Selecione o canal de logs",
                    channelTypes: [ChannelType.GuildText]
                }));
                const embed = createEmbed({
                    title: "Canal de Logs",
                    description: "Selecione o canal de logs",
                    color: settings.colors.danger
                });
                return interaction.update({ embeds: [embed], components: [row] });
            }
            case "categoryTicketID": {
                if (!staff.hasPosition(interaction.user.id, { positionChoiced: "superAdmin" })) {
                    return interaction.reply("Você não é um Super Admin ou superior!");
                }
                ;
                const row = createRow(new ChannelSelectMenuBuilder({
                    customId: "set/categoryTicketID",
                    placeholder: "Selecione a categoria de tickets",
                    channelTypes: [ChannelType.GuildCategory]
                }));
                const embed = createEmbed({
                    title: "Categoria de Tickets",
                    description: "Selecione a categoria de tickets",
                    color: settings.colors.danger
                });
                return interaction.update({ embeds: [embed], components: [row] });
            }
        }
    },
});
