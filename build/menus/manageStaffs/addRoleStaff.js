import { ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder, SelectMenuDefaultValueType, StringSelectMenuBuilder } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { createResponder, ResponderType } from "#base";
import { db } from "#database";
export function addRoleStaffMenu(position, role) {
    const embed = createEmbed({
        title: "Gerenciando cargos",
        description: `Selecione a posição que deseja por o cargo`,
        color: settings.colors.danger
    });
    if (position) {
        embed.fields.push({
            name: "Posição",
            value: position
        });
    }
    if (role) {
        embed.fields.push({
            name: "Cargo",
            value: role
        });
    }
    const components = [
        createRow(new StringSelectMenuBuilder({
            customId: "manageRoles/staff/add/selectRolePosition",
            placeholder: "Selecione a posição",
            options: [
                { label: "Super Admin", value: "superAdmin", default: position === "superAdmin" ? true : false },
                { label: "Admin", value: "admin", default: position === "admin" ? true : false },
                { label: "Moderator", value: "moderator", default: position === "moderator" ? true : false }
            ]
        })),
        createRow(new RoleSelectMenuBuilder({
            customId: "manageRoles/staff/add/selectRole",
            placeholder: "Selecione o cargo",
            disabled: !position,
            defaultValues: role ? [{ id: role, type: SelectMenuDefaultValueType.Role }] : []
        })),
        createRow(new ButtonBuilder({
            customId: "manageRoles/staff/add/confirm",
            label: "Confirmar",
            disabled: !position && !role,
            style: ButtonStyle.Success
        }), new ButtonBuilder({
            customId: "return/manageStaff",
            label: "Retornar",
            style: ButtonStyle.Secondary
        }))
    ];
    return {
        flags, embeds: [embed], components
    };
}
// interações
createResponder({
    customId: "manageRoles/staff/add/:action",
    types: [ResponderType.StringSelect, ResponderType.RoleSelect, ResponderType.Button], cache: "cached",
    async run(interaction) {
        if (interaction.isStringSelectMenu()) {
            const position = interaction.values[0];
            const roles = interaction.message.embeds[0].fields[1]?.value || undefined;
            if (!position)
                return interaction.reply({ content: "Selecione uma posição!", flags });
            return interaction.update(addRoleStaffMenu(position, roles));
        }
        else if (interaction.isRoleSelectMenu()) {
            const position = interaction.message.embeds[0].fields[0].value;
            const role = interaction.values[0];
            const roles = {
                superAdmins: await db.guilds.get("superAdminRoles") || [],
                admins: await db.guilds.get("adminRoles") || [],
                moderators: await db.guilds.get("modRoles") || []
            };
            if (roles.superAdmins.includes(role) || roles.admins.includes(role) || roles.moderators.includes(role))
                return interaction.reply({ content: "Este cargo já está na lista de staffs", flags });
            if (!role)
                return interaction.reply({ content: "Selecione um cargo!", flags });
            return interaction.update(addRoleStaffMenu(position, role));
        }
        else if (interaction.isButton()) {
            const position = interaction.message.embeds[0].fields[0].value;
            const role = interaction.message.embeds[0].fields[1].value;
            if (!position || !role)
                return interaction.reply({ content: "Selecione uma posição e um cargo!", flags });
            const positionFormated = position === "superAdmin" ? "superAdminRoles" : position === "admin" ? "adminRoles" : "modRoles";
            const roles = await db.guilds.get(positionFormated) || [];
            roles.push(role);
            await db.guilds.set(positionFormated, roles);
            return interaction.update({ content: "Cargo adicionado com sucesso!", embeds: [], components: [] });
        }
    },
});
