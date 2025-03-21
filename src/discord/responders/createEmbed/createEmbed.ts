import { createResponder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import colorsAvaible from "../../../colors.json" with { type: "json" };
import { menus } from "#menus";
import { db } from "#database";
import { Embed } from "#types"

createResponder({
    customId: "embed/create/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if(interaction.isButton()) {
            switch (action) {
                case "title": {
                    interaction.showModal({
                        customId: "embed/create/modal/title",
                        title: "Título",
                        components: createModalFields({
                            title: {
                                label: "Título do embed",
                                placeholder: "O título do embed aqui",
                                style: TextInputStyle.Short,
                                maxLength: 256,
                                value: interaction.message.embeds[0].title ?? undefined,
                                required: false
                            }
                        })
                    })
                    break;
                }
                case "description": {
                    interaction.showModal({
                        customId: "embed/create/modal/description",
                        title: "Descrição",
                        components: createModalFields({
                            description: {
                                label: "Descrição do embed",
                                placeholder: "A descrição do embed aqui",
                                style: TextInputStyle.Paragraph,
                                maxLength: 2500,
                                value: interaction.message.embeds[0].description ?? undefined,
                                required: false
                            }
                        })
                    })
                    break;
                }
                case "author": {
                    interaction.showModal({
                        customId: "embed/create/modal/author",
                        title: "Autor",
                        components: createModalFields({
                            name: {
                                label: "Nome do autor",
                                placeholder: "O nome do autor aqui (deixe vazio para retirar o autor do embed)",
                                style: TextInputStyle.Short,
                                maxLength: 50,
                                required: false,
                                value: interaction.message.embeds[0].author?.name ?? undefined
                            },
                            image: {
                                label: "Imagem do autor",
                                placeholder: "O link da imagem do autor aqui (URL)",
                                style: TextInputStyle.Paragraph,
                                required: false
                            },
                            authorURL: {
                                label: "URL do autor",
                                placeholder: "A URL do autor aqui",
                                style: TextInputStyle.Paragraph,
                                required: false
                            },
                        })
                    })
                    break;
                }
                case "footer": {
                    interaction.showModal({
                        customId: "embed/create/modal/footer",
                        title: "Rodapé",
                        components: createModalFields({
                            footerText: {
                                label: "Rodapé do embed",
                                placeholder: "O rodapé do embed aqui",
                                style: TextInputStyle.Short,
                                maxLength: 100,
                                required: false,
                                value: interaction.message.embeds[0].footer?.text ?? undefined
                            },
                            footerImage: {
                                label: "Imagem do rodapé",
                                placeholder: "O link da imagem do rodapé aqui (URL)",
                                style: TextInputStyle.Paragraph,
                                required: false
                            }
                        })
                    })
                    break;
                }
                case "thumbnail": {
                    interaction.showModal({
                        customId: "embed/create/modal/thumbnail",
                        title: "Miniatura",
                        components: createModalFields({
                            thumbnailURL: {
                                label: "URL da miniatura",
                                placeholder: "O link da miniatura aqui (URL)",
                                style: TextInputStyle.Paragraph,
                                required: false
                            }
                        })
                    })
                    break;
                }
                case "image": {
                    interaction.showModal({
                        customId: "embed/create/modal/image",
                        title: "Imagem",
                        components: createModalFields({
                            imageURL: {
                                label: "URL da imagem",
                                placeholder: "O link da imagem aqui (URL)",
                                style: TextInputStyle.Paragraph,
                                required: false
                            }
                        })
                    })
                    break;
                }
                case "fields": {
                    return interaction.update(menus.manageFields());
                }
                case "save": {
                    let value = interaction.message.embeds[0].title && interaction.message.embeds[0].title?.length > 24 ? undefined : interaction.message.embeds[0].title === null ? undefined : interaction.message.embeds[0].title;
                    const embeds = await db.guilds.get<Embed[]>("embeds") || [];
                    if (embeds.find(embed => embed.name === value)) {
                        value = undefined
                    }
                    interaction.showModal({
                        customId: "embed/create/modal/save",
                        title: "Salvar embed",
                        components: createModalFields({
                            name: {
                                label: "Nome do embed",
                                placeholder: "O nome do embed aqui",
                                style: TextInputStyle.Short,
                                required: true,
                                maxLength: 30,
                                value
                            }
                        })
                    })
                }
            }
        } else {
            switch(action) {
                case "color": {
                    const choice = interaction.values[0];
                    if (choice !== "pers") {
                        const colorEntry = colorsAvaible.find(([color]) => color === choice);
                        if (!colorEntry) return interaction.reply({ content: "Cor não encontrada.", ephemeral: true });

                        const subColors = colorEntry[1];
                        const colorButtons = Object.entries(subColors).map(([shade, hex]) => 
                            new ButtonBuilder({
                                customId: `embed/create/colors/${hex}`,
                                label: `${shade}`,
                                style: ButtonStyle.Secondary
                            })
                        );

                        const rows = [];
                        for (let i = 0; i < colorButtons.length; i += 5) {
                            rows.push(createRow(...colorButtons.slice(i, i + 5)));
                        }
                        const row2 = createRow(
                            new ButtonBuilder({
                                customId: "embed/create/colors/return",
                                label: "Voltar",
                                style: ButtonStyle.Success,
                                emoji: "↩️"
                            })
                        )

                        return interaction.update({ components: [...rows, row2] });
                    } else {
                        interaction.showModal({
                            customId: "embed/create/colors/modal",
                            title: "Cor",
                            components: createModalFields({
                                cor: {
                                    label: "Cor personalizada",
                                    placeholder: "Digite o código hexadecimal da cor aqui (ex: #ffffff - branco)",
                                    style: TextInputStyle.Short,
                                    required: true
                                }
                            })
                        })
                    }
                }
            }
        }
    },
});

