import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
const steps = [
    { text: `Vamos começar o tutorial!`, title: "início" },
    { text: `# Criar um embed \n use \`/embed criar\`, ou \`/dashboard\` e clique em gerenciar embeds, após isso clique em criar embed
        (**é necessário ao menos 1 um embed**), você pode criar 3 embeds:
        > Um embed para criação de tickets, outro para quando o embed abrir, e por fim outro para o fechamento de tickets`, title: "Passo 1" },
    { text: `# Criar um ticket \n Para criar um ticket use \`/ticket criar\` ou \`/dashboard\` selecionando a opção de gerenciar tickets` },
    { text: `# Informações do ticket: \n o nome do ticket será o nome do canal após o usuário abrir um ticket \n se você atribuir apenas um ticket pra um embed então será um botão, se for mais de um ticket irá ser um selectMenu`, title: `Detalhe importante dos tickets`, color: settings.colors.danger },
    { text: `# Atribuindo ticket ao embed \n para atribuir um ticket ao embed use \`/dashboard\` selecionando o menu gerenciar tickets, e atribuir tickets, após isso selecione o embed desejado e o ticket desejado` },
    { text: `# Enviando o embed \n use o \`/dashboard\`, selecione a aba gerenciar embeds, após isso aperte enviar embeds, e por fim você terá duas escolhas:
        1: enviar normal (**Enviará o embed sem qualquer botão ou selectMenu**)
        2: enviar com botões (**Enviará com um botão ou selectMenu**)
    após isso selecione o canal que deseja enviar o embed` },
    { text: `# Acabamos! \n finalmente acabamos! seu embed está pronto pra funcionar`, color: settings.colors.success }
];
export function tutorialMenu(step = 0) {
    const embed = createEmbed({
        title: steps[step].title || `Passo: ${step}`,
        description: steps[step].text,
        color: steps[step].color || settings.colors.primary
    });
    const row = createRow(new ButtonBuilder({
        customId: `tutorial/steps/${step - 1}`,
        label: "<",
        style: ButtonStyle.Success,
        disabled: step === 0
    }), new ButtonBuilder({
        customId: `tutorial/steps/${step + 1}`,
        label: ">",
        style: ButtonStyle.Success,
        disabled: (step + 1) === steps.length
    }));
    return {
        flags,
        embeds: [embed],
        components: [row]
    };
}
createResponder({
    customId: "tutorial/steps/:step",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { step }) {
        const stepNumber = Number.parseInt(step);
        if (stepNumber === -1)
            return interaction.reply("Não é possivel voltar a um passo que não existe");
        if (stepNumber > steps.length)
            return interaction.reply("Não é possivel avançar pra um passo que não existe");
        return interaction.update(menus.tutorial(stepNumber));
    },
});
