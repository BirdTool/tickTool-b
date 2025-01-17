import { createResponder, ResponderType } from "#base";
import { isStaff } from "../../../functions/isStaff.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createResponder({
    customId: "set/:action",
    types: [ResponderType.ChannelSelect], cache: "cached",
    async run(interaction, { action }) {
        if (!isStaff(interaction.user.id, "superAdmin")) {
            return interaction.reply({ content: "Você não é um Super Admin ou superior!", flags });
        }
        ;
        if (action === "logsChannelID") {
            const choice = interaction.values[0];
            if (!choice)
                return interaction.reply({ content: "Selecione um canal de logs!", flags });
            config.logsChannelID = choice;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            return interaction.reply({ content: "Canal de logs selecionado com sucesso!", flags });
        }
        else {
            return interaction.reply({ content: "Esta interação não existe!", flags });
        }
    },
});