createResponder({
    customId: "embed/create/modal/:action",
    types: [ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { action }) {
        const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());

        interface AuthorData {
            name: string;
            iconURL?: string;
            url?: string;
        }

        interface FooterData {
            text: string;
            iconURL?: string;
        }

        const modifyEmbed = (part: keyof typeof embed.data, newValue: string | null | AuthorData | FooterData) => {
            const newEmbed = new EmbedBuilder(embed.data);
            
            if (newValue === null) {
                if (part === "author") {
                    newEmbed.setAuthor(null);
                } else if (part === "footer") {
                    newEmbed.setFooter(null);
                } else if (part === "thumbnail") {
                    newEmbed.setThumbnail(null);
                } else if (part === "image") {
                    newEmbed.setImage(null);
                } else {
                    (newEmbed.data as any)[part] = null;
                }
            } else {
                if (part === "author" && typeof newValue === "object") {
                    newEmbed.setAuthor(newValue as AuthorData);
                } else if (part === "footer" && typeof newValue === "object") {
                    newEmbed.setFooter(newValue as FooterData);
                } else if (part === "thumbnail" && typeof newValue === "string") {
                    newEmbed.setThumbnail(newValue);
                } else if (part === "image" && typeof newValue === "string") {
                    newEmbed.setImage(newValue);
                } else {
                    (newEmbed.data as any)[part] = newValue;
                }
            }
            
            return newEmbed;
        }
        
        
        switch(action) {
            case "title": {
                const title = interaction.fields.getTextInputValue("title") || null;
                const newEmbed = modifyEmbed("title", title);
                return interaction.update({ embeds: [newEmbed] });
            }
            case "description": {
                const description = interaction.fields.getTextInputValue("description") || null;
                const newEmbed = modifyEmbed("description", description);
                return interaction.update({ embeds: [newEmbed] });
            }
            case "author": {
                const name = interaction.fields.getTextInputValue("name");
                const image = interaction.fields.getTextInputValue("image") || undefined;
                const authorURL = interaction.fields.getTextInputValue("authorURL") || undefined;
            
                let newEmbed;
                if (!name) {
                    newEmbed = modifyEmbed("author", null);
                } else {
                    const authorData: AuthorData = { name, iconURL: image, url: authorURL };
                    newEmbed = modifyEmbed("author", authorData);
                }
                
                return interaction.update({ embeds: [newEmbed] });
            }
            
            case "footer": {
                const footerText = interaction.fields.getTextInputValue("footerText");
                const footerImage = interaction.fields.getTextInputValue("footerImage") || undefined;

                let newEmbed;
                if (footerText) {
                    const footerData: FooterData = { text: footerText, iconURL: footerImage };
                    newEmbed = modifyEmbed("footer", footerData);
                } else {
                    newEmbed = modifyEmbed("footer", null);
                }

                return interaction.update({ embeds: [newEmbed] });
            }
            case "thumbnail": {
                const thumbnailURL = interaction.fields.getTextInputValue("thumbnailURL") || null;
                
                const newEmbed = modifyEmbed("thumbnail", thumbnailURL);

                return interaction.update({ embeds: [newEmbed] });
            }
            case "image": {
                const imageURL = interaction.fields.getTextInputValue("imageURL") || null;
                
                const newEmbed = modifyEmbed("image", imageURL);

                return interaction.update({ embeds: [newEmbed] });
            }
            case "fieldadd": {
                const name = interaction.fields.getTextInputValue("name");
                const value = interaction.fields.getTextInputValue("value");
                const isInline = interaction.fields.getTextInputValue("inline") || "true";
                const stringToBoolean = (value: string): boolean => {
                    return value.toLowerCase() === "true";
                };
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                const fields = embed.data.fields || [];

                if (!name || !value) return interaction.reply("Você precisa preencher todos os campos");

                fields.push({ name, value, inline: stringToBoolean(isInline) });
                embed.setFields(fields);

                return interaction.update({ embeds: [embed] });
            }
            case "save": {
                const name = interaction.fields.getTextInputValue("name");
            
                if (!name) return interaction.reply("Você precisa fornecer um nome para o embed");
            
                const embedData = {
                    name: name,
                    title: embed.data.title,
                    description: embed.data.description,
                    color: embed.data.color ? `#${embed.data.color.toString(16).padStart(6, '0')}` : null,
                    fields: embed.data.fields,
                    footer: embed.data.footer,
                    author: embed.data.author,
                    thumbnail: embed.data.thumbnail,
                    image: embed.data.image,
                    timestamp: embed.data.timestamp,
                    tickets: []
                };
            
                // Busca os embeds existentes
                const embeds = await db.guilds.get<Embed[]>("embeds") || [];
            
                // Verifica se já existe um embed com o mesmo nome
                const existingEmbedIndex = embeds.findIndex(embed => embed.name === name);
            
                if (existingEmbedIndex !== -1) {
                    // Substitui o embed existente
                    embeds[existingEmbedIndex] = embedData as Embed;
                } else {
                    // Adiciona o novo embed
                    embeds.push(embedData as Embed);
                }
            
                // Salva o array atualizado no banco de dados
                await db.guilds.set("embeds", embeds);
            
                return interaction.update({ content: `Embed salvo com sucesso!`, embeds: [], components: [] });
            }
        }
    },
});