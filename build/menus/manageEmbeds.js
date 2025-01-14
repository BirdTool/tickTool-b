import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { settings } from "#settings";
const getEmbeds = (option) => {
    // Caminho para o arquivo JSON
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.resolve(__dirname, "../discord/data/embeds.json");
    // Ler o arquivo JSON
    const rawData = fs.readFileSync(filePath, "utf8");
    const embeds = JSON.parse(rawData);
    // Processar a saída com base na opção
    switch (option) {
        case "quantity":
            return Object.keys(embeds).length;
        case "listSelect":
            return Object.keys(embeds);
        default:
            throw new Error("Opção inválida.");
    }
};
export function manageEmbedsMenu() {
    const embed = createEmbed({
        title: `Gerenciador de embeds`,
        description: `você tem um total de: **${getEmbeds("quantity")}** embeds`,
        color: settings.colors.green
    });
    const selectMenuOptions = getEmbeds("listSelect").map(name => ({
        label: name,
        value: name,
        emoji: "📜" // Emoji opcional
    }));
    const row = createRow(new StringSelectMenuBuilder({
        customId: "manage/embeds/select",
        placeholder: "Selecione o embed que deseja modificar",
        options: selectMenuOptions
    }));
    const buttons = createRow(new ButtonBuilder({
        customId: "manage/embeds/criar",
        label: "Criar novo embed",
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "send/embed/optionsEmbed",
        label: "Enviar embed",
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "dashboard/return/dashBoard",
        emoji: '↩️',
        style: ButtonStyle.Secondary
    }));
    return {
        flags,
        embeds: [embed],
        components: [row, buttons]
    };
}
;
