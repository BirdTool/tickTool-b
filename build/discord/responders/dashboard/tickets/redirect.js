import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
createResponder({
    customId: "tickets/manage/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isButton()) {
            switch (action) {
                case "add": {
                    return interaction.update(menus.ticketsAdd());
                }
                case "edit": {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '../../../data/config.json');
                    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    // Verifica se há tickets no arquivo de configuração
                    if (!config.ticketsManage || Object.keys(config.ticketsManage).length === 0) {
                        return interaction.reply({ content: "Não há tickets cadastrados, aperte no botão de adicionar ticket", flags });
                    }
                    const tickets = Object.entries(config.ticketsManage);
                    // Se houver apenas um ticket
                    if (tickets.length === 1) {
                        const [ticketName, ticketDetails] = tickets[0];
                        const fields = [
                            { name: "Nome do ticket", value: String(ticketName), inline: true },
                            { name: "Nome do ticket no menu", value: String(ticketDetails.labelMenu), inline: true },
                            ticketDetails.descriptionMenu && { name: "Descrição do ticket", value: String(ticketDetails.descriptionMenu), inline: true },
                            ticketDetails.emojiMenu && { name: "Emoji do ticket", value: String(ticketDetails.emojiMenu), inline: true },
                            ticketDetails.ticketMessage && { name: "Conteúdo do ticket ao abrir", value: String(ticketDetails.ticketMessage), inline: true },
                            ticketDetails.embedMessage && { name: "Embed do ticket ao abrir", value: String(ticketDetails.embedMessage), inline: true },
                            ticketDetails.closeTicketMessage && { name: "Conteúdo do ticket ao fechar", value: String(ticketDetails.closeTicketMessage), inline: true },
                            ticketDetails.closeTicketEmbedMessage && { name: "Embed do ticket ao fechar", value: String(ticketDetails.closeTicketEmbedMessage), inline: true },
                        ].filter(Boolean); // Remove valores falsy (null, undefined, false)
                        const embed = createEmbed({
                            title: "Detalhes do Ticket",
                            fields: fields,
                        });
                        return interaction.update({ embeds: [embed], components: menus.ticketsAdd().components });
                    }
                    // Se houver mais de um ticket
                    const options = tickets.map(([ticketName, ticketDetails]) => {
                        const option = {
                            label: String(ticketDetails.labelMenu),
                            value: String(ticketName),
                        };
                        if (ticketDetails.descriptionMenu) {
                            option.description = String(ticketDetails.descriptionMenu);
                        }
                        if (ticketDetails.emojiMenu) {
                            option.emoji = String(ticketDetails.emojiMenu);
                        }
                        return option;
                    });
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('tickets/manage/editChoice')
                        .setPlaceholder('Selecione um ticket para editar')
                        .addOptions(options);
                    const row = createRow(selectMenu);
                    const embed = createEmbed({
                        title: "Editor de tickets",
                        description: `Selecione um ticket para editar`,
                        color: settings.colors.warning
                    });
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "del": {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '../../../data/config.json');
                    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    // Verifica se há tickets no arquivo de configuração
                    if (!config.ticketsManage || Object.keys(config.ticketsManage).length === 0) {
                        return interaction.reply({ content: "Não há tickets cadastrados. Aperte no botão de adicionar ticket.", ephemeral: true });
                    }
                    const tickets = Object.entries(config.ticketsManage);
                    if (tickets.length === 1) {
                        delete config.ticketsManage[tickets[0][0]];
                        fs.writeFileSync(filePath, JSON.stringify(config, null, 4), 'utf-8');
                        return interaction.reply({ content: "O seu único ticket existente foi deletado com sucesso!" });
                    }
                    const options = tickets
                        .map(([ticketName, ticketDetails]) => {
                        // Validações de tamanho e conteúdo
                        if (!ticketName || ticketName.length > 100 || // Nome inválido
                            !ticketDetails.labelMenu || ticketDetails.labelMenu.length > 100 || // Label inválido
                            (ticketDetails.descriptionMenu && ticketDetails.descriptionMenu.length > 100) // Descrição longa demais
                        ) {
                            return null; // Ignora tickets inválidos
                        }
                        const option = {
                            label: String(ticketDetails.labelMenu).slice(0, 100),
                            value: String(ticketName).slice(0, 100),
                        };
                        if (ticketDetails.descriptionMenu) {
                            option.description = String(ticketDetails.descriptionMenu).slice(0, 100);
                        }
                        if (ticketDetails.emojiMenu) {
                            option.emoji = String(ticketDetails.emojiMenu);
                        }
                        return option;
                    })
                        .filter(Boolean); // Remove tickets inválidos
                    // Verifica se há pelo menos uma opção válida
                    if (options.length === 0) {
                        return interaction.reply({
                            content: "Nenhum ticket válido foi encontrado para deletar.",
                            ephemeral: true,
                        });
                    }
                    // Limita o número de opções a 25
                    const limitedOptions = options.slice(0, 25);
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('tickets/manage/deleteChoice')
                        .setPlaceholder('Selecione um ticket para deletar')
                        .addOptions(limitedOptions)
                        .setMaxValues(limitedOptions.length);
                    const row = createRow(selectMenu);
                    const embed = createEmbed({
                        title: "Apagador de tickets",
                        description: "Selecione um ticket para deletar",
                        color: settings.colors.danger,
                    });
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "atribuir": {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '../../../data/embeds.json');
                    const embed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    const embeds = Object.keys(embed);
                    const selectMenuOptions = embeds.map(name => ({
                        label: name,
                        value: name,
                        emoji: "📜"
                    }));
                    const row = createRow(new StringSelectMenuBuilder({
                        customId: "atribuir/ticket/embed",
                        placeholder: "Selecione o embed que deseja atribuir tickets",
                        options: selectMenuOptions
                    }));
                    const button = createRow(new ButtonBuilder({
                        customId: "dashboard/return/tickets",
                        emoji: '↩️',
                        style: ButtonStyle.Secondary
                    }));
                    const embedMessage = createEmbed({
                        title: "Atribuindo tickets",
                        description: "Selecione o embed que deseja atribuir tickets",
                        color: settings.colors.primary,
                    });
                    return interaction.update({ embeds: [embedMessage], components: [row, button] });
                }
            }
        }
        else {
            switch (action) {
                case "editChoice": {
                    const choice = interaction.values[0]; // Valor escolhido no menu
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '../../../data/config.json');
                    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    if (!config.ticketsManage || Object.keys(config.ticketsManage).length === 0) {
                        return interaction.reply({ content: "Não há tickets cadastrados, aperte no botão de adicionar ticket", ephemeral: true });
                    }
                    // Busca o ticket selecionado
                    const ticketDetails = config.ticketsManage[choice];
                    if (!ticketDetails) {
                        return interaction.reply({ content: "O ticket selecionado não foi encontrado.", ephemeral: true });
                    }
                    // Cria os campos para o embed
                    const fields = [
                        { name: "Nome do ticket", value: String(choice), inline: true },
                        { name: "Nome do ticket no menu", value: String(ticketDetails.labelMenu), inline: true },
                        ticketDetails.descriptionMenu && { name: "Descrição do ticket", value: String(ticketDetails.descriptionMenu), inline: true },
                        ticketDetails.emojiMenu && { name: "Emoji do ticket", value: String(ticketDetails.emojiMenu), inline: true },
                        ticketDetails.ticketMessage && { name: "Conteúdo do ticket ao abrir", value: String(ticketDetails.ticketMessage), inline: true },
                        ticketDetails.embedMessage && { name: "Embed do ticket ao abrir", value: String(ticketDetails.embedMessage), inline: true },
                        ticketDetails.closeTicketMessage && { name: "Conteúdo do ticket ao fechar", value: String(ticketDetails.closeTicketMessage), inline: true },
                        ticketDetails.closeTicketEmbedMessage && { name: "Embed do ticket ao fechar", value: String(ticketDetails.closeTicketEmbedMessage), inline: true },
                    ].filter(Boolean); // Remove valores falsy (null, undefined, false)
                    // Cria o embed com os detalhes do ticket
                    const embed = createEmbed({
                        title: `Detalhes do Ticket: ${choice}`,
                        fields: fields,
                    });
                    return interaction.update({ embeds: [embed], components: menus.ticketsAdd().components });
                }
                case "deleteChoice": {
                    const choices = interaction.values; // Obtem as escolhas do usuário (array de valores)
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, '../../../data/config.json');
                    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    if (!config.ticketsManage || Object.keys(config.ticketsManage).length === 0) {
                        return interaction.reply({
                            content: "Não há tickets cadastrados. Aperte no botão de adicionar ticket.",
                            flags
                        });
                    }
                    // Deleta os tickets selecionados
                    choices.forEach(choice => {
                        if (config.ticketsManage && config.ticketsManage[choice]) {
                            delete config.ticketsManage[choice];
                        }
                    });
                    // Salva as alterações no arquivo
                    fs.writeFileSync(filePath, JSON.stringify(config, null, 4));
                    return interaction.reply({ content: `Os tickets selecionados (${choices.join(', ')}) foram deletados com sucesso.`, flags });
                }
            }
        }
    },
});
