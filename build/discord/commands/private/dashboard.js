import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandType } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Função para verificar se o ID está em botOwnerID, superAdmins, admins ou moderators
function isStaff(id, role) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    // Hierarquia dos cargos (ordem importa)
    const roleHierarchy = ["moderator", "admin", "superAdmin", "botOwner"];
    // Função para obter o nível do cargo do usuário
    const getUserRoleLevel = (id) => {
        if (config.botOwnerID === id)
            return roleHierarchy.indexOf("botOwner");
        if (config.superAdmins.includes(id))
            return roleHierarchy.indexOf("superAdmin");
        if (config.admins.includes(id))
            return roleHierarchy.indexOf("admin");
        if (config.moderators.includes(id))
            return roleHierarchy.indexOf("moderator");
        return -1; // Não tem cargo
    };
    const userRoleLevel = getUserRoleLevel(id);
    // Se o usuário não tiver um cargo
    if (userRoleLevel === -1)
        return false;
    // Se não foi fornecido um cargo para comparação, apenas verifica se o usuário tem um cargo válido
    if (!role)
        return true;
    // Verifica se o nível do usuário é igual ou superior ao nível do cargo fornecido
    const requiredRoleLevel = roleHierarchy.indexOf(role);
    return userRoleLevel >= requiredRoleLevel;
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
