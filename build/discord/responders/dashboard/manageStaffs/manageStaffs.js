import { createResponder, ResponderType } from "#base";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { UserSelectMenuBuilder } from "@discordjs/builders";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createResponder({
    customId: "manage/staffs/:action",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { action }) {
        switch (action) {
            case "add": {
                const embed = createEmbed({
                    title: "Adicionar Staff",
                    description: "Selecione um usuário",
                    color: settings.colors.danger
                });
                const row = createRow(new UserSelectMenuBuilder({
                    custom_id: "staff/add",
                    placeholder: "Selecione um usuário",
                    max_values: 1
                }));
                return interaction.update({ embeds: [embed], components: [row] });
            }
        }
    },
});
