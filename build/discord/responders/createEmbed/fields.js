import { createResponder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { TextInputStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { menus } from "#menus";
createResponder({
    customId: "embed/create/field/:action",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action }) {
        if (interaction.isButton()) {
            switch (action) {
                case "add": {
                    interaction.showModal({
                        customId: "embed/create/modal/fieldadd",
                        title: "Adicionar campo ao embed",
                        components: createModalFields({
                            name: {
                                label: "Nome do campo",
                                placeholder: "O nome do campo aqui",
                                style: TextInputStyle.Short,
                                maxLength: 256
                            },
                            value: {
                                label: "Valor do campo",
                                placeholder: "O valor do campo aqui",
                                style: TextInputStyle.Paragraph,
                                maxLength: 2000
                            },
                            inline: {
                                label: "Inline",
                                placeholder: "O campo será inline? - true/false padrão: true",
                                style: TextInputStyle.Short,
                                value: "true"
                            }
                        })
                    });
                    break;
                }
                case "remove":
                case "edit": {
                    const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
                    const fields = embed.data.fields || [];
                    const choiceFrom = action === "remove" ? "Remover" : "Editar";
                    if (!fields.length)
                        return interaction.reply(`Não há campos no embed para ${choiceFrom}`);
                    const fieldOptions = fields.map((field, index) => ({
                        label: field.name,
                        value: `${field.name}`
                    }));
                    const row = createRow(new StringSelectMenuBuilder({
                        customId: `select/field/${action}`,
                        placeholder: `Escolha um campo que deseja ${choiceFrom}`,
                        options: fieldOptions
                    }));
                    return interaction.update({ components: [row] });
                }
            }
        }
    },
});
createResponder({
    customId: "select/field/:select",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction, { select }) {
        const field = interaction.values[0];
        const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
        const fields = embed.data.fields || [];
        const fieldIndex = fields.findIndex(f => f.name === field);
        if (fieldIndex === -1)
            return interaction.reply("Campo não encontrado");
        if (select === "remove") {
            fields.splice(fieldIndex, 1);
        }
        else {
            interaction.showModal({
                customId: `embed/create/modal/field/${field}`,
                title: "Editar campo do embed",
                components: createModalFields({
                    name: {
                        label: "Nome do campo",
                        placeholder: "O nome do campo aqui",
                        style: TextInputStyle.Short,
                        maxLength: 256,
                        value: field
                    },
                    value: {
                        label: "Valor do campo",
                        placeholder: "O valor do campo aqui",
                        style: TextInputStyle.Paragraph,
                        maxLength: 2000,
                        value: fields[fieldIndex].value
                    },
                })
            });
        }
        embed.setFields(fields);
        interaction.update({ embeds: [embed], components: menus.createEmbed().components });
    },
});
createResponder({
    customId: "embed/create/modal/field/:field",
    types: [ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { field }) {
        const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
        const name = interaction.fields.getTextInputValue("name");
        const value = interaction.fields.getTextInputValue("value");
        const fields = embed.data.fields || [];
        const fieldIndex = fields.findIndex(f => f.name === field);
        if (fieldIndex !== -1) {
            fields[fieldIndex].name = name;
            fields[fieldIndex].value = value;
        }
        embed.setFields(fields);
        interaction.update({ embeds: [embed], components: menus.createEmbed().components });
    },
});
