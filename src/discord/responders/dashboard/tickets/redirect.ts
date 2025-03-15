import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { StringSelectMenuBuilder, EmbedField, ButtonBuilder, ButtonStyle } from "discord.js";
import { db } from "#database";
import { Embed, TicketDetails } from "#types";

createResponder({
    customId: "tickets/manage/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isButton()) {
            switch(action) {
                case "add": {
                    return interaction.update(menus.ticketsAdd())
                }
                case "edit": {        
                    // Verifica se há tickets no arquivo de configuração
                    const tickets = await db.guilds.get<TicketDetails[]>("tickets") || []
                    if (!tickets || tickets.length === 0) {
                        return interaction.reply({ content: "Não há tickets cadastrados, aperte no botão de adicionar ticket", flags });
                    }
                
                
                    // Se houver apenas um ticket
                    if (tickets.length === 1) {
                        const ticketDetails = tickets[0];
                        const ticketName = ticketDetails.ticketname;
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
                            fields: fields as Partial<EmbedField>[],
                        });
                    
                        return interaction.update({ embeds: [embed], components: (menus.ticketsAdd() as any).components });
                    }
                    
                
                    // Se houver mais de um ticket
                    const options = tickets.map((ticketDetails) => {
                        const option: any = {
                            label: String(ticketDetails.labelMenu),
                            value: String(ticketDetails.ticketname),
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
                    })
                
                    return interaction.update({ embeds: [embed], components: [row] });
                }
                case "del": {
                    const tickets = await db.guilds.get<TicketDetails[]>("tickets") || [];
                
                    // Verifica se há tickets no arquivo de configuração
                    if (!tickets || tickets.length === 0) {
                        return interaction.reply({ content: "Não há tickets cadastrados. Aperte no botão de adicionar ticket.", flags });
                    }
                
                    if (tickets.length === 1) {
                        tickets.splice(0, 1);
                        return interaction.reply({ content: "O seu único ticket existente foi deletado com sucesso!" });
                    }
                
                    const options = tickets
                        .map((ticketDetails) => {
                            // Validações de tamanho e conteúdo
                            if (
                                !ticketDetails.ticketname || ticketDetails.ticketname.length > 100 || // Nome inválido
                                !ticketDetails.labelMenu || ticketDetails.labelMenu.length > 100 || // Label inválido
                                (ticketDetails.descriptionMenu && ticketDetails.descriptionMenu.length > 100) // Descrição longa demais
                            ) {
                                return null; // Ignora tickets inválidos
                            }
                
                            const option: any = {
                                label: String(ticketDetails.labelMenu).slice(0, 100),
                                value: String(ticketDetails.ticketname).slice(0, 100),
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
                            flags
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
                    const embeds = await db.guilds.get<Embed[]>("embeds") || [];
                    const tickets = await db.guilds.get<TicketDetails[]>("tickets") || [];

                    if (tickets.length === 0) {
                        return interaction.reply({ content: "Nenhum ticket foi encontrado.", flags });
                    }

                    if (!embeds || embeds.length === 0) {
                        return interaction.reply({ content: "Nenhum embed foi encontrado.", flags });
                    }

                    const selectMenuOptions = (embeds as Embed[]).map(embed => ({
                        label: embed.name,
                        value: embed.name,
                        emoji: "📜"
                    }));

                    const row = createRow(
                        new StringSelectMenuBuilder({
                            customId: "atribuir/ticket/embed",
                            placeholder: "Selecione o embed que deseja atribuir tickets",
                            options: selectMenuOptions
                        })
                    );

                    const button = createRow(
                        new ButtonBuilder({
                            customId: "return/tickets",
                            emoji: '↩️', 
                            style: ButtonStyle.Secondary
                        })
                    );

                    const embedMessage = createEmbed({
                        title: "Atribuindo tickets",
                        description: "Selecione o embed que deseja atribuir tickets",
                        color: settings.colors.primary,
                    })

                    return interaction.update({  embeds: [embedMessage], components: [row, button] });
                }
            }
        } else {
            switch(action) {
                case "editChoice": {
                    const choice = interaction.values[0]; // Valor escolhido no menu
                    const tickets = await db.guilds.get<TicketDetails[]>("tickets") || [];
                
                    if (!tickets || tickets.length === 0) {
                        return interaction.reply({ content: "Não há tickets cadastrados, aperte no botão de adicionar ticket", ephemeral: true });
                    }
                
                    // Busca o ticket selecionado
                    const ticketDetails = tickets.find(ticket => ticket.ticketname === choice);
                
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
                        fields: fields as Partial<EmbedField>[],
                    });
                
                    return interaction.update({ embeds: [embed], components: (menus.ticketsAdd() as any).components });
                }      
                case "deleteChoice": {
                    const choices = interaction.values; // Obtem as escolhas do usuário (array de valores)
                    const tickets = await db.guilds.get<TicketDetails[]>("tickets") || [];
                
                    if (!tickets || tickets.length === 0) {
                        return interaction.reply({
                            content: "Não há tickets cadastrados. Aperte no botão de adicionar ticket.",
                            flags
                        });
                    }
                
                    const newTickets = tickets.filter(ticket => !choices.includes(ticket.ticketname));

                    await db.guilds.set("tickets", newTickets);
                
                    return interaction.reply({ content: `Os tickets selecionados (${choices.join(', ')}) foram deletados com sucesso.`, flags });
                }                
            }
        }
    },
});