import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
export function dashboardMenu() {
    const embed = createEmbed({
        title: `Painel do Admin`,
        description: `Escolha o que deseja gerenciar`,
        color: "#325572"
    });
    const row = createRow(new ButtonBuilder({
        customId: "dashboard/admin/manageEmbeds",
        label: "Gerenciar Embeds",
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "dashboard/admin/manageStaffs",
        label: "Gerenciar Staffs",
        style: ButtonStyle.Danger
    }), new ButtonBuilder({
        customId: "dashboard/admin/manageTickets",
        label: "Gerenciar Tickets",
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "dashboard/admin/logsChannelID",
        label: "Canal de Logs",
        style: ButtonStyle.Secondary
    }));
    return {
        flags,
        embeds: [embed],
        components: [row]
    };
}
