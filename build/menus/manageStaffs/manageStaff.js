import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { settings } from "#settings";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
export async function manageStaffMenu(guild) {
    // Função para obter nomes de usuários por IDs
    const getUsernames = async (ids) => {
        const names = [];
        for (const id of ids) {
            try {
                const member = await guild.members.fetch(id).catch(() => undefined);
                names.push(member?.user.tag || `\`${id}\` (não encontrado)`);
            }
            catch {
                names.push(`\`${id}\` (não encontrado)`);
            }
        }
        return names;
    };
    // Obter nomes dos donos, admins e moderadores
    const botOwner = (await guild.members.fetch(config.botOwnerID)).user.tag;
    const superAdmins = await getUsernames(config.superAdmins);
    const admins = await getUsernames(config.admins);
    const moderators = await getUsernames(config.moderators);
    // Criação do embed
    const embed = createEmbed({
        title: `Gerenciador de staffs`,
        description: `Lista de staffs:`,
        fields: [
            {
                name: `Dono:`,
                value: `\`${botOwner}\``,
                inline: true
            },
            {
                name: `Super Admins:`,
                value: superAdmins.length > 0 ? `\`${superAdmins.join("\n")}\`` : "Nenhum",
                inline: true
            },
            {
                name: `Admins:`,
                value: admins.length > 0 ? `\`${admins.join("\n")}\`` : "Nenhum",
                inline: true
            },
            {
                name: `Moderadores:`,
                value: moderators.length > 0 ? `\`${moderators.join("\n")}\`` : "Nenhum",
                inline: true
            }
        ],
        color: settings.colors.danger
    });
    const row = createRow(new ButtonBuilder({
        customId: "manage/staffs/add",
        label: "Adicionar um staff",
        style: ButtonStyle.Success
    }), new ButtonBuilder({
        customId: "manage/staffs/edit",
        label: "Editar posição de staff",
        style: ButtonStyle.Primary
    }), new ButtonBuilder({
        customId: "manage/staffs/remove",
        label: "Remover um staff",
        style: ButtonStyle.Danger
    }), new ButtonBuilder({
        customId: "dashboard/return/dashBoard",
        emoji: '↩️',
        style: ButtonStyle.Secondary
    }));
    return {
        flags,
        embeds: [embed],
        components: [row]
    };
}
