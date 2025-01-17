import { ButtonBuilder, ButtonStyle, SelectMenuDefaultValueType, StringSelectMenuBuilder, userMention, UserSelectMenuBuilder } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { settings } from "#settings";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../discord/data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
function isSuperAdmin(id) {
    return config.superAdmins.includes(id);
}
export function addStaffMenu(interaction, users = [], role) {
    const levelAdmin = isSuperAdmin(interaction.user.id);
    const maxValues = levelAdmin ? 1 : 20;
    const roles = [
        { label: "Moderador", value: "moderator", emoji: "👤" },
        { label: "Admin", value: "admin", emoji: "👤" },
        { label: "Super Admin", value: "superAdmin", emoji: "👤", description: `Essa opção é perigosa, ${users.length} usuários terão acesso a Super Admin, tenha certeza do que está fazendo.` }
    ];
    const messageEmbed = users.length === 0 ? "Selecione ao menos um usuário" : users.length === 1 ? "Usuário selecionado:" : "Usuários selecionados:";
    const embed = createEmbed({
        title: "Adicionar Staff",
        description: `${messageEmbed} \n ${users.map(userMention).join(", ")}`,
        color: settings.colors.danger,
        footer: { text: levelAdmin ? "Super admin podem adicionar apenas 1 staff por vez" : "Dono pode adicionar até 20 staffs de uma vez", iconURL: interaction.user.avatarURL() ?? undefined },
        author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined }
    });
    if (role) {
        embed.fields.insert(0, {
            inline: true,
            name: "Cargo",
            value: role
        });
    }
    ;
    const components = [
        createRow(new UserSelectMenuBuilder({
            customId: "staff/add",
            placeholder: "Selecione os usuários",
            defaultValues: users.map(id => ({
                id, type: SelectMenuDefaultValueType.User
            })),
            maxValues: maxValues,
        })),
        createRow(new StringSelectMenuBuilder({
            customId: "staff/addRole",
            placeholder: "Selecione o cargo",
            options: roles ? roles.map(option => ({ ...option, default: option.value === role })) : roles,
            disabled: users.length < 1
        })),
        createRow(new ButtonBuilder({
            customId: "staff/addConfirm",
            label: "Confirmar",
            style: ButtonStyle.Success,
            disabled: users.length < 1 && !role
        }))
    ];
    return {
        flags,
        embeds: [embed],
        components: components
    };
}
