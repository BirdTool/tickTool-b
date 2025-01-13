import { createResponder, ResponderType } from "#base";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { ButtonBuilder, ButtonStyle } from "discord.js";
createResponder({
    customId: "manage/embed/:action/:embedSelected",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { action, embedSelected }) {
        switch (action) {
            case "deletar": {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const filePath = path.resolve(__dirname, "../../data/embeds.json");
                // Ler o arquivo JSON
                const rawData = fs.readFileSync(filePath, "utf8");
                const embeds = JSON.parse(rawData);
                // Verificar se o embed existe
                if (!embeds[embedSelected]) {
                    await interaction.reply({ content: `O embed "${embedSelected}" não foi encontrado.`, ephemeral: true });
                    return;
                }
                // Remover o embed do objeto
                delete embeds[embedSelected];
                // Salvar o JSON atualizado
                fs.writeFileSync(filePath, JSON.stringify(embeds, null, 4), "utf8");
                // Responder ao usuário
                await interaction.update({ content: `O embed "${embedSelected}" foi deletado com sucesso!`, embeds: [], components: [] });
                break;
            }
            case "components": {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const filePath = path.resolve(__dirname, "../../data/embeds.json");
                // Ler o arquivo JSON
                const rawData = fs.readFileSync(filePath, "utf8");
                const embeds = JSON.parse(rawData);
                // Verificar se o embed existe
                if (!embeds[embedSelected]) {
                    await interaction.reply({ content: `O embed "${embedSelected}" não foi encontrado.`, ephemeral: true });
                    return;
                }
                const embed = createEmbed({
                    title: "Gerenciando componentes",
                    description: `> Aperte em button para gerenciar **um** botão de ticket
                    
                    > Aperte em selectMenu para ter mais opções de selectMenu`,
                    color: settings.colors.warning
                });
                const row = createRow(new ButtonBuilder({
                    customId: `manage/embed/button/component/${embedSelected}`,
                    label: "button",
                    style: ButtonStyle.Primary
                }), new ButtonBuilder({
                    customId: `manage/embed/selectMenu/component/${embedSelected}`,
                    label: "SelectMenu",
                    style: ButtonStyle.Primary
                }));
                return interaction.update({ embeds: [embed], components: [row] });
            }
        }
    },
});
