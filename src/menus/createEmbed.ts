import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";

export function createEmbedMenu<R>(): R {
    const embed = createEmbed({
        title: "Criar embed",
        description: "Selecione as opções abaixo pra criar um embed.",
        color: settings.colors.primary
    });

    const row1 = createRow(
        new ButtonBuilder({
            customId: "embed/create/title",
            label: "Título", 
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/description",
            label: "Descrição", 
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/author",
            label: "Autor", 
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/footer",
            label: "Rodapé", 
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/thumbnail",
            label: "Thumbnail", 
            style: ButtonStyle.Secondary
        })
    );
    
    const row2 = createRow(
        new ButtonBuilder({
            customId: "embed/create/image",
            label: "Imagem", 
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/fields",
            label: "Campos", 
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/save",
            label: "Salvar", 
            style: ButtonStyle.Success
        }),
        new ButtonBuilder({
            customId: "return/manageEmbeds",
            emoji: '↩️', 
            style: ButtonStyle.Secondary
        })
    );
    const selectMenus = createRow(
        new StringSelectMenuBuilder({
            customId: "embed/create/color",
            placeholder: "Cor do embed",
            options: [
            { emoji: "🎨", label: "Cor personalizada", value: "pers" },
            { emoji: "🎨", label: "Vermelho", value: "vermelho" },
            { emoji: "🎨", label: "Azul", value: "azul" },
            { emoji: "🎨", label: "Amarelo", value: "amarelo" },
            { emoji: "🎨", label: "Verde", value: "verde" },
            { emoji: "🎨", label: "Rosa", value: "rosa" },
            { emoji: "🎨", label: "Preto", value: "preto" },
            { emoji: "🎨", label: "Branco", value: "branco" },
            { emoji: "🎨", label: "Laranja", value: "laranja" },
            { emoji: "🎨", label: "Marrom", value: "marrom" },
            { emoji: "🎨", label: "Roxo", value: "roxo" },
        ]
        })
    );

    return ({
        flags,
        embeds: [embed],
        components: [row1, row2, selectMenus] 
    } satisfies InteractionReplyOptions) as R;
}


export function manageFieldsMenu<R>(): R {
    const row = createRow(
        new ButtonBuilder({
            customId: "embed/create/colors/return",
            label: "Voltar",
            emoji: "↩️",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "embed/create/field/add",
            label: "Adicionar campo",
            style: ButtonStyle.Success
        }),
        new ButtonBuilder({
            customId: "embed/create/field/remove",
            label: "Remover campo",
            style: ButtonStyle.Danger
        }),
        new ButtonBuilder({
            customId: "embed/create/field/edit",
            label: "Editar um campo",
            style: ButtonStyle.Primary
        }),
    );

    return ({
        flags,
        components: [row]
    } satisfies InteractionReplyOptions) as R;
}