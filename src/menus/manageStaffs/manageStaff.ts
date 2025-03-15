import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";
import { createEmbed, createRow } from "@magicyan/discord";
import { settings } from "#settings";
import { db } from "#database";
import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";

export async function manageStaffMenu<R>(): Promise<R> {
    const roles = {
        superAdmins: await db.guilds.get<string[]>("superAdminRoles") || [],
        admins: await db.guilds.get<string[]>("adminRoles") || [],
        moderators: await db.guilds.get<string[]>("modRoles") || []
    }

    const embed = createEmbed({
        title: `Gerenciador de staffs`,
        description: `Cargos de staff:`,
        fields: [ 
            { name: "Super admins", inline: true, value: roles.superAdmins.length > 0 ? `<@&${roles.superAdmins.join('>, <@&')}>` : "`Nenhum`" },
            { name: "Admins", inline: true, value: roles.admins.length > 0 ? `<@&${roles.admins.join('>, <@&')}>` : "`Nenhum`" },
            { name: "Moderators", inline: true, value: roles.moderators.length > 0 ? `<@&${roles.moderators.join('>, <@&')}>` : "`Nenhum`" },
        ],
        color: settings.colors.danger
    });

    const row = createRow(
        new ButtonBuilder({
            customId: "manage/staffs/add",
            label: "Adicionar um cargo",
            style: ButtonStyle.Success
        }),
        new ButtonBuilder({
            customId: "manage/staffs/remove",
            label: "Remover um cargo",
            style: ButtonStyle.Danger
        }),
        new ButtonBuilder({
            customId: "return/dashboard",
            emoji: '↩️', 
            style: ButtonStyle.Secondary
        })
    );

    return ({
        flags,
        embeds: [embed],
        components: [row]
    } satisfies InteractionReplyOptions) as R;
}

// redirects

createResponder({
    customId: "manage/staffs/:redirect",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { redirect }) {
        switch(redirect) {
            case "add": { return interaction.update(menus.addStaff()) }
            case "remove": { return interaction.update(await menus.removeStaff(interaction)) }
            default: { return interaction.update(menus.dashBoard()) }
        }
    },
});
