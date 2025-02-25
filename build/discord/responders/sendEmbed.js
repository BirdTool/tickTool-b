import { createResponder, ResponderType } from "#base";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { logChannel } from "../../functions/log.js";
import { db } from "#database";
createResponder({
    customId: "send/embed/:stap",
    types: [ResponderType.Button, ResponderType.StringSelect, ResponderType.ChannelSelect], cache: "cached",
    async run(interaction, { stap }) {
        const embedJson = await db.guilds.get("embeds") || [];
        if (interaction.isButton()) {
            switch (stap) {
                case "optionsEmbed": {
                    const getEmbeds = embedJson;
                    const embed = createEmbed({
                        title: `Enviando embed`,
                        description: `Selecione qual embed deseja enviar`,
                        color: settings.colors.green
                    });
                    const options = (getEmbeds).map(name => ({
                        label: name.name,
                        value: name.name,
                        emoji: "📜"
                    }));
                    const row = createRow(new StringSelectMenuBuilder({
                        customId: "send/embed/choiceEmbed",
                        placeholder: "Selecione o embed que deseja enviar",
                        options
                    }));
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "sendNormal": {
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // pegar a escolha do usuário
                    if (!embedChoiceName || !(embedChoiceName in embedJson)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags
                        });
                    }
                    ;
                    const embed = createEmbed({
                        title: `Enviando embed`,
                        description: `Selecione o canal pra enviar o embed`,
                        fields: [{ name: `Embed escolhido`, value: embedChoiceName, inline: true }],
                        color: settings.colors.green
                    });
                    const row = createRow(new ChannelSelectMenuBuilder({
                        customId: "send/embed/channel",
                        placeholder: "Selecione o canal para enviar o embed",
                        channelTypes: [ChannelType.GuildText]
                    }));
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "sendWithTicket": {
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // pegar a escolha do usuário
                    if (!embedChoiceName || !embedJson.some(embed => embed.name === embedChoiceName)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags
                        });
                    }
                    ;
                    const embedChoice = embedJson.find(embed => embed.name === embedChoiceName);
                    if (!embedChoice) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags
                        });
                    }
                    const hasTicket = embedChoice ? Array.isArray(embedChoice.tickets) && embedChoice.tickets.length > 0 : false;
                    if (!hasTicket) {
                        return interaction.reply("Este embed não tem tickets registrados!");
                    }
                    ;
                    const embed = createEmbed({
                        title: `Enviando embed`,
                        description: `Selecione o canal pra enviar o embed`,
                        fields: [{ name: `Embed escolhido`, value: embedChoiceName, inline: true }],
                        color: settings.colors.green
                    });
                    const row = createRow(new ChannelSelectMenuBuilder({
                        customId: "send/embed/channelTicket",
                        placeholder: "Selecione o canal para enviar o embed",
                        channelTypes: [ChannelType.GuildText]
                    }));
                    return interaction.update({ embeds: [embed], components: [row] });
                }
            }
        }
        else if (interaction.isStringSelectMenu()) {
            switch (stap) {
                case "choiceEmbed": {
                    const choice = interaction.values[0]; // embed selecionado pelo usuário
                    if (choice in embedJson == undefined) { // verifica se o embed existe
                        return interaction.reply("Eu não encontrei esse embed!");
                    }
                    ;
                    const embed = createEmbed({
                        title: `Enviando embed`,
                        description: `Selecione a maneira que deseja enviar seu embed`,
                        fields: [{ name: `Embed escolhido`, value: choice, inline: true }],
                        color: settings.colors.green
                    });
                    const embedChoice = embedJson.find(embed => embed.name === choice);
                    if (!embedChoice) {
                        return interaction.reply({
                            content: `Embed "${choice}" não encontrado.`,
                            flags
                        });
                    }
                    const hasTicket = embedChoice ? Array.isArray(embedChoice.tickets) && embedChoice.tickets.length > 0 : false;
                    const hasTicketInvert = hasTicket === true ? false : true; // inverter o booleano de hasTicket
                    const row = createRow(new ButtonBuilder({
                        customId: "send/embed/sendNormal",
                        label: "Enviar sem botões ou menu",
                        style: ButtonStyle.Success
                    }), new ButtonBuilder({
                        customId: "send/embed/sendWithTicket",
                        label: "Enviar com botões ou menu",
                        style: ButtonStyle.Success,
                        disabled: hasTicketInvert // true para disativado, false para ativado
                    }));
                    return interaction.update({ embeds: [embed], components: [row] });
                }
            }
        }
        else {
            switch (stap) {
                case "channel": {
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // pegar a escolha do usuário
                    if (!embedChoiceName || !(embedChoiceName in embedJson)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags
                        });
                    }
                    ;
                    const embedChoice = embedJson.find(embed => embed.name === embedChoiceName);
                    if (!embedChoice) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags
                        });
                    }
                    const choice = interaction.values[0]; // canal escolhido pelo usuário
                    const channel = interaction.guild?.channels.cache.get(choice);
                    // Verifica se o canal é um canal de texto
                    if (!channel || channel.type !== ChannelType.GuildText) {
                        return interaction.reply({ content: "Por favor, selecione um canal de texto válido.", flags });
                    }
                    ;
                    const embed = new EmbedBuilder()
                        .setColor(parseInt(embedChoice.color.replace("#", ""), 16))
                        .setTitle(embedChoice.title ?? null)
                        .setDescription(embedChoice.description ?? null)
                        .setFields(embedChoice.fields || [])
                        .setFooter({ text: embedChoice.footer?.text ?? null, iconURL: embedChoice.footer?.icon_url ?? null })
                        .setAuthor({ name: embedChoice.author?.name ?? null, iconURL: embedChoice.author?.icon_url ?? null, url: embedChoice.author?.url ?? null })
                        .setThumbnail(embedChoice.thumbnail?.url ?? null)
                        .setImage(embedChoice.image?.url ?? null);
                    // Envia o embed no canal escolhido
                    await channel.send({ embeds: [embed] });
                    // avisar no canal de logs
                    logChannel(interaction, "Embed enviado", `Embed enviado com sucesso no canal <#${choice}>!`, interaction.user.username, interaction.user.displayAvatarURL({ size: 128 }));
                    // Responde ao usuário para confirmar que foi enviado
                    return interaction.update({ content: `Embed enviado com sucesso no canal <#${choice}>!`, embeds: [], components: [] });
                }
                case "channelTicket": {
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // Pega a escolha do usuário
                    if (!embedChoiceName || !embedJson.some(embed => embed.name === embedChoiceName)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags,
                        });
                    }
                    const embedChoice = embedJson.find(embed => embed.name === embedChoiceName);
                    if (!embedChoice) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags,
                        });
                    }
                    const choice = interaction.values[0]; // Canal escolhido pelo usuário
                    const channel = interaction.guild?.channels.cache.get(choice);
                    // Verifica se o canal é um canal de texto
                    if (!channel || channel.type !== ChannelType.GuildText) {
                        return interaction.reply({ content: "Por favor, selecione um canal de texto válido.", flags });
                    }
                    // Criação do embed baseado na configuração do embed escolhido
                    const embed = new EmbedBuilder()
                        .setColor(parseInt(embedChoice.color.replace("#", ""), 16))
                        .setTitle(embedChoice.title ?? null)
                        .setDescription(embedChoice.description ?? null)
                        .setFields(embedChoice.fields || [])
                        .setFooter({ text: embedChoice.footer?.text ?? null, iconURL: embedChoice.footer?.icon_url ?? null })
                        .setAuthor({ name: embedChoice.author?.name ?? null, iconURL: embedChoice.author?.icon_url ?? null, url: embedChoice.author?.url ?? null })
                        .setThumbnail(embedChoice.thumbnail?.url ?? null)
                        .setImage(embedChoice.image?.url ?? null);
                    const tickets = embedChoice.tickets || [];
                    let componentsMenu;
                    if (tickets?.length === 1) {
                        const ticketsDB = await db.guilds.get("tickets") || [];
                        const ticketDetails = ticketsDB[0];
                        if (!ticketDetails) {
                            return interaction.reply({ content: `Detalhes do ticket "${tickets[0]}" não encontrados.`, flags });
                        }
                        componentsMenu = createRow(new ButtonBuilder({
                            label: ticketDetails.labelMenu,
                            customId: `open-ticket/button/${tickets[0]}`,
                            style: ButtonStyle.Success,
                            emoji: ticketDetails.emojiMenu ?? undefined
                        }));
                    }
                    else if (tickets?.length > 1) {
                        const options = await Promise.all(tickets
                            .map(async (ticketName) => {
                            const ticketsDB = await db.guilds.get("tickets") || [];
                            const ticketDetails = ticketsDB.find(ticket => ticketName.includes(ticket.ticketname));
                            if (!ticketDetails) {
                                console.warn(`Detalhes do ticket "${ticketName}" não encontrados.`);
                                return null;
                            }
                            return {
                                label: ticketDetails.labelMenu,
                                value: ticketName.toString(),
                                description: ticketDetails.descriptionMenu ?? undefined,
                                emoji: ticketDetails.emojiMenu ?? undefined,
                            };
                        })).then(options => options.filter(option => option !== null)); // Remove tickets inválidos
                        if (options.length === 0) {
                            return interaction.reply({ content: "Nenhum ticket válido encontrado para o embed.", flags });
                        }
                        componentsMenu = createRow(new StringSelectMenuBuilder({
                            customId: "open-ticket/select",
                            placeholder: "Selecione um ticket",
                            options
                        }));
                    }
                    else {
                        return interaction.reply({ content: "Nenhum ticket encontrado para este embed.", flags });
                    }
                    // Envia o embed no canal escolhido
                    await channel.send({ embeds: [embed], components: [componentsMenu] });
                    // Responde ao usuário para confirmar que foi enviado
                    return interaction.update({ content: `Embed enviado com sucesso no canal <#${choice}>!`, embeds: [], components: [] });
                }
            }
        }
    },
});
