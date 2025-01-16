import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { isStaff } from "../../../functions/isStaff.js";
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
