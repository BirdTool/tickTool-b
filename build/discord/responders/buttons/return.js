import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
createResponder({
    customId: "return/:redirect",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { redirect }) {
        switch (redirect) {
            case "dashBoard": {
                return interaction.update(menus.dashBoard());
            }
            case "manageStaff": {
                return interaction.update(await menus.manageStaffs());
            }
            case "tickets": {
                return interaction.update(menus.tickets());
            }
            default: {
                console.error("Não foi possível redirecionar", interaction.user.tag, "para o menu solicitado, foi redirecionado para o menu principal");
                return interaction.update(menus.dashBoard());
            }
        }
    },
});
