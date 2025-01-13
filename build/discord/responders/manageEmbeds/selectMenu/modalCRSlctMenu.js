import { createResponder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";
createResponder({
    customId: "manage/stringSelectMenu/:action",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { action }) {
        switch (action) {
            case "addOption": {
                interaction.showModal({
                    customId: "manage/stringSelectMenu/modal/add",
                    title: "Adicionar Opção",
                    components: createModalFields({
                        name: {
                            label: "Nome da opção",
                            placeholder: "O nome da opção aqui",
                            style: TextInputStyle.Short,
                            maxLength: 30
                        },
                        value: {
                            label: "Ticket da opção",
                            placeholder: "O ticket da opção aqui (Leia o readme caso não saiba o que é)",
                            style: TextInputStyle.Short,
                            maxLength: 20
                        },
                        description: {
                            label: "descrição da opção",
                            placeholder: "A descrição da opção aqui",
                            style: TextInputStyle.Short,
                            maxLength: 50
                        },
                        emoji: {
                            label: "Emoji da opção",
                            placeholder: "O emoji da opção aqui",
                            style: TextInputStyle.Short,
                            maxLength: 20
                        }
                    })
                });
            }
            case "removeOption": {
                const originalComponent = interaction.message.components
                    .flatMap(row => row.components)
                    .find(c => c.customId === "none");
                return interaction.update({ components: originalComponent });
            }
        }
    },
});
