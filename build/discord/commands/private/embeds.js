import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } from "discord.js";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
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
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply("Você não tem permissão para usar esse comando");
        }
        ;
        switch (interaction.options.getSubcommand()) {
            case "criar": {
                return interaction.reply(menus.createEmbed());
            }
            case "gerenciar": {
                const getEmbeds = (option) => {
                    // Caminho para o arquivo JSON
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.resolve(__dirname, "../../data/embeds.json");
                    // Ler o arquivo JSON
                    const rawData = fs.readFileSync(filePath, "utf8");
                    const embeds = JSON.parse(rawData);
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
                    return interaction.reply(menus.createEmbed());
                }
                return interaction.reply(menus.manageEmbeds());
            }
        }
        return;
    }
});
