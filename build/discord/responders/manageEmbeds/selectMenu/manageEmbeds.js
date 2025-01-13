import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createRow } from "@magicyan/discord";
createResponder({
    customId: "manage/embeds/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isButton()) {
            switch (action) {
                case "criar": {
                    return interaction.update(menus.createEmbed());
                }
            }
        }
        else {
            switch (action) {
                case "select": {
                    const choice = interaction.values[0]; // Nome do embed selecionado
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, "../../data/embeds.json");
                    // Ler o arquivo JSON
                    const rawData = fs.readFileSync(filePath, "utf8");
                    const embeds = JSON.parse(rawData);
                    // Verificar se o embed existe
                    if (!embeds[choice]) {
                        await interaction.reply({ content: `O embed "${choice}" não foi encontrado.`, flags: ["Ephemeral"] });
                        return;
                    }
                    // Obter o embed solicitado
                    const selectedEmbed = embeds[choice];
                    // Construir o embed dinamicamente
                    const embedMessage = {};
                    // Adicionar propriedades dinamicamente se existirem
                    if (selectedEmbed.color) {
                        embedMessage.color = parseInt(selectedEmbed.color.replace("#", ""), 16); // Converter HEX para INT
                    }
                    if (selectedEmbed.title) {
                        embedMessage.title = selectedEmbed.title;
                    }
                    if (selectedEmbed.description) {
                        embedMessage.description = selectedEmbed.description;
                    }
                    if (selectedEmbed.fields) {
                        embedMessage.fields = selectedEmbed.fields.map((field) => ({
                            name: field.name,
                            value: field.value,
                            inline: field.inline ?? false
                        }));
                    }
                    if (selectedEmbed.footer) {
                        embedMessage.footer = { text: selectedEmbed.footer };
                    }
                    if (selectedEmbed.thumbnail) {
                        embedMessage.thumbnail = { url: selectedEmbed.thumbnail };
                    }
                    const row = createRow(new ButtonBuilder({
                        customId: "manage/embed/modificar",
                        label: "Modificar",
                        style: ButtonStyle.Secondary
                    }), new ButtonBuilder({
                        customId: `manage/embed/deletar/${choice}`,
                        label: "Deletar Embed",
                        style: ButtonStyle.Danger
                    }), new ButtonBuilder({
                        customId: `manage/embed/components/${choice}`,
                        label: "Editar Componentes",
                        style: ButtonStyle.Primary
                    }), new ButtonBuilder({
                        customId: `manage/embed/enviar/${choice}`,
                        label: "Enviar embed",
                        style: ButtonStyle.Success
                    }));
                    // Responder ao usuário com o embed
                    return interaction.update({ embeds: [embedMessage], components: [row] });
                }
            }
        }
    },
});
