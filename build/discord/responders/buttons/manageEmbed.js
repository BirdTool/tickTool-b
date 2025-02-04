import { createResponder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, TextInputStyle } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
createResponder({
    customId: "manageEmbed/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isButton()) {
            switch (action) {
                case "title": {
                    const originalComponent = interaction.message.embeds[0]?.title;
                    return interaction.showModal({
                        customId: "manageEmbedModal/title",
                        title: "Título",
                        components: createModalFields({
                            title: {
                                label: "Título do embed",
                                placeholder: "O título do embed aqui",
                                style: TextInputStyle.Short,
                                maxLength: 100,
                                required: false,
                                value: originalComponent || undefined
                            }
                        })
                    });
                }
                case "description": {
                    const originalComponent = interaction.message.embeds[0]?.description;
                    return interaction.showModal({
                        customId: "manageEmbedModal/description",
                        title: "Descrição",
                        components: createModalFields({
                            description: {
                                label: "Descrição do embed",
                                placeholder: "A descrição do embed aqui",
                                style: TextInputStyle.Paragraph,
                                maxLength: 2500,
                                required: false,
                                value: originalComponent || undefined
                            }
                        })
                    });
                }
                case "footer": {
                    const originalComponent = interaction.message.embeds[0]?.footer;
                    return interaction.showModal({
                        customId: "manageEmbedModal/footer",
                        title: "Rodapé",
                        components: createModalFields({
                            footerText: {
                                label: "Texto do rodapé do embed",
                                placeholder: "Texto do rodapé do embed aqui",
                                style: TextInputStyle.Paragraph,
                                maxLength: 500,
                                required: false,
                                value: originalComponent?.text || undefined
                            },
                            footerIconURL: {
                                label: "Imagem do rodapé do embed",
                                placeholder: "Imagem do rodapé do embed aqui",
                                style: TextInputStyle.Paragraph,
                                required: false,
                                value: originalComponent?.iconURL || undefined
                            }
                        })
                    });
                }
                case "author": {
                    const originalComponent = interaction.message.embeds[0]?.author;
                    return interaction.showModal({
                        customId: "manageEmbedModal/author",
                        title: "Autor",
                        components: createModalFields({
                            authorName: {
                                label: "Autor do embed",
                                placeholder: "O autor do embed aqui",
                                style: TextInputStyle.Short,
                                maxLength: 100,
                                required: false,
                                value: originalComponent?.name || undefined
                            },
                            authorImageURL: {
                                label: "Imagem do autor do embed",
                                placeholder: "Link da imagem do autor do embed aqui",
                                style: TextInputStyle.Paragraph,
                                required: false,
                                value: originalComponent?.iconURL || undefined
                            },
                            authorUrl: {
                                label: "Link do autor do embed",
                                placeholder: "O link do autor do embed aqui",
                                style: TextInputStyle.Short,
                                required: false,
                                value: originalComponent?.url || undefined
                            }
                        })
                    });
                }
                case "image": {
                    const originalComponent = interaction.message.embeds[0]?.image;
                    return interaction.showModal({
                        customId: "manageEmbedModal/image",
                        title: "Imagem",
                        components: createModalFields({
                            image: {
                                label: "Imagem do embed",
                                placeholder: "O link da imagem do embed aqui",
                                style: TextInputStyle.Paragraph,
                                required: false,
                                value: originalComponent?.url || undefined
                            }
                        })
                    });
                }
                case "thumbnail": {
                    const originalComponent = interaction.message.embeds[0]?.thumbnail;
                    return interaction.showModal({
                        customId: "manageEmbedModal/thumbnail",
                        title: "Imagem pequena",
                        components: createModalFields({
                            description: {
                                label: "Imagem pequena do embed",
                                placeholder: "A imagem pequena do embed aqui",
                                style: TextInputStyle.Paragraph,
                                required: false,
                                value: originalComponent?.url || undefined
                            }
                        })
                    });
                }
                case "save": {
                    const originalComponent = interaction.message.embeds[0]?.title;
                    let value = undefined;
                    if (originalComponent) {
                        if (originalComponent?.length > 25) {
                            value = undefined;
                        }
                        else {
                            value = originalComponent;
                        }
                    }
                    return interaction.showModal({
                        customId: "manageEmbedModal/save",
                        title: "Nome do embed ",
                        components: createModalFields({
                            description: {
                                label: "Nome do embed",
                                placeholder: "Nome do embed",
                                style: TextInputStyle.Short,
                                maxLength: 25,
                                required: false,
                                value,
                            }
                        })
                    });
                }
                case "color": {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const colorPath = path.resolve(__dirname, '../../../staticData/colors.json');
                    const colors = JSON.parse(fs.readFileSync(colorPath, 'utf-8'));
                    // Cria as opções do menu de seleção
                    const colorOptions = colors.map(cor => ({
                        label: cor[0], // Nome da cor
                        value: cor[0], // Valor da cor
                        emoji: cor[2] || "❓" // Emoji da cor
                    }));
                    const components = [
                        createRow(new StringSelectMenuBuilder({
                            customId: "manageEmbed/colorChoice",
                            placeholder: "Escolha a cor",
                            options: [
                                { label: "Cor Customizada", value: "customColor", emoji: "🌈" }, // Opção fixa
                                ...colorOptions // Adiciona as cores dinâmicas
                            ]
                        })),
                        createRow(new ButtonBuilder({
                            customId: "return/menuEmbed",
                            emoji: "↩️",
                            style: ButtonStyle.Primary
                        }))
                    ];
                    return interaction.update({ components: components });
                }
                default: {
                    return interaction.reply({ flags, content: "Esta interação não existe" });
                }
            }
        }
        else {
            const choice = interaction.values[0];
            if (choice === "customColor") {
                return interaction.showModal({
                    customId: "manageEmbedColor/newColor/modal",
                    title: "Cor personalizada em hex#",
                    components: createModalFields({
                        description: {
                            label: "Cor do embed",
                            placeholder: "Cor do embed em hexadecimal# ex: (#ffffff) - retorna branco",
                            style: TextInputStyle.Short,
                            maxLength: 7,
                            required: true
                        }
                    })
                });
            }
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const colorPath = path.resolve(__dirname, '../../../staticData/colors.json');
            const colors = JSON.parse(fs.readFileSync(colorPath, 'utf-8'));
            // Função para criar botões com base nas tonalidades
            function createTonalidadeButtons(corNome, tonalidades) {
                if (Object.keys(tonalidades).length === 0) {
                    throw new Error(`Nenhuma tonalidade encontrada para a cor: ${corNome}`);
                }
                return Object.entries(tonalidades).map(([tonalidade, hex]) => {
                    const label = tonalidade ? `${corNome} ${tonalidade}` : corNome;
                    return new ButtonBuilder({
                        customId: `manageEmbedColor/newColor/${hex}`, // Usa o valor HEX como parte do customId
                        label: label,
                        style: ButtonStyle.Secondary
                    });
                });
            }
            // Divide os botões em grupos de no máximo 5 por linha
            function chunkArray(array, size) {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            }
            // Filtra apenas a cor escolhida
            const selectedColor = colors.find(cor => cor[0] === choice);
            if (!selectedColor) {
                return interaction.reply({ flags, content: "Cor não encontrada!" });
            }
            const [, tonalidades] = selectedColor; // Obtém as tonalidades da cor escolhida
            const allButtons = createTonalidadeButtons(choice, tonalidades);
            // Divide os botões em grupos de 5
            const buttonChunks = chunkArray(allButtons, 5);
            // Cria as linhas de componentes com no máximo 5 botões cada
            let components = buttonChunks.map(chunk => createRow(...chunk));
            // Adiciona o botão de "Voltar" na última linha, se houver espaço
            if (components.length < 5) {
                // Se houver menos de 5 linhas, adiciona o botão de "Voltar" na última linha
                components.push(createRow(new ButtonBuilder({
                    customId: "return/menuEmbed",
                    emoji: "↩️",
                    style: ButtonStyle.Primary
                })));
            }
            else {
                // Se já houver 5 linhas, substitui a última linha pelos botões restantes + "Voltar"
                const lastRowButtons = components[4].components; // Botões da última linha
                const newLastRow = lastRowButtons.slice(0, 4); // Mantém apenas 4 botões na última linha
                newLastRow.push(new ButtonBuilder({
                    customId: "return/menuEmbed",
                    label: "Voltar",
                    style: ButtonStyle.Danger
                }));
                components[4] = createRow(...newLastRow); // Atualiza a última linha
            }
            // Atualiza a interação com os botões (tudo em uma única mensagem)
            return await interaction.update({
                content: "Escolha uma tonalidade:",
                components: components.slice(0, 5) // Garante que não haja mais de 5 linhas
            });
        }
    },
});
