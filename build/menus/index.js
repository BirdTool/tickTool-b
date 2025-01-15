import { createEmbedMenu, manageFieldsMenu } from "./createEmbed.js";
import { dashboardMenu } from "./dashboard.js";
import { manageEmbedsMenu } from "./manageEmbeds.js";
import { addStaffMenu } from "./manageStaffs/addStaff.js";
import { editStaffMenu } from "./manageStaffs/editStaff.js";
import { manageStaffMenu } from "./manageStaffs/manageStaff.js";
import { ticketAddMenu } from "./tickets/ticketAdd.js";
import { ticketsMenu } from "./tickets/tickets.js";
export const menus = {
    createEmbed: createEmbedMenu,
    manageFields: manageFieldsMenu,
    manageEmbeds: manageEmbedsMenu,
    dashBoard: dashboardMenu,
    tickets: ticketsMenu,
    ticketsAdd: ticketAddMenu,
    manageStaffs: manageStaffMenu,
    addStaff: addStaffMenu,
    editStaff: editStaffMenu
};
