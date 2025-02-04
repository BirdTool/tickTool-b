import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
export function createEmbedMenu(returnDefaultEmbed = true) {
    const embed = createEmbed({
        title: "Criador de embeds",
        description: "Use os botões abaixo para criar um embed",
        color: settings.colors.primary,
        footer: { text: "© todos os direitos reservados" }
    });
    const components = [
        createRow(new ButtonBuilder({
            customId: "manageEmbed/title",
            label: "Titulo",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/description",
            label: "Descrição",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/footer",
            label: "Rodapé",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/color",
            label: "Cor",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/author",
            label: "Autor",
            style: ButtonStyle.Secondary
        })),
        createRow(new ButtonBuilder({
            customId: "manageEmbed/image",
            label: "Imagem",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/thumbnail",
            label: "Imagem pequena",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/fields",
            label: "Fields",
            style: ButtonStyle.Secondary
        }), new ButtonBuilder({
            customId: "manageEmbed/save",
            label: "Salvar",
            style: ButtonStyle.Success
        }))
    ];
    if (returnDefaultEmbed) {
        return {
            flags, embeds: [embed], components
        };
    }
    else {
        return {
            flags, components
        };
    }
}
