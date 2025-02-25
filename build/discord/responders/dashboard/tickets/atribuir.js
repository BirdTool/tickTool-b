import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { StringSelectMenuBuilder } from "discord.js";
import { logChannel } from "../../../../functions/log.js";
import { db } from "#database";
createResponder({
    customId: "atribuir/ticket/:stap",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction, { stap }) {
        if (stap === "embed") {
            const embedJson = await db.guilds.get("embeds") || [];
            const tickets = await db.guilds.get("tickets") || [];
            const choice = interaction.values[0];
            if (!embedJson.some((embed) => embed.name === choice)) { // verifica se o embed existe
                return interaction.reply(`Não encontrei o embed ${choice}!`);
            }
            ;
            if (tickets.length === 0) { // verifica se existe um ticket
                interaction.reply({ content: `você não tem tickets configurado! crie um ticket primeiro`, flags });
                return interaction.update(menus.ticketsAdd());
            }
            ;
            const embed = createEmbed({
                title: `Gerenciando tickets`,
                description: `Escolha um ou mais tickets para atribuir ao embed: ${choice}`,
                color: settings.colors.warning,
                fields: [{ name: `Embed selecionado:`, value: `${choice}`, inline: true }]
            });
            const selectMenuOptions = tickets.map((ticketDetails) => {
                const option = {
                    label: ticketDetails.labelMenu || ticketDetails.ticketname, // Usa o labelMenu ou o nome do ticket
                    value: ticketDetails.ticketname, // Nome do ticket no value
                };
                // Adiciona descriptionMenu se existir
                if (ticketDetails.descriptionMenu) {
                    option.description = ticketDetails.descriptionMenu;
                }
                // Adiciona emojiMenu se existir
                if (ticketDetails.emojiMenu) {
                    option.emoji = ticketDetails.emojiMenu;
                }
                return option;
            });
            // Verifica se existem opções válidas
            if (selectMenuOptions.length === 0) {
                return interaction.reply({
                    content: "Nenhum ticket válido foi encontrado para atribuir.",
                    flags
                });
            }
            // Adiciona o Select Menu ao embed
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`atribuir/ticket/select`)
                .setPlaceholder('Escolha um ou mais tickets')
                .addOptions(selectMenuOptions)
                .setMaxValues(selectMenuOptions.length);
            const row = createRow(selectMenu);
            return interaction.update({
                embeds: [embed],
                components: [row],
            });
        }
        else {
            const embedJson = await db.guilds.get("embeds") || [];
            const choices = interaction.values; // Valores selecionados pelo usuário
            // Obtém o nome do embed selecionado
            const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value;
            if (!embedChoiceName || !embedJson.some((embed) => embed.name === embedChoiceName)) {
                return interaction.reply({
                    content: `Embed "${embedChoiceName}" não encontrado.`,
                    flags
                });
            }
            // Obtém o embed selecionado do JSON
            const selectedEmbed = embedJson.find(embed => embed.name === embedChoiceName);
            // Inicializa 'tickets' como um array vazio, se estiver undefined
            selectedEmbed.tickets = selectedEmbed.tickets || [];
            // Atualiza a propriedade 'tickets', garantindo que não haja duplicatas
            selectedEmbed.tickets = Array.from(new Set([...selectedEmbed.tickets, ...choices]));
            // Salvar as mudanças no banco de dados
            await db.guilds.set("embeds", embedJson);
            // Atualiza a mensagem do embed no Discord
            const embed = createEmbed({
                title: embedChoiceName,
                description: `Os seguintes tickets foram atribuídos ao embed:`,
                fields: selectedEmbed.tickets.map(ticket => ({
                    name: ticket,
                    value: `Atribuído com sucesso`,
                    inline: true,
                })),
                color: settings.colors.success,
            });
            //avisar no canal de logs
            logChannel(interaction, "Embed atualizado", `Foi atribuido os tickets \`${choices.join("`, `")}\` ao embed ${embedChoiceName}`, interaction.user.username, interaction.user.displayAvatarURL({ size: 128 }));
            return interaction.update({
                embeds: [embed],
                components: [], // Remove os menus de seleção após a atualização
            });
        }
    },
});
