import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
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
createResponder({
    customId: "dashboard/admin/:action",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { action }) {
        switch (action) {
            case "manageEmbeds": {
                if (!isStaff(interaction.user.id, "admin")) {
                    return interaction.reply("Você não é um admin ou superior!");
                }
                return interaction.update(menus.manageEmbeds());
            }
            case "manageTickets": {
                if (!isStaff(interaction.user.id, "admin")) {
                    return interaction.reply("Você não é um admin ou superior!");
                }
                return interaction.update(menus.tickets());
            }
        }
    },
});
