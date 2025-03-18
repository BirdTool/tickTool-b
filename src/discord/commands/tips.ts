import { createCommand, createResponder, ResponderType } from "#base";
import { ApplicationCommandType } from "discord.js";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";
import { createEmbed, createRow, brBuilder } from "@magicyan/discord";
import { settings } from "#settings";

interface Tips {
    title?: string;
    text: string;
}

const tips: Tips[] = [
    { text: "Você sabia que se você colocar seu webhook em WEBHOOK_LOGS_URL no arquivo env.txt, o bot irá enviar as mensagens de logs para o seu webhook?" },
    { text: "Você sabia que pode usar o comando **/sudo db get** para ver o que tem na db?" },
    { text: "Você sabia que para receber ajuda ou mandar sugestões para o bot você pode usar o comando **/github**? mas tem que ter uma conta cadastrada no github" },
]

createCommand({
    name: "tips",
    description: "dicas",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        return interaction.reply(tipsMenu())
    }
});


export function tipsMenu<R>(page: number = 0): R {
    const embed = createEmbed({
        color: settings.colors.primary,
        description: brBuilder(
            tips[page].text
        ),
        footer: { text: `Página ${page + 1} de ${tips.length}` }
    });

    const components = [
        createRow(
            new ButtonBuilder({
                customId: `tips/${page - 1}`,
                label: "<", 
                style: ButtonStyle.Success,
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `tips/${page + 1}`,
                label: ">", 
                style: ButtonStyle.Success,
                disabled: page === tips.length - 1
            })
        )
    ];

    return ({
        flags, embeds: [embed], components
    } satisfies InteractionReplyOptions) as R;
}

createResponder({
    customId: "tips/:page",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page }) {
        const pageNumber = Number(page);
        return interaction.update(tipsMenu(pageNumber));
    },
});