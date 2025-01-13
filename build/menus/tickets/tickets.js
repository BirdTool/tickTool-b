import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
export function ticketsMenu() {
    const embed = createEmbed({
        title: "Tickets Menu",
        description: "selecione uma opção",
    });
    const row = createRow(new ButtonBuilder({
        customId: "tickets/manage/add",
        label: "Adicionar um ticket",
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "tickets/manage/edit",
        label: "Editar um ticket",
        style: ButtonStyle.Secondary
    }), new ButtonBuilder({
        customId: "tickets/manage/del",
        label: "Deletar um ticket",
        style: ButtonStyle.Danger
    }), new ButtonBuilder({
        customId: "tickets/manage/atribuir",
        label: "Atribuir a um embed",
        style: ButtonStyle.Primary
    }));
    const returnButton = createRow(new ButtonBuilder({
        customId: "dashboard/return/dashBoard",
        emoji: '↩️',
        style: ButtonStyle.Secondary
    }));
    return {
        flags,
        embeds: [embed],
        components: [row, returnButton]
    };
}
