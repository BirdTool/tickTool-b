import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, userMention } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
export function deleteStaffMenu(interaction, staff, reasson) {
    const description = reasson ? `**Motivo do desligamento:** ${reasson}` : "Selecione um staff para remover";
    const embed = createEmbed({
        title: "Gerenciador de staffs",
        description: description,
        color: settings.colors.danger
    });
    if (staff) {
        embed.fields.insert(0, {
            name: "Staff selecionado:",
            value: `${userMention(staff.id)}, ${staff.id}`,
            inline: true
        });
    }
    const { superAdmins, admins, moderators } = config;
    const allStaffIds = [...superAdmins, ...admins, ...moderators];
    // Cria as opções para o menu de seleção
    const options = allStaffIds.map(id => {
        let role = "Moderador";
        if (superAdmins.includes(id))
            role = "Super Admin";
        else if (admins.includes(id))
            role = "Admin";
        return {
            label: `${interaction.client.users.cache.get(id)?.username || "Usuário"}`,
            description: `Cargo atual: ${role}`,
            value: id
        };
    });
    const row = [
        createRow(new StringSelectMenuBuilder({
            customId: "staff/delete/user",
            placeholder: "Selecione um staff para remover",
            options: options
        })),
        createRow(new ButtonBuilder({
            customId: "staff/delete/reasson",
            label: "Selecione o motivo",
            style: ButtonStyle.Primary,
            disabled: staff ? false : true
        }), new ButtonBuilder({
            customId: "staff/delete/confirm",
            label: "Confirmar",
            style: ButtonStyle.Success,
            disabled: staff && reasson ? false : true
        }))
    ];
    return {
        flags,
        embeds: [embed],
        components: row
    };
}
