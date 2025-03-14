import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Staff from "../../../class/staff.js";
interface ConfigJson {
    botOwnerID: string;
    ticketCategoryID: string;
    superAdmins: string[];
    admins: string[];
    moderators: string[];
    ticketsManage?: {
        [key: string]: TicketDetails;
    };
}

interface TicketDetails {
    ticketname: string; // nome do ticket
    labelMenu: string // nome do menu
    descriptionMenu?: string; // descrição no menu
    emojiMenu?: string; // emoji no menu
    ticketMessage?: string; // conteúdo ao abrir ticket
    embedMessage?: string; // embed ao abrir ticket
    closeTicketMessage?: string; // conteúdo ao fechar ticket
    closeTicketEmbedMessage?: string; // embed ao fechar ticket
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
    async run(interaction){
        const staff = new Staff(interaction);
        if(!staff.hasPosition(interaction.user.id, false, "admin")) {
            return interaction.reply({ content: `Você precisa ser um admin ou superior para gerenciar tickets`, flags })
        }
        switch(interaction.options.getSubcommand()){
            case "criar": {
                return interaction.reply(menus.ticketsAdd());
            }
            case "gerenciar": {
                const getTickets = (option: "quantity" | "listSelect"): number | string[] => {
                    // Caminho para o arquivo JSON
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, "../../data/config.json");
                
                    // Ler o arquivo JSON
                    const rawData = fs.readFileSync(filePath, "utf8");
                    const configJson: Record<string, ConfigJson> = JSON.parse(rawData);
                
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
                    return interaction.reply(menus.ticketsAdd())
                }
                return interaction.reply(menus.tickets());
            }
        }
        return;
    }
});