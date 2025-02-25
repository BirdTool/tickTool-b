import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { db } from "#database";
import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import Staff from "../../class/staff.js";
export async function removeRoleStaffMenu(interaction, role) {
    const embed = createEmbed({
        title: "Removendo um cargo",
        description: "Selecione um cargo para remover",
        color: settings.colors.danger
    });
    if (role) {
        embed.fields.push({
            name: "Cargo",
            value: role
        });
    }
    const roles = [
        await db.guilds.get("superAdminRoles") || [],
        await db.guilds.get("adminRoles") || [],
        await db.guilds.get("modRoles") || []
    ];
    async function getRoleName(roleId) {
        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        return role?.name || `Cargo desconhecido (ID: ${roleId})`;
    }
    const roleTypes = ["Super Admin", "Admin", "Moderator"];
    const options = await Promise.all(roles.flatMap((roleArray, index) => {
        const rolePosition = roleTypes[index];
        return roleArray.map(async (roleName) => ({
            label: await getRoleName(roleName),
            value: roleName,
            default: role === roleName ? true : false,
            description: rolePosition
        }));
    }));
    const components = [
        createRow(new StringSelectMenuBuilder({
            customId: "manageRoles/staff/remove/selectRole",
            placeholder: "Selecione o cargo",
            options
        })),
        createRow(new ButtonBuilder({
            customId: "manageRoles/staff/remove/confirm",
            label: "confirmar",
            style: ButtonStyle.Success,
            disabled: !role
        }), new ButtonBuilder({
            customId: "return/manageStaff",
            emoji: "↩️",
            style: ButtonStyle.Secondary
        }))
    ];
    return {
        flags, embeds: [embed], components
    };
}
;
// interações
createResponder({
    customId: "manageRoles/staff/remove/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction) {
        if (interaction.isStringSelectMenu()) {
            const choice = interaction.values[0];
            return interaction.update(await menus.removeStaff(interaction, choice));
        }
        else {
            const role = interaction.message.embeds[0].fields[0].value;
            const staff = new Staff(interaction);
            staff.remove(role);
            return interaction.update({ content: "cargo removido com sucesso!", embeds: [], components: [] });
        }
    },
});
