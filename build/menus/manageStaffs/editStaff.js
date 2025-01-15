import { StringSelectMenuBuilder, userMention } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { settings } from "#settings";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
export async function editStaffMenu(interaction) {
    // Obter nomes dos donos, admins e moderadores
    const botOwner = config.botOwnerID;
    const superAdmins = config.superAdmins;
    const admins = config.admins;
    const moderators = config.moderators;
    // Criação do embed
    const embed = createEmbed({
        title: `Gerenciador de staffs`,
        description: `Lista de staffs:`,
        fields: [
            {
                name: `Dono:`,
                value: `${userMention(botOwner)}`,
                inline: true
            },
            {
                name: `Super Admins:`,
                value: superAdmins.length > 0 ? `${superAdmins.map(userMention).join("\n")}` : "Nenhum",
                inline: true
            },
            {
                name: `Admins:`,
                value: admins.length > 0 ? `${admins.map(userMention).join("\n")}` : "Nenhum",
                inline: true
            },
            {
                name: `Moderadores:`,
                value: moderators.length > 0 ? `${moderators.map(userMention).join("\n")}` : "Nenhum",
                inline: true
            }
        ],
        color: settings.colors.danger
    });
    const row = [
        createRow(new StringSelectMenuBuilder({
            customId: "manage/staff/edit",
            placeholder: "Selecione qual staff deseja editar o cargo",
        }))
    ];
    return {
        flags,
        embeds: [embed],
        components: [row]
    };
}
