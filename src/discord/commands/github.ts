import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonStyle, ButtonBuilder } from "discord.js";

createCommand({
    name: "github",
    description: "acesso ao github",
    options: [
        {
            name: "link",
            description: "link do github",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "reportarbug",
            description: "reportar bugs do bot",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "sugestão",
            description: "sugestão para o bot",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "ajuda",
            description: "sua ajuda não está aqui? peça no github",
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const subcommand = interaction.options.getSubcommand();
        const github = "https://github.com/BirdTool/tickTool-b"
        switch(subcommand){
            case "link": {
                const embed = createEmbed({
                    title: "Github",
                    description: "Acesse o github do bot para reportar bugs, sugerir melhorias e mais",
                    color: settings.colors.success,
                    url: github,
                    author: { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ extension: "png" }) },
                    footer: { text: "Clique no botão para acessar o github" },
                });
                const button = createRow(
                    new ButtonBuilder({
                        label: "Clique aqui",
                        url: github,
                        style: ButtonStyle.Link,
                    })
                );
                return interaction.reply({ embeds: [embed], components: [button] });
            }
            case "reportarbug": {
                const embed = createEmbed({
                    title: "Reportar bug",
                    description: "Encontrou algum bug? Acesse o link abaixo e mande seu erro no github! \n > por favor coloque o erro tambem \n não sabe qual é o erro? use .logs (caso vc use a discloud) no server da discloud para saber o erro do bot!",
                    color: settings.colors.success,
                    url: `${github}/new?template=Blank+issue`,
                    author: { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ extension: "png" }) },
                    footer: { text: "Clique no botão para acessar o github" },
                });
                const button = createRow(
                    new ButtonBuilder({
                        label: "Clique aqui",
                        url: `${github}/new?template=Blank+issue`,
                        style: ButtonStyle.Link,
                    })
                );
                return interaction.reply({ embeds: [embed], components: [button] });
            }
            case "sugestão": {
                const embed = createEmbed({
                    title: "Sugestão",
                    description: "Acesse o link abaixo e mande sua sugestão no github!",
                    color: settings.colors.success,
                    url: `${github}/new?template=Blank+issue`,
                });
                const button = createRow(
                    new ButtonBuilder({
                        label: "Clique aqui",
                        url: `${github}/new?template=Blank+issue`,
                        style: ButtonStyle.Link,
                    })
                );
                return interaction.reply({ embeds: [embed], components: [button] });
            }
            case "ajuda": {
                const embed = createEmbed({
                    title: "Ajuda",
                    description: "Não encontrou a ajuda que procura? Acesse o link abaixo e mande sua dúvida no github!",
                    color: settings.colors.success,
                    url: `${github}/new?template=Blank+issue`,
                });
                const button = createRow(
                    new ButtonBuilder({
                        label: "Clique aqui",
                        url: `${github}/new?template=Blank+issue`,
                        style: ButtonStyle.Link,
                    })
                );
                return interaction.reply({ embeds: [embed], components: [button] });
            }
        }
    }
});