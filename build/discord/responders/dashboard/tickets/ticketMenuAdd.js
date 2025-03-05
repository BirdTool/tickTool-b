import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { createModalFields } from "@magicyan/discord";
import { EmbedBuilder, TextInputStyle } from "discord.js";
import { db } from "#database";
createResponder({
    customId: "tickets/add/manage/:action",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { action }) {
        const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
        const fields = embed.data.fields || [];
        if (interaction.isButton()) {
            switch (action) {
                case "aparency": {
                    // Procurar os índices dos campos
                    const fieldNameTicketIndex = fields.findIndex(f => f.name === "Nome do ticket no menu");
                    const fieldDescriptionTicketIndex = fields.findIndex(f => f.name === "Descrição do ticket");
                    const fieldEmojiTicketIndex = fields.findIndex(f => f.name === "Emoji do ticket");
                    // Obter os valores dos campos ou uma string padrão
                    const fieldNameTicketValue = fieldNameTicketIndex !== -1 ? fields[fieldNameTicketIndex].value : "Default Name";
                    const fieldDescriptionTicketValue = fieldDescriptionTicketIndex !== -1 ? fields[fieldDescriptionTicketIndex].value : "Default Description";
                    const fieldEmojiTicketValue = fieldEmojiTicketIndex !== -1 ? fields[fieldEmojiTicketIndex].value : "🚩";
                    return interaction.showModal({
                        customId: "tickets/add/manage/aparencyModal",
                        title: "Aparencia",
                        components: createModalFields({
                            name: {
                                label: "Nome do ticket no menu",
                                placeholder: "Nome do ticket no menu aqui ex:(suporte)",
                                style: TextInputStyle.Short,
                                required: true,
                                maxLength: 23,
                                minLength: 2,
                                value: fieldNameTicketValue,
                            },
                            description: {
                                label: "Descrição",
                                placeholder: "descrição do ticket aqui",
                                style: TextInputStyle.Short,
                                required: false,
                                maxLength: 40,
                                minLength: 2,
                                value: fieldDescriptionTicketValue,
                            },
                            emoji: {
                                label: "Emoji do ticket no menu",
                                placeholder: "Emoji do ticket no menu aqui ex:(🚩)",
                                style: TextInputStyle.Short,
                                required: false,
                                maxLength: 40,
                                value: fieldEmojiTicketValue,
                            },
                        }),
                    });
                }
                case "name": {
                    // Procurar os índices dos campos
                    const fieldNameTicketIndex = fields.findIndex(f => f.name === "Nome do ticket");
                    // Obter os valores dos campos ou uma string padrão
                    const fieldNameTicketValue = fieldNameTicketIndex !== -1 ? fields[fieldNameTicketIndex].value : "ticketName";
                    return interaction.showModal({
                        customId: "tickets/add/manage/nameModal",
                        title: "Nome",
                        components: createModalFields({
                            name: {
                                label: "Nome do ticket",
                                placeholder: "Nome do ticket aqui ex:(ticket de suporte)",
                                style: TextInputStyle.Short,
                                required: true,
                                maxLength: 25,
                                minLength: 2,
                                value: fieldNameTicketValue,
                            },
                        }),
                    });
                }
                case "contentOpen": {
                    const fieldContentTicketIndex = fields.findIndex(f => f.name === "Conteúdo do ticket ao abrir");
                    const fieldEmbedTicketIndex = fields.findIndex(f => f.name === "Embed do ticket ao abrir");
                    // Obter os valores dos campos ou uma string padrão
                    const fieldContentTicketValue = fieldContentTicketIndex !== -1 ? fields[fieldContentTicketIndex].value : "{user} Bem vindo ao ticket!";
                    const fieldEmbedTicketValue = fieldEmbedTicketIndex !== -1 ? fields[fieldEmbedTicketIndex].value : "embed1";
                    return interaction.showModal({
                        customId: "tickets/add/manage/contentOpenModal",
                        title: "Conteúdo",
                        components: createModalFields({
                            content: {
                                label: "Conteúdo ao abrir ticket",
                                placeholder: "Conteúdo do ticket aqui",
                                style: TextInputStyle.Paragraph,
                                required: false,
                                maxLength: 1500,
                                value: fieldContentTicketValue
                            },
                            embed: {
                                label: "Embed ao abrir ticket",
                                placeholder: "Nome do embed aqui ex:(embed1)",
                                style: TextInputStyle.Short,
                                required: false,
                                value: fieldEmbedTicketValue
                            },
                        }),
                    });
                }
                case "saveTicket": {
                    const fieldNameTicket = fields.findIndex(f => f.name === "Nome do ticket");
                    const fieldLabelTicket = fields.findIndex(f => f.name === "Nome do ticket no menu");
                    const fieldDescriptionTicket = fields.findIndex(f => f.name === "Descrição do ticket");
                    const fieldEmojiTicket = fields.findIndex(f => f.name === "Emoji do ticket");
                    const fieldEmbedOpenTicket = fields.findIndex(f => f.name === "Embed do ticket ao abrir");
                    const fieldContentOpenTicket = fields.findIndex(f => f.name === "Conteúdo do ticket ao abrir");
                    // Validação: Verifica se ao menos um conteúdo ou embed está presente para abrir ou fechar o ticket
                    if ((fieldEmbedOpenTicket === -1 && fieldContentOpenTicket === -1)) {
                        return interaction.reply({ flags, content: `É necessário ao menos um conteúdo ou embed para abrir o ticket` });
                    }
                    // Validação: Verifica se o nome do ticket no menu foi fornecido
                    if (fieldLabelTicket === -1) {
                        return interaction.reply({ flags, content: `É necessário fornecer o nome do ticket no menu!` });
                    }
                    // Validação: Verifica se o nome do ticket foi fornecido
                    if (fieldNameTicket === -1) {
                        return interaction.reply({ flags, content: `É necessário fornecer o nome do ticket!` });
                    }
                    // Obtenção dos valores dos campos
                    const ticketname = fields[fieldNameTicket]?.value;
                    const labelMenu = fields[fieldLabelTicket]?.value;
                    const descriptionMenu = fieldDescriptionTicket !== -1 ? fields[fieldDescriptionTicket]?.value : undefined;
                    const emojiMenu = fieldEmojiTicket !== -1 ? fields[fieldEmojiTicket]?.value : undefined;
                    const ticketMessage = fieldContentOpenTicket !== -1 ? fields[fieldContentOpenTicket]?.value : undefined;
                    const embedMessage = fieldEmbedOpenTicket !== -1 ? fields[fieldEmbedOpenTicket]?.value : undefined;
                    // Criação do objeto TicketDetails
                    const newTicket = {
                        ticketname,
                        labelMenu,
                        descriptionMenu,
                        emojiMenu,
                        ticketMessage,
                        embedMessage,
                    };
                    const tickets = await db.guilds.get("tickets") || [];
                    tickets.push(newTicket);
                    await db.guilds.set("tickets", tickets);
                    // Responde ao usuário
                    return interaction.update({ content: `O ticket "${ticketname}" foi salvo com sucesso!`, embeds: [], components: [] });
                }
            }
        }
        else {
            switch (action) {
                case "aparencyModal": {
                    const name = interaction.fields.getTextInputValue("name");
                    const description = interaction.fields.getTextInputValue("description");
                    const emoji = interaction.fields.getTextInputValue("emoji");
                    const fieldNameTicket = fields.findIndex(f => f.name === "Nome do ticket no menu");
                    const fieldDescriptionTicket = fields.findIndex(f => f.name === "Descrição do ticket");
                    const fieldEmojiTicket = fields.findIndex(f => f.name === "Emoji do ticket");
                    // Atualiza ou adiciona o nome do ticket no menu
                    if (fieldNameTicket !== -1) {
                        fields[fieldNameTicket].value = name;
                    }
                    else {
                        fields.push({ name: "Nome do ticket no menu", value: name, inline: true });
                    }
                    // Atualiza ou adiciona a descrição do ticket no menu
                    if (description) {
                        if (fieldDescriptionTicket !== -1) {
                            fields[fieldDescriptionTicket].value = description;
                        }
                        else {
                            fields.push({ name: "Descrição do ticket", value: description, inline: true });
                        }
                    }
                    else if (fieldDescriptionTicket !== -1) {
                        fields.splice(fieldDescriptionTicket, 1); // Remove a descrição se o valor estiver vazio
                    }
                    // Atualiza ou adiciona o emoji do ticket no menu
                    if (emoji) {
                        if (fieldEmojiTicket !== -1) {
                            fields[fieldEmojiTicket].value = emoji;
                        }
                        else {
                            fields.push({ name: "Emoji do ticket", value: emoji, inline: true });
                        }
                    }
                    else if (fieldEmojiTicket !== -1) {
                        fields.splice(fieldEmojiTicket, 1); // Remove o emoji se o valor estiver vazio
                    }
                    // Define os campos no embed
                    embed.setFields(fields);
                    return interaction.update({ embeds: [embed], components: menus.ticketsAdd().components });
                }
                case "nameModal": {
                    const tickets = await db.guilds.get("tickets") || [];
                    const name = interaction.fields.getTextInputValue("name");
                    if (tickets.includes(ticket => ticket.ticketname === name)) {
                        return interaction.reply({ flags, content: `Um ticket com o nome "${name}" já existe! Tente outro nome.` });
                    }
                    ;
                    const fieldNameTicket = fields.findIndex(f => f.name === "Nome do ticket");
                    if (fieldNameTicket !== -1) {
                        fields[fieldNameTicket].value = name;
                    }
                    else {
                        fields.unshift({ name: "Nome do ticket", value: name, inline: true });
                    }
                    ;
                    embed.setFields(fields);
                    return interaction.update({ embeds: [embed], components: menus.ticketsAdd().components });
                }
                case "contentOpenModal": {
                    const embeds = await db.guilds.get("embeds") || [];
                    const content = interaction.fields.getTextInputValue("content");
                    const embedChoice = interaction.fields.getTextInputValue("embed");
                    const fieldContentTicket = fields.findIndex(f => f.name === "Conteúdo do ticket ao abrir");
                    const fieldEmbedTicket = fields.findIndex(f => f.name === "Embed do ticket ao abrir");
                    if (!embedChoice && !content) {
                        return interaction.reply({ content: `O conteúdo do ticket ao abrir não pode ser vazio! Forneça um conteúdo ou embed.`, flags });
                    }
                    if (embedChoice) {
                        // Verifica se o embed existe
                        const embedExists = embeds.some(embed => embed.name === embedChoice);
                        if (!embedExists) {
                            return interaction.reply({ content: `O embed ${embedChoice} não existe! Tente novamente.`, flags });
                        }
                        // Atualiza ou cria o field do embed
                        if (fieldEmbedTicket !== -1) {
                            fields[fieldEmbedTicket].value = embedChoice; // Substitui o field
                        }
                        else {
                            fields.push({ name: "Embed do ticket ao abrir", value: embedChoice, inline: true }); // Cria o field
                        }
                    }
                    else if (fieldEmbedTicket !== -1) {
                        fields.splice(fieldEmbedTicket, 1); // Remove o field se o valor estiver vazio
                    }
                    if (content) {
                        // Atualiza ou cria o field do conteúdo
                        if (fieldContentTicket !== -1) {
                            fields[fieldContentTicket].value = content; // Substitui o field
                        }
                        else {
                            fields.push({ name: "Conteúdo do ticket ao abrir", value: content, inline: true }); // Cria o field
                        }
                    }
                    else if (fieldContentTicket !== -1) {
                        fields.splice(fieldContentTicket, 1); // Remove o field se o valor estiver vazio
                    }
                    // Atualiza os fields do embed
                    embed.setFields(fields);
                    // Atualiza a interação com o novo embed e componentes
                    return interaction.update({ embeds: [embed], components: menus.ticketsAdd().components });
                }
            }
        }
    }
});
