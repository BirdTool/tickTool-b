import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Staff from "../../../class/staff.js";

createCommand({
    name: "embed",
    description: "gerenciar embed",
    defaultMemberPermissions: ["Administrator"],
    options: [
        {
            name: "criar",
            description: "criar um embed",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "gerenciar",
            description: "gerenciar embeds",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const staff = new Staff(interaction);
        if(!staff.hasPosition(interaction.user.id, false, "admin")) {
            return interaction.reply({ content: `Você precisa ser um admin ou superior pra gerenciar embeds!`, flags })
        }
        switch(interaction.options.getSubcommand()){
            case "criar": {
                return interaction.reply(menus.createEmbed());
            }
            case "gerenciar": {
                type Embed = {
                    title?: string;
                    description?: string;
                    color: string;
                    fields?: Array<{
                        name: string;
                        value: string;
                        inline?: boolean;
                    }>;
                    author?: Array<{
                        name: string;
                        icon?: string;
                        url?: string
                    }>;
                    image?: string;
                    thumbnail?: string;
                    footer?: Array<{
                        text: string;
                        icon?: string;
                    }>
                };
                
                const getEmbeds = (option: "quantity" | "listSelect"): number | string[] => {
                    // Caminho para o arquivo JSON
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, "../../data/embeds.json");
                
                    // Ler o arquivo JSON
                    const rawData = fs.readFileSync(filePath, "utf8");
                    const embeds: Record<string, Embed> = JSON.parse(rawData);
                
                    // Processar a saída com base na opção
                    switch (option) {
                        case "quantity":
                            return Object.keys(embeds).length;
                
                        case "listSelect":
                            return Object.keys(embeds);
                
                        default:
                            throw new Error("Opção inválida.");
                    }
                };
                if (getEmbeds("quantity") === 0) {
                    return interaction.reply(menus.createEmbed())
                }
                return interaction.reply(menus.manageEmbeds());
            }
        }
        return;
    }
});