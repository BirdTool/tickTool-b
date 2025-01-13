import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
export function ticketAddMenu() {
    const embed = createEmbed({
        title: "Painel ticket",
        description: "Criando um ticket",
        color: settings.colors.warning
    });
    const row = createRow(new ButtonBuilder({
        customId: "tickets/add/manage/name",
        label: "Nome do ticket",
        style: ButtonStyle.Primary
    }), new ButtonBuilder({
        customId: "tickets/add/manage/aparency",
        label: "Aparencia do ticket no menu",
        style: ButtonStyle.Secondary
    }), new ButtonBuilder({
        customId: "tickets/add/manage/contentOpen",
        label: "Conteúdo ao abrir ticket",
        style: ButtonStyle.Secondary
    }), new ButtonBuilder({
        customId: "tickets/add/manage/contentClose",
        label: "Conteúdo ao fechar",
        style: ButtonStyle.Danger
    }));
    const row2 = createRow(new ButtonBuilder({
        customId: "tickets/add/manage/saveTicket",
        label: `Salvar ticket`,
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "dashboard/return/tickets",
        emoji: '↩️',
        style: ButtonStyle.Secondary
    }));
    return {
        flags,
        embeds: [embed],
        components: [row, row2]
    };
}
