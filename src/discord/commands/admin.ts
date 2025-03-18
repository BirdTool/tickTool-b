import { createCommand } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ActivityType, ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

createCommand({
    name: "sudo",
    description: "Sudo commands",
    options: [
        {
            name: "db",
            description: "database commands",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "remove",
                    description: "remove a db value",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "key",
                            description: "the key to value (all for all values)",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: "action",
                            description: "action to use in the value",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "delete",
                                    value: "delete"
                                },
                                {
                                    name: "splice (to array values)",
                                    value: "splice"
                                },
                                {
                                    name: "all",
                                    value: "remove all values"
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "get",
                    description: "get db values",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "type of the value",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "all values",
                                    value: "all"
                                },
                                {
                                    name: "a especific key",
                                    value: "key"
                                }
                            ]
                        },
                        {
                            name: "key",
                            description: "the key to value (only if type is key)",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "set",
                    description: "set a db value (danger)",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "key",
                            description: "the key to value",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: "value",
                            description: "the value to set",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                }
            ]
        },
        {
            name: "bot",
            description: "bot commands",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "setactivity",
                    description: "set the bot activity",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "the type of activity",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "playing",
                                    value: "PLAYING"
                                },
                                {
                                    name: "listening",
                                    value: "LISTENING"
                                },
                                {
                                    name: "watching",
                                    value: "WATCHING"
                                },
                                {
                                    name: "competing",
                                    value: "COMPETING"
                                },
                                {
                                    name: "reset",
                                    value: "reset"
                                }
                            ]
                        },
                        {
                            name: "text",
                            description: "the text to display (write anything if is reset)",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: "setstatus",
                    description: "set the bot status",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "the type of status",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "online",
                                    value: "online"
                                },
                                {
                                    name: "idle",
                                    value: "idle"
                                },
                                {
                                    name: "not disturb",
                                    value: "dnd"
                                },
                                {
                                    name: "invisible",
                                    value: "invisible"
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "shutdown",
                    description: "shutdown the bot",
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        if (interaction.user.id !== await db.guilds.get<string>("owner")) {
            return interaction.reply({ content: "Você não tem permissão para usar esse comando", flags });
        }
        const subCommandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();
        if (subCommandGroup === "db") {
            switch (subCommand) {
                case "remove": {
                    const key = interaction.options.getString("key", true);
                    const action = interaction.options.getString("action", true) as "delete" | "splice" | "all";

                    if (action === "all") {
                        try {
                            await db.guilds.deleteAll();
                        } catch (error) {
                            console.log(error)
                            return interaction.reply({ content: `Erro ao tentar excluir o banco de dados`, flags });
                        }
                        return interaction.reply({ content: `O banco de dados foi excluído com sucesso`, flags });
                    } else if (action === "delete") {
                        try {
                            await db.guilds.delete(key);
                        } catch (error) {
                            console.log(error)
                            return interaction.reply({ content: `Erro ao tentar excluir o valor ${key} do banco de dados`, flags });
                        }
                        if (key === "owner") {
                            return interaction.reply({ content: `Você excluiu a chave owner do banco de dados, ele será redefinido na próxima restartação do bot`, flags });
                        }
                        return interaction.reply({ content: `Sucesso ao excluir a chave ${key} do banco de dados`, flags })
                    } else {
                        try {
                            if (!await db.guilds.has(key)) {
                                return interaction.reply({ content: `A chave ${key} não existe no banco de dados`, flags });
                            }
                            const value = await db.guilds.get<Array<any>>(key);
                            if (!value) {
                                return interaction.reply({ content: `A chave ${key} não possui um valor no banco de dados`, flags });
                            }
                            await db.guilds.set(key, value.splice(-1, 1));
                        } catch (error) {
                            console.log(error);
                            return interaction.reply({ content: `Erro ao tentar excluir o valor ${key} do banco de dados`, flags });
                        }
                        return interaction.reply({ content: `Sucesso ao excluir o último valor da chave ${key} do banco de dados`, flags })
                    }
                }
                case "get": {
                    const type = interaction.options.getString("type", true);
                    const limitCharacters = 3000;
                    if (type === "all") {
                        try {
                            interface Values {
                                id: string;
                                value: any;
                            }
                            const values = await db.guilds.all<Values[]>();

                            // Formata os valores de maneira organizada
                            const content = formatValues(values);


                            // Verifica se o conteúdo excede o limite de caracteres do Discord
                            if (content.length <= limitCharacters) {
                                // Se não exceder, envia uma única mensagem
                                return interaction.reply({
                                    embeds: [createEmbed({
                                        color: settings.colors.developer,
                                        description: content
                                    })],
                                    flags
                                });
                            } else {
                                // Se exceder, divide o conteúdo em várias mensagens
                                const chunks = splitContent(content, limitCharacters); // Divide o conteúdo em partes de 2000 caracteres

                                // Envia a primeira mensagem como resposta à interação
                                await interaction.reply({
                                    embeds: [createEmbed({
                                        color: settings.colors.developer,
                                        description: chunks[0]
                                    })],
                                    flags
                                });

                                // Envia as mensagens restantes como follow-ups
                                for (let i = 1; i < chunks.length; i++) {
                                    await interaction.followUp({
                                        embeds: [createEmbed({
                                            color: settings.colors.developer,
                                            description: chunks[i]
                                        })],
                                        flags
                                    });
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao tentar listar os valores do banco de dados:", error);
                            return interaction.reply({ content: "Erro ao tentar listar os valores do banco de dados", flags });
                        }
                    } else {
                        const key = interaction.options.getString("key");
                        if (!key) {
                            return interaction.reply({ content: "Você precisa especificar uma chave para listar o seu valor", flags })
                        }
                        try {
                            if (!await db.guilds.has(key)) {
                                return interaction.reply({ content: `A chave ${key} não existe no banco de dados`, flags });
                            };
                            const value = await db.guilds.get<any>(key);
                            if (!value) {
                                return interaction.reply({ content: `A chave ${key} não possui um valor no banco de dados`, flags });
                            }

                            // Formata o valor da chave específica
                            const content = `🔑 **Chave:** ${key}\n📦 **Valor:**\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;

                            // Verifica se o conteúdo excede o limite de caracteres do Discord
                            if (content.length <= limitCharacters) {
                                // Se não exceder, envia uma única mensagem
                                return interaction.reply({
                                    embeds: [createEmbed({
                                        color: settings.colors.developer,
                                        description: content,
                                    })],
                                    flags
                                });
                            } else {
                                // Se exceder, divide o conteúdo em várias mensagens
                                const chunks = splitContent(content, limitCharacters); // Divide o conteúdo em partes de limitCharacters caracteres

                                // Envia a primeira mensagem como resposta à interação
                                await interaction.reply({
                                    embeds: [createEmbed({
                                        color: settings.colors.developer,
                                        description: chunks[0],
                                    })],
                                    flags
                                });

                                // Envia as mensagens restantes como follow-ups
                                for (let i = 1; i < chunks.length; i++) {
                                    await interaction.followUp({
                                        embeds: [createEmbed({
                                            color: "random",
                                            description: chunks[i],
                                        })],
                                        flags
                                    });
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao tentar listar o valor da chave no banco de dados:", error);
                            return interaction.reply({ content: "Erro ao tentar listar o valor da chave no banco de dados", flags });
                        }
                    }
                    return;
                }
                case "set": {
                    const key = interaction.options.getString("key", true);
                    const value = interaction.options.getString("value", true);
                    try {
                        await db.guilds.set(key, value);
                        return interaction.reply({ content: `A chave ${key} foi definida com o valor ${value}`, flags });
                    } catch (error) {
                        console.error(error);
                        return interaction.reply({ content: "Erro ao tentar definir o valor da chave no banco de dados", flags });
                    }
                }
                default: {
                    return interaction.reply({ content: "Subcomando não encontrado", flags });
                }
            }
        } else if (subCommandGroup === "bot") {
            switch (subCommand) {
                case "setactivity": {
                    const typeString = interaction.options.getString("type", true);
                    const text = interaction.options.getString("text", true);
                    await interaction.deferReply({ flags })

                    if (typeString === "reset") {
                        const client = interaction.client;
                        client.user.setActivity("", { type: undefined });
                        await db.guilds.delete("activity.type");
                        await db.guilds.delete("activity.text");
                        return await interaction.editReply({ content: "Atividade do bot resetada com sucesso" });
                    }

                    // Mapear a string para o valor numérico correto do ActivityType
                    const type: ActivityType = typeString === "PLAYING"
                        ? ActivityType.Playing
                        : typeString === "LISTENING"
                        ? ActivityType.Listening
                        : typeString === "WATCHING"
                        ? ActivityType.Competing
                        : ActivityType.Playing;

                    const client = interaction.client;


                    client.user.setActivity(text, { type });
                    await db.guilds.set("activity.type", type);
                    await db.guilds.set("activity.text", text);

                    return await interaction.editReply({ content: `Atividade alterada para ${text}` });
                }
                case "setstatus": {
                    const status = interaction.options.getString("type", true) as "online" | "idle" | "dnd" | "invisible";
                    const client = interaction.client;

                    await interaction.deferReply({ flags })

                    client.user.setStatus(status);

                    await db.guilds.set("activity.status", status);

                    return await interaction.editReply({ content: `Status alterado para ${status} espere alguns segundos para atualizar` });
                }
                case "shutdown": {
                    const client = interaction.client;
                    await interaction.reply({ content: "Desligado com sucesso!", flags });
                    setTimeout(() => {
                        client.destroy();
                        2000
                    })
                    return;
                }
            }
        }
        else {
            return interaction.reply({ content: "Comando não encontrado", flags });
        }
    }
});

function splitContent(content: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";

    // Divide o conteúdo em partes menores
    for (const line of content.split("\n")) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = line;
        } else {
            currentChunk += (currentChunk ? "\n" : "") + line;
        }
    }

    // Adiciona o último chunk, se houver
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

function formatValues(values: Values[]): string {
    let formattedContent = "📊 **Valores do banco de dados:**\n\n";

    values.forEach((item, index) => {
        formattedContent += `🔑 **ID:** ${item.id}\n`;
        formattedContent += `📦 **Valor:**\n\`\`\`json\n${JSON.stringify(item.value, null, 2)}\n\`\`\`\n`;

        // Adiciona uma linha divisória entre os itens (exceto o último)
        if (index < values.length - 1) {
            formattedContent += "────────────────────\n";
        }
    });

    return formattedContent;
}

interface Values {
    id: string;
    value: any;
}