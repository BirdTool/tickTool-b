import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandType } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Função para verificar se o ID está em botOwnerID, superAdmins, admins ou moderators
function isStaff(id) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return (config.botOwnerID === id || // Verifica se é o dono
        config.superAdmins.includes(id) || // Verifica superAdmins
        config.admins.includes(id) || // Verifica admins
        config.moderators.includes(id) // Verifica moderators
    );
}
createCommand({
    name: "dashboard",
    description: "Menu do administrador",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const userId = interaction.user.id;
        if (!isStaff(userId)) {
            return interaction.reply({ content: "Você não tem permissão para acessar este menu.", flags });
        }
        return interaction.reply(menus.dashBoard());
    },
});
