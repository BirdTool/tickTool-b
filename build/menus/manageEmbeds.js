import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { db } from "#database";
const getEmbeds = async (option) => {
    const embeds = await db.guilds.get("embeds") || [];
    // Processar a saída com base na opção
    switch (option) {
        case "quantity":
            return embeds.length; // Retorna o número de embeds
        case "listSelect":
            return embeds.map(embed => embed.name || "Embed sem nome"); // Retorna um array de nomes dos embeds
        default:
            throw new Error("Opção inválida.");
    }
};
export async function manageEmbedsMenu() {
    const embedQuantity = await getEmbeds("quantity"); // Aguarda a quantidade de embeds
    const embedList = await getEmbeds("listSelect"); // Aguarda a lista de nomes dos embeds
    const embed = createEmbed({
        title: `Gerenciador de embeds`,
        description: `Você tem um total de: **${embedQuantity}** embeds`,
        color: settings.colors.green
    });
    const selectMenuOptions = embedList.map(name => ({
        label: name,
        value: name,
        emoji: "📜"
    }));
    const components = [
        createRow(new StringSelectMenuBuilder({
            customId: "manage/embeds/select",
            placeholder: "Selecione o embed que deseja modificar",
            options: embedQuantity > 0 ? selectMenuOptions : [{ label: "Não há embeds para selecionar", value: "Não há embeds para selecionar" }],
            disabled: embedQuantity === 0
        })),
        createRow(new ButtonBuilder({
            customId: "manage/embeds/criar",
            label: "Criar novo embed",
            style: ButtonStyle.Success
        }), new ButtonBuilder({
            customId: "send/embed/optionsEmbed",
            label: "Enviar embed",
            style: ButtonStyle.Success,
            disabled: embedQuantity === 0 // Desabilita o botão se não houver embeds
        }), new ButtonBuilder({
            customId: "return/dashBoard",
            emoji: '↩️',
            style: ButtonStyle.Secondary
        }))
    ];
    return {
        embeds: [embed],
        components: components,
        flags
    };
}
