import { createResponder, ResponderType } from "#base";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { menus } from "#menus";
import { userMention } from "discord.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../../data/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
createResponder({
    customId: "staff/:action",
    types: [ResponderType.Button, ResponderType.UserSelect, ResponderType.StringSelect], cache: "cached",
    async run(interaction) {
        const userSelectMenu = interaction.message.components[0].components[0];
        const idList = userSelectMenu.data.default_values?.map(v => v.id) ?? [];
        const stringSelectMenu = interaction.message.components[1].components[0];
        const role = stringSelectMenu.data.options.find(c => c.default)?.value ?? "";
        if (interaction.isUserSelectMenu()) {
            const ownerID = config.botOwnerID;
            const superAdmins = new Set(config.superAdmins);
            const admins = new Set(config.admins);
            const moderators = new Set(config.moderators);
            // IDs dos usuários selecionados na interação
            const choices = interaction.values; // Contém os IDs selecionados pelo usuário
            // Filtrar usuários que já possuem uma role
            const filteredUsers = choices.filter(userId => {
                return !(userId === ownerID || // Excluir o dono
                    superAdmins.has(userId) || // Excluir super administradores
                    admins.has(userId) || // Excluir administradores
                    moderators.has(userId) // Excluir moderadores
                );
            });
            interaction.update(menus.addStaff(interaction, filteredUsers));
            return;
        }
        else if (interaction.isStringSelectMenu()) {
            const choice = interaction.values[0];
            return interaction.update(menus.addStaff(interaction, idList, choice));
        }
        else {
            // Determina a configuração com base na role escolhida
            let roleConfig;
            if (role === "moderator") {
                roleConfig = config.moderators;
            }
            else if (role === "admin") {
                roleConfig = config.admins;
            }
            else {
                roleConfig = config.superAdmins;
            }
            // Atualiza a configuração com os novos IDs, evitando duplicatas
            const uniqueIds = Array.from(new Set([...roleConfig, ...idList]));
            // Atualiza o array no objeto `config`
            if (role === "moderator") {
                config.moderators = uniqueIds;
            }
            else if (role === "admin") {
                config.admins = uniqueIds;
            }
            else {
                config.superAdmins = uniqueIds;
            }
            // Salva a configuração atualizada no arquivo JSON (opcional, caso esteja em uso)
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
            return interaction.update({ content: `Os usuários: ${idList.map(userMention).join(", ")} foram transformados com sucesso em: **${role === "moderator" ? "Moderadores" : role === "admin" ? "Adiministradores" : "Super Administradores"}**`, embeds: [], components: [] });
        }
    },
});
