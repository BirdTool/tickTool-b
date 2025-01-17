import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { logChannel } from "../../../../functions/log.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../../data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createResponder({
    customId: "manage/staff/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isStringSelectMenu()) {
            switch (action) {
                case "edit": {
                    const choice = interaction.values[0];
                    const staff = interaction.client.users.cache.get(choice);
                    if (staff === undefined)
                        return interaction.reply({ content: "Usuário não encontrado", flags });
                    // verificar se o usuário é super admin e está tentando editar outro super admin
                    if (config.superAdmins.includes(staff.id) && config.superAdmins.includes(interaction.user.id)) {
                        return interaction.reply({ content: "Você não pode editar o staff de um super admin", flags });
                    }
                    ;
                    return interaction.update(await menus.editStaff(interaction, staff));
                }
                case "editRole": {
                    const choice = interaction.values[0];
                    const staff = interaction.message.embeds[0].fields[0].value;
                    const staffId = staff.split(", ")[1];
                    const staffUser = interaction.client.users.cache.get(staffId);
                    if (staffUser === undefined)
                        return interaction.reply({ content: "Usuário não encontrado", flags });
                    return interaction.update(await menus.editStaff(interaction, staffUser, choice));
                }
            }
        }
        else {
            const staff = interaction.message.embeds[0].fields[0].value;
            const staffId = staff.split(", ")[1];
            const staffUser = interaction.client.users.cache.get(staffId);
            if (staffUser === undefined)
                return interaction.reply({ content: "Usuário não encontrado", flags });
            const role = interaction.message.embeds[0].fields[1].value;
            if (role === "superAdmin") {
                if (config.superAdmins.includes(staffId)) {
                    return interaction.reply({ content: "Este usuário já é um super admin", flags });
                }
                else {
                    // Remove o ID dos outros arrays
                    config.admins = config.admins.filter(id => id !== staffId);
                    config.moderators = config.moderators.filter(id => id !== staffId);
                    // Adiciona ao array de super admins
                    config.superAdmins.push(staffId);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                }
            }
            else if (role === "admin") {
                if (config.admins.includes(staffId)) {
                    return interaction.reply({ content: "Este usuário já é um admin", flags });
                }
                else {
                    // Remove o ID dos outros arrays
                    config.superAdmins = config.superAdmins.filter(id => id !== staffId);
                    config.moderators = config.moderators.filter(id => id !== staffId);
                    // Adiciona ao array de admins
                    config.admins.push(staffId);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                }
            }
            else if (role === "moderator") {
                if (config.moderators.includes(staffId)) {
                    return interaction.reply({ content: "Este usuário já é um moderador", flags });
                }
                else {
                    // Remove o ID dos outros arrays
                    config.superAdmins = config.superAdmins.filter(id => id !== staffId);
                    config.admins = config.admins.filter(id => id !== staffId);
                    // Adiciona ao array de moderadores
                    config.moderators.push(staffId);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                }
            }
            logChannel(interaction, "Staff editado", `**Staff editado:** ${staffUser.username} (${staffUser.id})\n**Cargo:** ${role}`, interaction.user.username, interaction.user.displayAvatarURL({ extension: "png" }));
            return interaction.update({ content: `Staff ${staffUser.username} foi adicionado ao cargo de: ${role} \n > observação: é recomendado reiniciar o bot para que as alterações sejam aplicadas`, embeds: [], components: [] });
        }
    },
});
