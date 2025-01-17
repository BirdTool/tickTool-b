import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";
import { logChannel } from "../../../../functions/log.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../../data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createResponder({
    customId: "staff/delete/:action",
    types: [ResponderType.StringSelect, ResponderType.Button, ResponderType.ModalComponent],
    async run(interaction, { action }) {
        if (interaction.isStringSelectMenu()) {
            const staff = interaction.values[0];
            const staffUser = await interaction.client.users.fetch(staff);
            if (!staffUser)
                return interaction.reply({ content: "Usuário não encontrado", ephemeral: true });
            if (config.superAdmins.includes(staff) && config.superAdmins.includes(interaction.user.id)) {
                return interaction.reply({ content: "Apenas o dono pode remover um super admin", flags });
            }
            return interaction.update(menus.deleteStaff(interaction, staffUser));
        }
        else if (interaction.isButton()) {
            if (action === "reasson") {
                return interaction.showModal({
                    customId: "staff/delete/reassonModal",
                    title: "Motivo do desligamento",
                    components: createModalFields({
                        reasson: {
                            label: "Motivo do desligamento",
                            placeholder: "O motivo do desligamento aqui",
                            style: TextInputStyle.Paragraph,
                            required: true,
                            maxLength: 1000
                        }
                    })
                });
            }
            else {
                const staff = interaction.message.embeds[0].fields[0].value;
                const staffSplit = staff.split(", ");
                const staffUser = await interaction.client.users.fetch(staffSplit[1]);
                const reasson = interaction.message.embeds[0].description;
                // Remove o ID de todos os arrays de staff
                config.superAdmins = config.superAdmins.filter(id => id !== staffSplit[1]);
                config.admins = config.admins.filter(id => id !== staffSplit[1]);
                config.moderators = config.moderators.filter(id => id !== staffSplit[1]);
                // Salva as alterações no arquivo
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                logChannel(interaction, "Staff removido", `**Staff removido:** ${staffUser.username} (${staffUser.id})\n${reasson}`, interaction.user.username, interaction.user.displayAvatarURL({ extension: "png" }));
                return interaction.update({ content: `**Staff removido:** ${staffUser.username} (${staffUser.id})\n**Motivo:** ${reasson}`, components: [], embeds: [] });
            }
        }
        else {
            const reasson = interaction.fields.getTextInputValue("reasson");
            const staff = interaction.message.embeds[0].fields[0].value;
            const staffSplit = staff.split(", ");
            const staffUser = await interaction.client.users.fetch(staffSplit[1]);
            if (!reasson)
                return interaction.reply({ content: "Você precisa informar um motivo para o desligamento", ephemeral: true });
            return interaction.update(menus.deleteStaff(interaction, staffUser, reasson));
        }
    }
});
