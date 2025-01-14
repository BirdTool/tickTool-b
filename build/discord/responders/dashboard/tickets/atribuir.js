import { createResponder, ResponderType } from "#base";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { menus } from "#menus";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { StringSelectMenuBuilder } from "discord.js";
createResponder({
    customId: "atribuir/ticket/:stap",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction, { stap }) {
        if (stap === "embed") {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const configPath = path.resolve(__dirname, '../../../data/config.json');
            const embedPath = path.resolve(__dirname, '../../../data/embeds.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const embedJson = JSON.parse(fs.readFileSync(embedPath, 'utf-8'));
            const choice = interaction.values[0];
            if (choice in embedJson == undefined) { // verifica se o embed existe
                return interaction.reply(`Não encontrei o embed ${choice}!`);
            }
            ;
            if (!config.ticketsManage) { // verifica se existe um ticket
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
            const selectMenuOptions = Object.entries(config.ticketsManage).map(([ticketName, ticketDetails]) => {
                const option = {
                    label: ticketDetails.labelMenu || ticketName, // Usa o labelMenu ou o nome do ticket
                    value: ticketName, // Nome do ticket no value
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
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const configPath = path.resolve(__dirname, '../../../data/config.json');
            const embedPath = path.resolve(__dirname, '../../../data/embeds.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const embedJson = JSON.parse(fs.readFileSync(embedPath, 'utf-8'));
            const choices = interaction.values; // Valores selecionados pelo usuário
            // Obtém o nome do embed selecionado
            const embedChoiceName = interaction.message.embeds[0]?.fields[0]?.value;
            if (!embedChoiceName || !(embedChoiceName in embedJson)) {
                return interaction.reply({
                    content: `Embed "${embedChoiceName}" não encontrado.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
            // Obtém o embed selecionado do JSON
            const selectedEmbed = embedJson[embedChoiceName];
            // Inicializa 'tickets' como um array vazio, se estiver undefined
            selectedEmbed.tickets = selectedEmbed.tickets || [];
            // Atualiza a propriedade 'tickets', garantindo que não haja duplicatas
            selectedEmbed.tickets = Array.from(new Set([...selectedEmbed.tickets, ...choices]));
            // Salva as mudanças no arquivo de embeds
            fs.writeFileSync(embedPath, JSON.stringify(embedJson, null, 4), 'utf-8');
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
            return interaction.update({
                embeds: [embed],
                components: [], // Remove os menus de seleção após a atualização
            });
        }
    },
});
