import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, userMention } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { settings } from "#settings";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
export async function editStaffMenu(interaction, user, role) {
    // Obter nomes dos donos, admins e moderadores
    const { botOwnerID, superAdmins, admins, moderators } = config;
    // Criação do embed
    const embed = createEmbed({
        title: `Gerenciador de staffs`,
        description: `${user ? "Prossiga para editar o cargo do staff" : "Lista de staffs:"}`,
        color: settings.colors.danger
    });
    if (user) {
        embed.fields.insert(0, {
            name: "Staff selecionado:",
            value: `${userMention(user.id)}, ${user.id}`,
            inline: true
        });
    }
    else {
        embed.fields.insert(0, {
            name: `Dono:`,
            value: `${userMention(botOwnerID)}`,
            inline: true
        });
        embed.fields.insert(1, {
            name: `Super Admins:`,
            value: superAdmins.length > 0 ? `${superAdmins.map(userMention).join("\n")}` : "Nenhum",
            inline: true
        });
        embed.fields.insert(2, {
            name: `Admins:`,
            value: admins.length > 0 ? `${admins.map(userMention).join("\n")}` : "Nenhum",
            inline: true
        });
        embed.fields.insert(3, {
            name: `Moderadores:`,
            value: moderators.length > 0 ? `${moderators.map(userMention).join("\n")}` : "Nenhum",
            inline: true
        });
    }
    ;
    if (role) {
        embed.fields.insert(1, {
            name: "Cargo definido:",
            value: role,
            inline: true
        });
    }
    ;
    // Combina todos os IDs dos staffs em um único array
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
    // Função para obter as opções de cargo disponíveis
    const getAvailableRoles = (userId) => {
        const roles = [];
        if (!superAdmins.includes(userId)) {
            roles.push({ label: "Super Admin", value: "superAdmin" });
        }
        if (!admins.includes(userId)) {
            roles.push({ label: "Admin", value: "admin" });
        }
        if (!moderators.includes(userId)) {
            roles.push({ label: "Moderador", value: "moderador" });
        }
        return roles;
    };
    const row = [
        createRow(new StringSelectMenuBuilder({
            customId: "manage/staff/edit",
            placeholder: "Selecione qual staff deseja editar o cargo",
            options: options
        })),
        createRow(new StringSelectMenuBuilder({
            customId: "manage/staff/editRole",
            placeholder: "Selecione cargo queira colocar",
            options: user ? getAvailableRoles(user.id) : [
                { label: "Super Admin", value: "superAdmin" },
                { label: "Admin", value: "admin" },
                { label: "Moderador", value: "moderador" }
            ],
            disabled: user ? false : true
        })),
        createRow(new ButtonBuilder({
            customId: "manage/staff/editConfirm",
            label: "Confirmar",
            style: ButtonStyle.Success,
            disabled: user && role ? false : true
        }))
    ];
    return {
        flags,
        embeds: [embed],
        components: row
    };
}
