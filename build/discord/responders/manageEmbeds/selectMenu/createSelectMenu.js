import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { StringSelectMenuBuilder } from "discord.js";
createResponder({
    customId: "manage/stringSelectMenu/modal/:action",
    types: [ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { action }) {
        switch (action) {
            case "add": {
                const nameSelect = interaction.fields.getTextInputValue("name");
                const valueSelect = interaction.fields.getTextInputValue("value");
                const emojiSelect = interaction.fields.getTextInputValue("emoji") || "";
                const descriptionSelected = interaction.fields.getTextInputValue("description") || undefined;
                // Encontrar o componente original
                const originalComponent = interaction.message.components
                    .flatMap(row => row.components)
                    .find(c => c.customId === "none");
                if (!originalComponent) {
                    return interaction.reply({
                        content: "Erro: Select menu não encontrado.",
                        ephemeral: true,
                    });
                }
                // Reconstruir o StringSelectMenuBuilder
                const component = new StringSelectMenuBuilder()
                    .setCustomId(originalComponent.customId)
                    .setPlaceholder(originalComponent.placeholder || "")
                    .addOptions(...originalComponent.options.map(option => ({
                    label: option.label,
                    value: option.value,
                    emoji: option.emoji,
                    description: option.description
                })));
                // Adicionar nova opção
                component.addOptions({
                    label: nameSelect,
                    value: valueSelect,
                    emoji: emojiSelect || undefined,
                    description: descriptionSelected
                });
                // Criar o row atualizado
                const updatedRow = createRow(component);
                // Atualizar a mensagem
                return interaction.update({ components: [...menus.manageStringSelect(true).components, updatedRow] });
            }
        }
    },
});
