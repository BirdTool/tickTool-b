import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
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
    name: "ticket",
    description: "gerenciar tickets",
    options: [
        {
            name: "criar",
            description: "criar um ticket",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "gerenciar",
            description: "gerenciar tickets",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        if (!isStaff(interaction.user.id, "admin")) {
            return interaction.reply({ content: `Você precisa ser um admin ou superior para gerenciar tickets`, flags });
        }
        switch (interaction.options.getSubcommand()) {
            case "criar": {
                return interaction.reply(menus.ticketsAdd());
            }
            case "gerenciar": {
                const getTickets = (option) => {
                    // Caminho para o arquivo JSON
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, "../../data/config.json");
                    // Ler o arquivo JSON
                    const rawData = fs.readFileSync(filePath, "utf8");
                    const configJson = JSON.parse(rawData);
                    // Processar a saída com base na opção
                    switch (option) {
                        case "quantity":
                            return Object.keys(configJson.ticketsManage).length;
                        case "listSelect":
                            return Object.keys(configJson.ticketsManage);
                        default:
                            throw new Error("Opção inválida.");
                    }
                };
                if (getTickets("quantity") === 0) {
                    return interaction.reply(menus.ticketsAdd());
                }
                return interaction.reply(menus.tickets());
            }
        }
        return;
    }
});
