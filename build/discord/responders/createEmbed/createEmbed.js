import { createResponder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import colorsAvaible from "../../data/colors.json" with { type: "json" };
import { menus } from "#menus";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
createResponder({
    customId: "embed/create/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isButton()) {
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
                                value: interaction.message.embeds[0].title ?? undefined
                            }
                        })
                    });
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
                                value: interaction.message.embeds[0].description ?? undefined
                            }
                        })
                    });
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
                    });
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
                    });
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
                    });
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
                    });
                    break;
                }
                case "fields": {
                    return interaction.update(menus.manageFields());
                }
                case "save": {
                    interaction.showModal({
                        customId: "embed/create/modal/save",
                        title: "Salvar embed",
                        components: createModalFields({
                            name: {
                                label: "Nome do embed",
                                placeholder: "O nome do embed aqui",
                                style: TextInputStyle.Short,
                                required: true,
                                maxLength: 30
                            }
                        })
                    });
                }
            }
        }
        else {
            switch (action) {
                case "color": {
                    const choice = interaction.values[0];
                    if (choice !== "pers") {
                        const colorEntry = colorsAvaible.find(([color]) => color === choice);
                        if (!colorEntry)
                            return interaction.reply({ content: "Cor não encontrada.", ephemeral: true });
                        const subColors = colorEntry[1];
                        const colorButtons = Object.entries(subColors).map(([shade, hex]) => new ButtonBuilder({
                            customId: `embed/create/colors/${hex}`,
                            label: `${shade}`,
                            style: ButtonStyle.Secondary
                        }));
                        const rows = [];
                        for (let i = 0; i < colorButtons.length; i += 5) {
                            rows.push(createRow(...colorButtons.slice(i, i + 5)));
                        }
                        const row2 = createRow(new ButtonBuilder({
                            customId: "embed/create/colors/return",
                            label: "Voltar",
                            style: ButtonStyle.Success,
                            emoji: "↩️"
                        }));
                        return interaction.update({ components: [...rows, row2] });
                    }
                    else {
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
                        });
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
        switch (action) {
            case "title": {
                const title = interaction.fields.getTextInputValue("title");
                if (!title)
                    return interaction.reply("Você precisa informar um título para o embed");
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                embed.setTitle(title);
                return interaction.update({ embeds: [embed] });
            }
            case "description": {
                const description = interaction.fields.getTextInputValue("description");
                if (!description)
                    return interaction.reply("Você precisa informar uma descrição para o embed");
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                embed.setDescription(description);
                return interaction.update({ embeds: [embed] });
            }
            case "author": {
                const name = interaction.fields.getTextInputValue("name");
                const image = interaction.fields.getTextInputValue("image");
                const authorURL = interaction.fields.getTextInputValue("authorURL");
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                if (name) {
                    const authorData = { name };
                    if (image)
                        authorData.iconURL = image;
                    if (authorURL)
                        authorData.url = authorURL;
                    embed.setAuthor(authorData);
                }
                else {
                    embed.setAuthor(null);
                }
                return interaction.update({ embeds: [embed] });
            }
            case "footer": {
                const footerText = interaction.fields.getTextInputValue("footerText");
                const footerImage = interaction.fields.getTextInputValue("footerImage");
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                if (footerText) {
                    const footerData = { text: footerText };
                    if (footerImage)
                        footerData.iconURL = footerImage;
                    embed.setFooter(footerData);
                }
                else {
                    embed.setFooter(null);
                }
                return interaction.update({ embeds: [embed] });
            }
            case "thumbnail": {
                const thumbnailURL = interaction.fields.getTextInputValue("thumbnailURL");
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                if (thumbnailURL) {
                    embed.setThumbnail(thumbnailURL);
                }
                else {
                    embed.setThumbnail(null);
                }
                return interaction.update({ embeds: [embed] });
            }
            case "image": {
                const imageURL = interaction.fields.getTextInputValue("imageURL");
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                if (imageURL) {
                    embed.setImage(imageURL);
                }
                else {
                    embed.setImage(null);
                }
                return interaction.update({ embeds: [embed] });
            }
            case "fieldadd": {
                const name = interaction.fields.getTextInputValue("name");
                const value = interaction.fields.getTextInputValue("value");
                const isInline = interaction.fields.getTextInputValue("inline") || "true";
                const stringToBoolean = (value) => {
                    return value.toLowerCase() === "true";
                };
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                const fields = embed.data.fields || [];
                if (!name || !value)
                    return interaction.reply("Você precisa preencher todos os campos");
                fields.push({ name, value, inline: stringToBoolean(isInline) });
                embed.setFields(fields);
                return interaction.update({ embeds: [embed] });
            }
            case "save": {
                const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                const name = interaction.fields.getTextInputValue("name");
                if (!name)
                    return interaction.reply("Você precisa fornecer um nome para o embed");
                const embedData = {
                    title: embed.data.title,
                    description: embed.data.description,
                    color: embed.data.color ? `#${embed.data.color.toString(16).padStart(6, '0')}` : null,
                    fields: embed.data.fields,
                    footer: embed.data.footer,
                    author: embed.data.author,
                    thumbnail: embed.data.thumbnail,
                    image: embed.data.image,
                    timestamp: embed.data.timestamp
                };
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const filePath = path.resolve(__dirname, '../../data/embeds.json');
                let embeds = {};
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    embeds = JSON.parse(fileContent);
                }
                embeds[name] = embedData;
                fs.writeFileSync(filePath, JSON.stringify(embeds, null, 4), 'utf8');
                return interaction.update({ content: `Embed salvo com sucesso!`, embeds: [], components: [] });
            }
        }
    },
});