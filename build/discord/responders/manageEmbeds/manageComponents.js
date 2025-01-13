import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";
createResponder({
    customId: "manage/embed/:type/component/:embedSelected",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { type, embedSelected }) {
        switch (type) {
            case "button": {
                interaction.showModal({
                    customId: `manage/embed/button/modal/${embedSelected}`,
                    title: "Botão",
                    components: createModalFields({
                        name: {
                            label: "Nome do botão",
                            placeholder: "O nome do botão aqui",
                            style: TextInputStyle.Short,
                            required: true,
                            maxLength: 20
                        },
                        color: {
                            label: "Cor do botão",
                            placeholder: "A cor do botão (Success = verde, Danger = vermelho, Secondary = cinza, Primary = azul)",
                            style: TextInputStyle.Short,
                            required: true,
                            maxLength: 8,
                            value: "Success"
                        },
                        emoji: {
                            label: "Emoji do botão",
                            placeholder: "O emoji do botão aqui",
                            style: TextInputStyle.Short,
                            required: true,
                            maxLength: 20
                        }
                    })
                });
            }
            case "selectMenu": {
                return interaction.update(menus.manageStringSelect());
            }
        }
    },
});
