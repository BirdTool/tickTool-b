import { createResponder, ResponderType } from "#base";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const embedPath = path.resolve(__dirname, '../data/embeds.json');
const embedJson = JSON.parse(fs.readFileSync(embedPath, 'utf-8'));
createResponder({
    customId: "send/embed/:stap",
    types: [ResponderType.Button, ResponderType.StringSelect, ResponderType.ChannelSelect], cache: "cached",
    async run(interaction, { stap }) {
        if (interaction.isButton()) {
            switch (stap) {
                case "optionsEmbed": {
                    const getEmbeds = Object.keys(embedJson); // pega todos os embeds
                    const embed = createEmbed({
                        title: `Enviando embed`,
                        description: `Selecione qual embed deseja enviar`,
                        color: settings.colors.green
                    });
                    const selectMenuOptions = getEmbeds.map(name => ({
                        label: name,
                        value: name,
                        emoji: "📜"
                    }));
                    const row = createRow(new StringSelectMenuBuilder({
                        customId: "send/embed/choiceEmbed",
                        placeholder: "Selecione o embed que deseja enviar",
                        options: selectMenuOptions
                    }));
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "sendNormal": {
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // pegar a escolha do usuário
                    if (!embedChoiceName || !(embedChoiceName in embedJson)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            ephemeral: true,
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
                    }));
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "sendWithTicket": {
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // pegar a escolha do usuário
                    if (!embedChoiceName || !(embedChoiceName in embedJson)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            ephemeral: true,
                        });
                    }
                    ;
                    const hasTicket = Array.isArray(embedJson[embedChoiceName]?.tickets) && embedJson[embedChoiceName].tickets.length > 0;
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
                    // verificar se existe tickets no embed
                    const hasTicket = Array.isArray(embedJson[choice]?.tickets) && embedJson[choice].tickets.length > 0;
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
                            ephemeral: true,
                        });
                    }
                    ;
                    const embedChoice = embedJson[embedChoiceName];
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
                    // Responde ao usuário para confirmar que foi enviado
                    return interaction.update({ content: `Embed enviado com sucesso no canal <#${choice}>!`, embeds: [], components: [] });
                }
                case "channelTicket": {
                    const configPath = path.resolve(__dirname, '../data/config.json');
                    const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value; // Pega a escolha do usuário
                    if (!embedChoiceName || !(embedChoiceName in embedJson)) {
                        return interaction.reply({
                            content: `Embed "${embedChoiceName}" não encontrado.`,
                            flags,
                        });
                    }
                    const embedChoice = embedJson[embedChoiceName];
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
                    if (!configJson.ticketsManage || Object.keys(configJson.ticketsManage).length === 0) {
                        return interaction.reply({ content: "Configuração de tickets não encontrada.", flags });
                    }
                    const tickets = embedChoice.tickets;
                    let componentsMenu;
                    if (tickets?.length === 1) {
                        const ticketDetails = configJson.ticketsManage[tickets[0]];
                        if (!ticketDetails) {
                            return interaction.reply({ content: `Detalhes do ticket "${tickets[0]}" não encontrados.`, flags });
                        }
                        componentsMenu = new ActionRowBuilder().addComponents(new ButtonBuilder()
                            .setLabel(ticketDetails.labelMenu)
                            .setCustomId(`open-ticket/button/${tickets[0]}`)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji(ticketDetails.emojiMenu ?? undefined));
                    }
                    else if (tickets?.length > 1) {
                        const menuOptions = tickets
                            .map(ticketName => {
                            const ticketDetails = configJson.ticketsManage[ticketName];
                            if (!ticketDetails) {
                                console.warn(`Detalhes do ticket "${ticketName}" não encontrados.`);
                                return null;
                            }
                            return {
                                label: ticketDetails.labelMenu,
                                value: ticketName,
                                description: ticketDetails.descriptionMenu ?? undefined,
                                emoji: ticketDetails.emojiMenu ?? undefined,
                            };
                        })
                            .filter(option => option !== null); // Remove tickets inválidos
                        if (menuOptions.length === 0) {
                            return interaction.reply({ content: "Nenhum ticket válido encontrado para o embed.", flags });
                        }
                        componentsMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
                            .setCustomId("open-ticket/select")
                            .setPlaceholder("Selecione um ticket")
                            .addOptions(menuOptions));
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
