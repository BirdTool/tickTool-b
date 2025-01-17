import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
createResponder({
    customId: "manage/staffs/:action",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { action }) {
        switch (action) {
            case "add": {
                return interaction.update(menus.addStaff(interaction));
            }
            case "edit": {
                const editStaffMenu = await menus.editStaff(interaction);
                return interaction.update(editStaffMenu);
            }
            case "remove": {
                const deleteStaffMenu = await menus.deleteStaff(interaction);
                return interaction.update(deleteStaffMenu);
            }
        }
    },
});
